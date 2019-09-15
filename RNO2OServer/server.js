var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var session = require("express-session");
var bodyParser = require('body-parser');
var fs = require("fs");
var multer = require("multer");  //업로드를 위함
var exifImage = require("exif").ExifImage;  //사진exif까기 위함
var Jimp = require("jimp");  //썸네일 이미지 생성

var app = express();

app.use(bodyParser());
app.use(session({
    secret: "secretKey#$^%",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

var option = {
//데이터 베이스를 사용하기 위한 프로그램 정보를 담은 객체
    host: 'localhost',
    user: "root",
    password: "alsgh",
    database: "o2o"
};
var conn = mysql.createPool(option);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var storage = multer.diskStorage({  //멀터의 옵션 지전
    destination: function (req, file, callback) {  //파일 저장 경로지정
        callback(null, filePath);
    },
    filename: function (req, file, callback) {  //저장할 파일이름 지정
        callback(null, Date.now() + ".jpg");
    }
});
var upload = multer({ storage: storage }); //멀터에 옵션을 넣은 것

app.post("/login", function (request, response) {//로그인 신청이 오면
	conn.getConnection(function(err,connection){
	    connection.query("select * from people where id=?", [request.body.id], function (error, data) { //아이디로 데이터베이스에서 검색
	        if (error) {
	            console.log(error);
	        } else {
	            if (data[0]) { //아이디가 존재하면                
	                if (data[0].password == request.body.password) { //비밀번호 일치하는 지 확인
					    var sess = request.session;
					    sess.check = request.body.id;
	                    response.send("1"); //로그인 성공
	                } else {  //비밀번호 불일치
	                    response.send("2"); //비밀번호 틀림
	                }
	            } //아이디가 없으면
	            else {
	                response.send("0");  //아이디 없음
	            }
	        }
		    connection.release();
	    });
	})
});

app.post("/idCheck", function (request, response) {//로그인 신청이 오면
    conn.getConnection(function(err,connection){
        connection.query("select * from people where id=?", [request.body.id], function (error, data) { //아이디로 데이터베이스에서 검색
            if (error) {
                console.log(error);
            } else {
                if (data[0]) { //아이디가 존재하면
                    response.send("1");  //아이디 있음
                }
                else {
                    response.send("0");
                }
            }
        });
    })
});

app.get("/logout", function (request, response) {//로그아웃 요청시
    request.session.destroy(function (error) {  //세션파괴
        if (error) {
            console.log(error);
        }
        response.send("1"); //세션파괴 후 응답으로 1을 전송
    })
});

app.get("/loginCheck", function (request, response) {//로그인 신청이 오면
	var sess = request.session;
	console.log(sess.check);
	if(sess.check==undefined){
		response.send("0"); 
	}
	else{
		response.send({id:sess.check});
	}
});

app.post("/bringPics", function (request, response) {//신청이 오면
	var radius = request.body.radius;
	var tmx = request.body.tmx;
	var tmy = request.body.tmy;
	conn.getConnection(function(err,connection){
	    connection.query("select * from photo where TMX BETWEEN "+(tmx-radius)+" AND "+(tmx+radius)+" and TMY BETWEEN "+(tmy-radius)+" AND "+(tmy+radius)+" order by good desc;", function (error, data) {//추천수가 높은 사진순으로 데이터 추출
	        if (error) {
	            console.log(error);
	        } else {
	        	response.send(data);
	        }
		    connection.release();
	    })
	})
});

app.post("/bringMyPics", function (request, response) {//신청이 오면
    conn.getConnection(function(err,connection){
        connection.query("select * from photo where id=? order by good desc;",[request.body.id], function (error, data) {//추천수가 높은 사진순으로 데이터 추출
            if (error) {
                console.log(error);
            } else {
                response.send(data);
            }
            connection.release();
        })
    })
});

app.post("/join", function (request, response){//회원가입 요청시
    conn.getConnection(function(err,connection){
        connection.query("insert into people (id, password) values(?,?)", [request.body.id, request.body.pw], function (error, data) {
            //데이터 베이스에 사용자를 추가
            if (error){
                console.log(error);
                response.send("0");
            }
            else {
                response.send("1");
            }
            connection.release();
        })
    })
});

app.get('/nailPhoto/:name',function (request,response){ 
    var filename = request.params.name;
    fs.exists(__dirname+'/public/nailPhoto/'+filename, function (exists) {
        if (exists) {
            fs.readFile(__dirname+'/public/nailPhoto/'+filename, function (err,data){
                response.end(data);
            });
        } else {
            response.end('file is not exists');
        }
    });
});

app.post("/upload", upload.single("image"), function (request, response) {        //사진 업로드 요청시 한 장의 이미지만 위에서 지정한 옵션으로 저장이 됨
    fs.readFile(filePath + "/" + request.file.filename, function (error, data) {  //해당 파일을 읽어와서
        if (error) {
            console.log(error);
        } else {            
            new exifImage({ image: data }, function (error, exifData) {//exif정보를 추출
                if (error) {  //exif가 없다면
                    fs.unlink(filePath + "/" + request.file.filename, function (error) { //파일 삭제
                        if (error) {
                            console.log(error);
                            response.send("error");
                        }
                        else {
                            response.send("noExif"); //exif데이터없음
                        }
                    })                    
                }
                else { //exif데이터 존재한다면
                    if (exifData.gps.GPSLatitude) {  //gps데이터 존재한다면
                        var filename = request.file.filename;
                        if (exifData.thumbnail.ImageWidth != null) {  //썸네일 이미지의 비율 길이 등이 존재하면 그것으로 썸네일 생성
                            var nailWidth = exifData.thumbnail.ImageWidth; //썸네일 가로
                            var nailHeight = exifData.thumbnail.ImageHeight;  //썸네일 세로
                            Jimp.read(filePath + "/" + filename, function (error, data) { //썸네일 이미지를 생성
                                data.resize(nailWidth, nailHeight).quality(85).write(nailPath + "/" + filename); //원하는 사이즈로 원하는 경로에 지정
                            });
                        }
                        else {
                            Jimp.read(filePath + "/" + filename, function (error, data) {  //썸네일 비율이 없다면
                                data.resize(512, Jimp.AUTO).quality(85).write(nailPath + "/" + filename);  //가로를 기준으로 비율을 맞춰서 생성
                            });
                        }
                        var tempLatitude = exifData.gps.GPSLatitude; //사진에 저장된 gps 위도
                        var tempLongitude = exifData.gps.GPSLongitude;  //경도
                        var latitude = tempLatitude[0] + tempLatitude[1] / 60 + tempLatitude[2] / 3600; //도분초를 내가 원하는 형태로 변경
                        var longitude = tempLongitude[0] + tempLongitude[1] / 60 + tempLongitude[2] / 3600;
                        conn.getConnection(function(err,connection){
                            connection.query("insert into photo (id,filename,latitude,longitude,comment,good,del) values(?,?,?,?,?,?,?)", [request.session.check, request.file.filename, latitude, longitude, request.body.text, 0, 0], function (error, data) { //해당 사진의 정보를 데이터베이스에 추가
                                if (error) {
                                    console.log(error);
                                    response.send("error");
                                } else {
                                    response.send("success");
                                }
                                connection.release();
                            })
                        })
                    }
                    else { //gps데이터가 없으면
                        fs.unlink(filePath + "/" + request.file.filename, function (error) { //파일 삭제
                            if (error) {
                                console.log(error);
                                response.send("error");
                            }
                            else {
                                response.send("noGps"); //exif데이터없음
                            }
                        })
                    }
                }
            });
        }
    });
});

app.post("/delete", function (request, response){//회원가입 요청시
    fs.unlink(filePath + "/" + request.body.pic.filename, function (error) {  //파일삭제
        if (error) {
            console.log(error);
            response.send("0");  //에러 전송
        } else {
            fs.unlink(nailPath + "/" + request.body.pic.filename, function (error) {  //썸네일 삭제
                if (error) {
                    console.log(error);
                    response.send("0");
                } else { //포토 기록에서 삭제
                    conn.getConnection(function(err,connection){
                        connection.query("delete from photo where PH_PK=?", [request.body.pic.PH_PK], function (error, data1) {
                            if (error) {
                                console.log(error);
                                response.send("0");
                            } else {
                                response.send("1");
                            }
                            connection.release();
                        })
                    })
                }
            });
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function LWLatLng(lat, lng) {
    this.id = "lwlatlng";
    this.lat = lat;
    this.lng = lng;
}
function LWTM(x, y) {
    this.id = "lwtm";
    this.x = x;
    this.y = y;
}
LWTM.prototype.x = function () {
    return this.x;
}
LWTM.prototype.y = function () {
    return this.y;
}
function LWLatLngtoTM(zx_input) {
    var zx_phi = zx_input.lat / 180.0 * Math.PI;
    var zx_lambda = zx_input.lng / 180.0 * Math.PI;
    var zx_T = Math.pow(Math.tan(zx_phi), 2.0);
    var zx_C = 0.006739496775478856 * Math.pow(Math.cos(zx_phi), 2.0);
    var zx_A = (zx_lambda - 2.2165681500327987) * Math.cos(zx_phi);
    var zx_N = 6378137.0 / Math.sqrt(1.0 - 0.006694380022900686 * Math.pow(Math.sin(zx_phi), 2.0));
    var zx_M = 6378137.0 * (0.9983242984445848 * zx_phi - 0.0025146070728447813 * Math.sin(2.0 * zx_phi) + 0.0000026390466202308188 * Math.sin(4.0 * zx_phi) - 3.4180461367750593e-9 * Math.sin(6.0 * zx_phi));
    // Y 좌표 출력
    var zx_Y = 600000.0 + 1.0 * (zx_M - 4207498.019150324 + zx_N * Math.tan(zx_phi) * (Math.pow(zx_A, 2.0) / 2.0 + Math.pow(zx_A, 4.0) / 24.0 * (5.0 - zx_T + 9.0 * zx_C + 4.0 * Math.pow(zx_C, 2.0)) + Math.pow(zx_A, 6.0) / 720.0 * (61.0 - 58.0 * zx_T + Math.pow(zx_T, 2.0) + 600.0 * zx_C - 2.2240339359080226)));
    // X 좌표 출력
    var zx_X = 200000.0 + 1.0 * zx_N * (zx_A + Math.pow(zx_A, 3.0) / 6.0 * (1.0 - zx_T + zx_C) + Math.pow(zx_A, 5.0) / 120.0 * (5.0 - 18.0 * zx_T + Math.pow(zx_T, 2.0) + 72.0 * zx_C - 0.3908908129777736));
    return new LWTM(zx_X, zx_Y);
}
function LWTMtoLatLng(zx_input) {
    var zx_M = 4207498.019150324 + (zx_input.y - 600000.0);
    var zx_mu1 = zx_M / 6367449.145908449;
    var zx_phi1 = zx_mu1 + 0.0025188265967581876 * Math.sin(2.0 * zx_mu1) + 0.0000037009490719640127 * Math.sin(4.0 * zx_mu1) + 7.447813877211132e-9 * Math.sin(6.0 * zx_mu1) + 1.7035993573185923e-11 * Math.sin(8.0 * zx_mu1);
    var zx_R1 = 6335439.327083876 / Math.pow(1.0 - 0.006694380022900686 * Math.pow(Math.sin(zx_phi1), 2.0), 1.5);
    var zx_C1 = 0.006739496775478856 * Math.pow(Math.cos(zx_phi1), 2.0);
    var zx_T1 = Math.pow(Math.tan(zx_phi1), 2.0);
    var zx_N1 = 6378137.0 / Math.sqrt(1.0 - 0.006694380022900686 * Math.pow(Math.sin(zx_phi1), 2.0));
    var zx_D = (zx_input.x - 200000.0) / (zx_N1 * 1.0);
    // 위도 출력
    var zx_phi = (zx_phi1 - (zx_N1 * Math.tan(zx_phi1) / zx_R1) * (Math.pow(zx_D, 2.0) / 2.0 - Math.pow(zx_D, 4.0) / 24.0 * (5.0 + 3.0 * zx_T1 + 10.0 * zx_C1 - 4.0 * Math.pow(zx_C1, 2.0) - 0.060655470979309706) + Math.pow(zx_D, 6.0) / 720.0 * (61.0 + 90.0 * zx_T1 + 298.0 * zx_C1 + 45.0 * Math.pow(zx_T1, 2.0) - 1.6983531874206717 - 3.0 * Math.pow(zx_C1, 2.0)))) * 180.0 / Math.PI;
    // 경도 출력
    var zx_lambda = 127 + ((1.0 / Math.cos(zx_phi1)) * (zx_D - (Math.pow(zx_D, 3.0) / 6.0) * (1.0 + 2.0 * zx_T1 + zx_C1) + (Math.pow(zx_D, 5.0) / 120.0) * (5.0 - 2.0 * zx_C1 + 28.0 * zx_T1 - 3.0 * Math.pow(zx_C1, 2.0) + 0.053915974203830846 + 24.0 * Math.pow(zx_T1, 2.0)))) * 180.0 / Math.PI;
    return new LWLatLng(zx_phi, zx_lambda);
}
////////////////////////////////////////////////////////////////////////////////////////////////까지가 연구실에 존재하는 종각이 형이 제작하신 위경도/TM좌표변환 코드 및 함수들
function Distance(a, b) {    //(위도/경도)의 2쌍을 받아서 미터단위의 거리를 구하는 함수
    var start = a.split("/");
    var end = b.split("/");
    var rotate = LWLatLngtoTM(new LWLatLng(start[0], start[1]));
    var rotate1 = LWLatLngtoTM(new LWLatLng(end[0], end[1]));
    var distance = Math.sqrt(Math.pow(rotate.x - rotate1.x, 2) + Math.pow(rotate.y - rotate1.y, 2));
    return distance;  //미터 단위로 반환
}

module.exports = app;