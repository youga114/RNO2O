import React, { Component } from 'react';
import MapView, { 
	Marker, 
	Polyline
} from 'react-native-maps';
import shortestWay, { Node } from 'shortest-way';
import {
	View,
	StyleSheet,
	Text,
	ImageBackground,
	StatusBar,
	TouchableOpacity
} from 'react-native';

StatusBar.setBarStyle('light-content');

export default class Path extends Component {
	static navigationOptions = {
		title: "길찾기"
	};

	constructor(props) {
		super(props);
		this.state={
		  	region: {
	      		latitude: 37.6000641,
	      		longitude: 126.864399,
		        latitudeDelta:  0.003,
		        longitudeDelta: 0.0015
	    	},
			pic: this.props.navigation.getParam('pic'),
			path: []
		}
		this.pathArray=[];
	}

	componentDidMount(){
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.setState({
				  	region: {
				  		latitude: position.coords.latitude,
				  		longitude: position.coords.longitude,
				        latitudeDelta:  0.001,
				        longitudeDelta: 0.0005
					}
				});
		        var start = position.coords.latitude+"/"+position.coords.longitude;  //출발지와
		        var end = this.state.pic.latitude+"/"+this.state.pic.longitude;      //도착지
		        var startIndex;
		        var endIndex;

		        var minimum = 99999;
		        var minimum2 = 99999;
		        for (var i in pathNode) { //가장 가까운 노드를 찾음
		            var distance = Distance(start, pathNode[i].id);
		            if (distance < minimum) {
		                minimum = distance;
		                startIndex = i;
		            }
		            distance = Distance(end, pathNode[i].id);
		            if (distance < minimum2) {
		                minimum2 = distance;
		                endIndex = i;
		            }
		        }
		        for (var i in pathNode) {  //모든 노드들을 담음
		            this.pathArray.push(new Node({ id: pathNode[i].id }));
		        }
		        for (var i in pathNode) { //모든 노드들에
		            for (var j = 0; j < pathNode[i].next.length; j++) {
		                var str = pathNode[i].next[j].next; //다음 노드들을 입력
		                var index = find(str, pathNode);
		                if (index === null) {
		                    continue;
		                }
		                var distance = Distance(str, pathNode[i].id);
		                try {
		                    this.pathArray[i].addNext(this.pathArray[index], distance);
		                } catch (error) {
		                    console.log(error);
		                }
		            }
		        }
		        var results = this.pathArray[startIndex].compute(this.pathArray[endIndex], this.pathArray); //경로를 구함
		        var path = [];
		        path.push({
			  		latitude: position.coords.latitude,
			  		longitude: position.coords.longitude
		        });
		        results.map((node) => {
		            var temp = node.id.split("/");
		            path.push({
		            	latitude: parseFloat(temp[0]),
		            	longitude: parseFloat(temp[1])
		            })
		        });
		        path.push({
					latitude: this.state.pic.latitude,
					longitude: this.state.pic.longitude
		        });

		        this.setState({
		        	path: path
		        });
			},
	      	(error) => {
	      		console.log(error);
	      	}
		);

		this.watchID = navigator.geolocation.watchPosition(
			(position) => {
		        var start = position.coords.latitude+"/"+position.coords.longitude;  //출발지와
		        var end = this.state.pic.latitude+"/"+this.state.pic.longitude;      //도착지
		        var startIndex;
		        var endIndex;

		        var minimum = 99999;
		        var minimum2 = 99999;
		        for (var i in pathNode) { //가장 가까운 노드를 찾음
		            var distance = Distance(start, pathNode[i].id);
		            if (distance < minimum) {
		                minimum = distance;
		                startIndex = i;
		            }
		            distance = Distance(end, pathNode[i].id);
		            if (distance < minimum2) {
		                minimum2 = distance;
		                endIndex = i;
		            }
		        }
		        var results = this.pathArray[startIndex].compute(this.pathArray[endIndex], this.pathArray); //경로를 구함
		        var path = [];
		        path.push({
			  		latitude: position.coords.latitude,
			  		longitude: position.coords.longitude
		        });
		        results.map((node) => {
		            var temp = node.id.split("/");
		            path.push({
		            	latitude: parseFloat(temp[0]),
		            	longitude: parseFloat(temp[1])
		            })
		        });
		        path.push({
					latitude: this.state.pic.latitude,
					longitude: this.state.pic.longitude
		        });

		        this.setState({
		        	path: path
		        });
			},
			(error) => {

			},
			{ enableHighAccuracy: true, distanceFilter: 1 }
		);

	}

	componentWillUnmount(){
		navigator.geolocation.clearWatch(this.watchID);
	}

	render() {
		return (
			<View style={styles.container}>
				<MapView
    				ref={ref => { this.map = ref }}
          			initialRegion={this.state.region}
			    	style={styles.mapsee}
            		showsUserLocation = {true}
            		followsUserLocation = {true}
			  	>
			  		{
			  			(this.state.path!=='') ?
						<Polyline
							coordinates={this.state.path}
							strokeColor="tomato"
							strokeWidth={2}
						/>
						:
						null
					}
					<Marker
					  	coordinate={{
					  		latitude: this.state.pic.latitude,
					  		longitude: this.state.pic.longitude
						}}
						anchor={{ x: 0.5, y: 0.5 }}
					>
						<ImageBackground
					        onLoad={() => this.forceUpdate()}
							source={{uri: 'http://210.119.30.212:8000/nailPhoto/'+this.state.pic.filename}}
							style={styles.image}
						>
							<Text style={{height:0, width:0}}>{Math.random()}</Text>
						</ImageBackground>
					</Marker>
			  	</MapView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	image: {
	  	width:50,
	  	height: 40,
	  	opacity: 1
	},
	mapsee: {
	  	flex:1
	}
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

const LWLatLngtoTM = (zx_input) => {
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

const Distance = (a, b) => {    //(위도/경도)의 2쌍을 받아서 미터단위의 거리를 구하는 함수
    var start = a.split("/");
    var end = b.split("/");
    var rotate = LWLatLngtoTM(new LWLatLng(start[0], start[1]));
    var rotate1 = LWLatLngtoTM(new LWLatLng(end[0], end[1]));
    var distance = Math.sqrt(Math.pow(rotate.x - rotate1.x, 2) + Math.pow(rotate.y - rotate1.y, 2));
    return distance;  //미터 단위로 반환
}

const find = (str, arr) => {  //노드관리 배열에서 인덱스값을 찾기 위한 함수
    for (var i in arr) {
        if (arr[i].id == str) {
            return i;
        }
    }
    return null;
}

const pathNode = [
    {
        id: '37.60195/126.867064',
        next: [
            {next: '37.602327/126.866573'},
            {next: '37.601874/126.866973'},
            {next: '37.601534/126.867584'}
        ]
    },
    {
        id: '37.602327/126.866573',
        next: [
            {next: '37.602478/126.866393'},
            {next: '37.602259/126.866483'},
            {next: '37.60195/126.867064'}
        ]
    },
    {
        id: '37.602259/126.866483',
        next: [
            {next: '37.602305/126.866426'},
            {next: '37.602327/126.866573'},
            {next: '37.601874/126.866973'}
        ]
    },
    {
        id: '37.602305/126.866426',
        next: [
            {next: '37.601927/126.866242'},
            {next: '37.602259/126.866483'}
        ]
    },
    {
        id: '37.601927/126.866242',
        next: [
            {next: '37.601948/126.866159'},
            {next: '37.602305/126.866426'},
            {next: '37.601412/126.865985'}
        ]
    },
    {
        id: '37.601948/126.866159',
        next: [
            {next: '37.602357/126.866357'},
            {next: '37.601762/126.866063'},
            {next: '37.601927/126.866242'}
        ]
    },
    {
        id: '37.602357/126.866357',
        next: [
            {next: '37.602413/126.866294'},
            {next: '37.601948/126.866159'}
        ]
    },
    {
        id: '37.602413/126.866294',
        next: [
            {next: '37.602478/126.866393'},
            {next: '37.602357/126.866357'}
        ]
    },
    {
        id: '37.601874/126.866973',
        next: [
            {next: '37.602259/126.866483'},
            {next: '37.60195/126.867064'},
            {next: '37.601447/126.867527'}
        ]
    },
    {
        id: '37.601762/126.866063',
        next: [
            {next: '37.601518/126.865946'},
            {next: '37.601948/126.866159'}
        ]
    },
    {
        id: '37.601518/126.865946',
        next: [
            {next: '37.60159/126.865704'},
            {next: '37.60144/126.865909'},
            {next: '37.601762/126.866063'}
        ]
    },
    {
        id: '37.60159/126.865704',
        next: [
            {next: '37.601422/126.865629'},
            {next: '37.601841/126.86457'},
            {next: '37.601518/126.865946'}
        ]
    },
    {
        id: '37.60144/126.865909',
        next: [
            {next: '37.601412/126.865985'},
            {next: '37.601189/126.865791'},
            {next: '37.601518/126.865946'}
        ]
    },
    {
        id: '37.601381/126.866094',
        next: [
            {next: '37.601138/126.865985'},
            {next: '37.601412/126.865985'}
        ]
    },
    {
        id: '37.601138/126.865985',
        next: [
            {next: '37.60082/126.865846'},
            {next: '37.601381/126.866094'},
            {next: '37.601189/126.865791'}
        ]
    },
    {
        id: '37.60082/126.865846',
        next: [
            {next: '37.600506/126.865707'},
            {next: '37.601138/126.865985'}
        ]
    },
    {
        id: '37.601189/126.865791',
        next: [
            {next: '37.601138/126.865985'},
            {next: '37.600874/126.865635'},
            {next: '37.60144/126.865909'},
            {next: '37.601276/126.865536'}
        ]
    },
    {
        id: '37.600874/126.865635',
        next: [
            {next: '37.600562/126.86548'},
            {next: '37.601189/126.865791'},
            {next: '37.600949/126.865387'}
        ]
    },
    {
        id: '37.600562/126.86548',
        next: [
            {next: '37.600506/126.865707'},
            {next: '37.600874/126.865635'},
            {next: '37.600336/126.865369'},
            {next: '37.600627/126.865245'}
        ]
    },
    {
        id: '37.600506/126.865707',
        next: [
            {next: '37.600277/126.8656'},
            {next: '37.60082/126.865846'},
            {next: '37.600562/126.86548'}
        ]
    },
    {
        id: '37.600277/126.8656',
        next: [
            {next: '37.600312/126.865459'},
            {next: '37.600506/126.865707'}
        ]
    },
    {
        id: '37.600312/126.865459',
        next: [
            {next: '37.600336/126.865369'},
            {next: '37.600222/126.865427'},
            {next: '37.600277/126.8656'}
        ]
    },
    {
        id: '37.600336/126.865369',
        next: [
            {next: '37.600562/126.86548'},
            {next: '37.600312/126.865459'},
            {next: '37.600484/126.865197'},
            {next: '37.600147/126.865277'}
        ]
    },
    {
        id: '37.601422/126.865629',
        next: [
            {next: '37.601276/126.865536'},
            {next: '37.60159/126.865704'}
        ]
    },
    {
        id: '37.601276/126.865536',
        next: [
            {next: '37.601189/126.865791'},
            {next: '37.600949/126.865387'},
            {next: '37.601374/126.865181'},
            {next: '37.601422/126.865629'}
        ]
    },
    {
        id: '37.600949/126.865387',
        next: [
            {next: '37.600874/126.865635'},
            {next: '37.600627/126.865245'},
            {next: '37.601276/126.865536'},
            {next: '37.600989/126.865232'}
        ]
    },
    {
        id: '37.600627/126.865245',
        next: [
            {next: '37.600562/126.86548'},
            {next: '37.600484/126.865197'},
            {next: '37.600949/126.865387'},
            {next: '37.600706/126.864882'}
        ]
    },
    {
        id: '37.601374/126.865181',
        next: [
            {next: '37.601181/126.865095'},
            {next: '37.601276/126.865536'},
            {next: '37.601496/126.864774'}
        ]
    },
    {
        id: '37.601181/126.865095',
        next: [
            {next: '37.601125/126.865207'},
            {next: '37.601187/126.865052'},
            {next: '37.601374/126.865181'}
        ]
    },
    {
        id: '37.601125/126.865207',
        next: [
            {next: '37.600989/126.865232'},
            {next: '37.601181/126.865095'}
        ]
    },
    {
        id: '37.600989/126.865232',
        next: [
            {next: '37.600949/126.865387'},
            {next: '37.600897/126.865104'},
            {next: '37.601125/126.865207'},
            {next: '37.601039/126.86505'}
        ]
    },
    {
        id: '37.601187/126.865052',
        next: [
            {next: '37.601039/126.86505'},
            {next: '37.601181/126.865095'},
            {next: '37.601165/126.864943'}
        ]
    },
    {
        id: '37.601039/126.86505',
        next: [
            {next: '37.600989/126.865232'},
            {next: '37.601187/126.865052'},
            {next: '37.60092/126.864931'}
        ]
    },
    {
        id: '37.600897/126.865104',
        next: [
            {next: '37.600906/126.864978'},
            {next: '37.600989/126.865232'}
        ]
    },
    {
        id: '37.60092/126.864931',
        next: [
            {next: '37.601039/126.86505'},
            {next: '37.600997/126.864867'},
            {next: '37.600906/126.864978'}
        ]
    },
    {
        id: '37.600997/126.864867',
        next: [
            {next: '37.601092/126.864871'},
            {next: '37.60092/126.864931'}
        ]
    },
    {
        id: '37.601092/126.864871',
        next: [
            {next: '37.601156/126.864632'},
            {next: '37.601165/126.864943'},
            {next: '37.600997/126.864867'}
        ]
    },
    {
        id: '37.601165/126.864943',
        next: [
            {next: '37.601187/126.865052'},
            {next: '37.601092/126.864871'}
        ]
    },
    {
        id: '37.601496/126.864774',
        next: [
            {next: '37.601374/126.865181'},
            {next: '37.601156/126.864632'},
            {next: '37.601584/126.864628'}
        ]
    },
    {
        id: '37.601156/126.864632',
        next: [
            {next: '37.600912/126.864525'},
            {next: '37.601092/126.864871'},
            {next: '37.601496/126.864774'}
        ]
    },
    {
        id: '37.600912/126.864525',
        next: [
            {next: '37.600804/126.864578'},
            {next: '37.601156/126.864632'}
        ]
    },
    {
        id: '37.600804/126.864578',
        next: [
            {next: '37.600706/126.864882'},
            {next: '37.600912/126.864525'}
        ]
    },
    {
        id: '37.600706/126.864882',
        next: [
            {next: '37.600906/126.864978'},
            {next: '37.600627/126.865245'},
            {next: '37.600804/126.864578'}
        ]
    },
    {
        id: '37.600906/126.864978',
        next: [
            {next: '37.60092/126.864931'},
            {next: '37.600897/126.865104'},
            {next: '37.600706/126.864882'}
        ]
    },
    {
        id: '37.601841/126.86457',
        next: [
            {next: '37.601751/126.864536'},
            {next: '37.60159/126.865704'}
        ]
    },
    {
        id: '37.601751/126.864536',
        next: [
            {next: '37.601628/126.864482'},
            {next: '37.601841/126.86457'}
        ]
    },
    {
        id: '37.601628/126.864482',
        next: [
            {next: '37.601584/126.864628'},
            {next: '37.600667/126.864012'},
            {next: '37.601751/126.864536'}
        ]
    },
    {
        id: '37.601584/126.864628',
        next: [
            {next: '37.601496/126.864774'},
            {next: '37.601628/126.864482'}
        ]
    },
    {
        id: '37.600484/126.865197',
        next: [
            {next: '37.600336/126.865369'},
            {next: '37.600627/126.865245'},
            {next: '37.600366/126.865139'}
        ]
    },
    {
        id: '37.600667/126.864012',
        next: [
            {next: '37.600366/126.865139'},
            {next: '37.601628/126.864482'},
            {next: '37.600501/126.863951'}
        ]
    },
    {
        id: '37.600366/126.865139',
        next: [
            {next: '37.600484/126.865197'},
            {next: '37.600667/126.864012'},
            {next: '37.600212/126.865054'}
        ]
    },
    {
        id: '37.600222/126.865427',
        next: [
            {next: '37.600115/126.865367'},
            {next: '37.600084/126.865869'},
            {next: '37.600312/126.865459'}
        ]
    },
    {
        id: '37.600147/126.865277',
        next: [
            {next: '37.600115/126.865367'},
            {next: '37.600336/126.865369'},
            {next: '37.600212/126.865054'},
            {next: '37.599837/126.865128'}
        ]
    },
    {
        id: '37.600212/126.865054',
        next: [
            {next: '37.600366/126.865139'},
            {next: '37.600252/126.864893'},
            {next: '37.5999/126.864879'},
            {next: '37.600147/126.865277'}
        ]
    },
    {
        id: '37.600252/126.864893',
        next: [
            {next: '37.600339/126.864582'},
            {next: '37.600212/126.865054'}
        ]
    },
    {
        id: '37.600339/126.864582',
        next: [
            {next: '37.600431/126.864147'},
            {next: '37.599834/126.864335'},
            {next: '37.600252/126.864893'}
        ]
    },
    {
        id: '37.600431/126.864147',
        next: [
            {next: '37.600501/126.863951'},
            {next: '37.600339/126.864582'}
        ]
    },
    {
        id: '37.600501/126.863951',
        next: [
            {next: '37.600667/126.864012'},
            {next: '37.600431/126.864147'}
        ]
    },
    {
        id: '37.600084/126.865869',
        next: [
            {next: '37.599991/126.866196'},
            {next: '37.599997/126.865837'},
            {next: '37.600222/126.865427'}
        ]
    },
    {
        id: '37.599997/126.865837',
        next: [
            {next: '37.600115/126.865367'},
            {next: '37.599504/126.865595'},
            {next: '37.600084/126.865869'}
        ]
    },
    {
        id: '37.599504/126.865595',
        next: [
            {next: '37.599589/126.865279'},
            {next: '37.599997/126.865837'}
        ]
    },
    {
        id: '37.599589/126.865279',
        next: [
            {next: '37.599933/126.865416'},
            {next: '37.599602/126.865166'},
            {next: '37.599504/126.865595'}
        ]
    },
    {
        id: '37.599933/126.865416',
        next: [
            {next: '37.600115/126.865367'},
            {next: '37.599959/126.865298'},
            {next: '37.599589/126.865279'}
        ]
    },
    {
        id: '37.599959/126.865298',
        next: [
            {next: '37.600029/126.865322'},
            {next: '37.599723/126.865177'},
            {next: '37.599933/126.865416'}
        ]
    },
    {
        id: '37.599723/126.865177',
        next: [
            {next: '37.599742/126.86507'},
            {next: '37.599959/126.865298'}
        ]
    },
    {
        id: '37.599602/126.865166',
        next: [
            {next: '37.599632/126.865027'},
            {next: '37.599111/126.86493'},
            {next: '37.599589/126.865279'}
        ]
    },
    {
        id: '37.599632/126.865027',
        next: [
            {next: '37.599742/126.86507'},
            {next: '37.59948/126.864933'},
            {next: '37.599602/126.865166'},
            {next: '37.599695/126.864782'}
        ]
    },
    {
        id: '37.599991/126.866196',
        next: [
            {next: '37.599812/126.866463'},
            {next: '37.600084/126.865869'}
        ]
    },
    {
        id: '37.599812/126.866463',
        next: [
            {next: '37.600024/126.866693'},
            {next: '37.599991/126.866196'}
        ]
    },
    {
        id: '37.600024/126.866693',
        next: [
            {next: '37.600171/126.866712'},
            {next: '37.599812/126.866463'}
        ]
    },
    {
        id: '37.600171/126.866712',
        next: [
            {next: '37.601447/126.867527'},
            {next: '37.600024/126.866693'}
        ]
    },
    {
        id: '37.601447/126.867527',
        next: [
            {next: '37.601874/126.866973'},
            {next: '37.600171/126.866712'}
        ]
    },
    {
        id: '37.601534/126.867584',
        next: [
            {next: '37.60195/126.867064'}
        ]
    },
    {
        id: '37.599742/126.86507',
        next: [
            {next: '37.599837/126.865128'},
            {next: '37.599723/126.865177'},
            {next: '37.599632/126.865027'}
        ]
    },
    {
        id: '37.5999/126.864879',
        next: [
            {next: '37.599695/126.864782'},
            {next: '37.600212/126.865054'},
            {next: '37.599837/126.865128'}
        ]
    },
    {
        id: '37.599695/126.864782',
        next: [
            {next: '37.599632/126.865027'},
            {next: '37.599633/126.864763'},
            {next: '37.5999/126.864879'},
            {next: '37.599834/126.864335'}
        ]
    },
    {
        id: '37.601412/126.865985',
        next: [
            {next: '37.601927/126.866242'},
            {next: '37.601381/126.866094'},
            {next: '37.60144/126.865909'}
        ]
    },
    {
        id: '37.599834/126.864335',
        next: [
            {next: '37.599695/126.864782'},
            {next: '37.600339/126.864582'}
        ]
    },
    {
        id: '37.599837/126.865128',
        next: [
            {next: '37.600147/126.865277'},
            {next: '37.5999/126.864879'},
            {next: '37.599742/126.86507'}
        ]
    },
    {
        id: '37.599633/126.864763',
        next: [
            {next: '37.599677/126.864578'},
            {next: '37.599695/126.864782'}
        ]
    },
    {
        id: '37.599677/126.864578',
        next: [
            {next: '37.599593/126.864542'},
            {next: '37.599633/126.864763'}
        ]
    },
    {
        id: '37.599593/126.864542',
        next: [
            {next: '37.59948/126.864933'},
            {next: '37.599677/126.864578'}
        ]
    },
    {
        id: '37.599111/126.86493',
        next: [
            {next: '37.599166/126.8648'},
            {next: '37.598979/126.864873'},
            {next: '37.599602/126.865166'}
        ]
    },
    {
        id: '37.599166/126.8648',
        next: [
            {next: '37.59948/126.864933'},
            {next: '37.599111/126.86493'},
            {next: '37.599242/126.864486'},
            {next: '37.59883/126.86462'}
        ]
    },
    {
        id: '37.598746/126.863915',
        next: [
            {next: '37.598654/126.864246'},
            {next: '37.599334/126.864191'},
            {next: '37.598643/126.863938'}
        ]
    },
    {
        id: '37.598654/126.864246',
        next: [
            {next: '37.59891/126.864376'},
            {next: '37.598746/126.863915'}
        ]
    },
    {
        id: '37.59891/126.864376',
        next: [
            {next: '37.599242/126.864486'},
            {next: '37.598654/126.864246'},
            {next: '37.59883/126.86462'}
        ]
    },
    {
        id: '37.599242/126.864486',
        next: [
            {next: '37.599166/126.8648'},
            {next: '37.59891/126.864376'},
            {next: '37.599334/126.864191'}
        ]
    },
    {
        id: '37.599334/126.864191',
        next: [
            {next: '37.599242/126.864486'},
            {next: '37.598746/126.863915'}
        ]
    },
    {
        id: '37.598643/126.863938',
        next: [
            {next: '37.598563/126.864293'},
            {next: '37.598746/126.863915'}
        ]
    },
    {
        id: '37.598563/126.864293',
        next: [
            {next: '37.59861/126.864523'},
            {next: '37.59849/126.864256'},
            {next: '37.598643/126.863938'}
        ]
    },
    {
        id: '37.59861/126.864523',
        next: [
            {next: '37.59868/126.86456'},
            {next: '37.598563/126.864293'}
        ]
    },
    {
        id: '37.59868/126.86456',
        next: [
            {next: '37.598643/126.864657'},
            {next: '37.59883/126.86462'},
            {next: '37.59861/126.864523'}
        ]
    },
    {
        id: '37.59883/126.86462',
        next: [
            {next: '37.59891/126.864376'},
            {next: '37.599166/126.8648'},
            {next: '37.59868/126.86456'}
        ]
    },
    {
        id: '37.598979/126.864873',
        next: [
            {next: '37.598643/126.864657'},
            {next: '37.598616/126.864957'},
            {next: '37.599111/126.86493'}
        ]
    },
    {
        id: '37.598643/126.864657',
        next: [
            {next: '37.598501/126.864657'},
            {next: '37.59868/126.86456'},
            {next: '37.598979/126.864873'}
        ]
    },
    {
        id: '37.598501/126.864657',
        next: [
            {next: '37.598428/126.864796'},
            {next: '37.598643/126.864657'}
        ]
    },
    {
        id: '37.598616/126.864957',
        next: [
            {next: '37.598571/126.864841'},
            {next: '37.598354/126.865109'},
            {next: '37.598979/126.864873'}
        ]
    },
    {
        id: '37.598571/126.864841',
        next: [
            {next: '37.598428/126.864796'},
            {next: '37.598616/126.864957'}
        ]
    },
    {
        id: '37.598354/126.865109',
        next: [
            {next: '37.598428/126.864796'},
            {next: '37.59819/126.865602'},
            {next: '37.598616/126.864957'},
            {next: '37.598289/126.864977'}
        ]
    },
    {
        id: '37.598428/126.864796',
        next: [
            {next: '37.598348/126.864757'},
            {next: '37.598501/126.864657'},
            {next: '37.598571/126.864841'},
            {next: '37.598354/126.865109'}
        ]
    },
    {
        id: '37.598348/126.864757',
        next: [
            {next: '37.598204/126.864699'},
            {next: '37.598428/126.864796'}
        ]
    },
    {
        id: '37.598204/126.864699',
        next: [
            {next: '37.598263/126.864472'},
            {next: '37.598348/126.864757'}
        ]
    },
    {
        id: '37.59849/126.864256',
        next: [
            {next: '37.598343/126.86419'},
            {next: '37.598563/126.864293'}
        ]
    },
    {
        id: '37.598343/126.86419',
        next: [
            {next: '37.598263/126.864472'},
            {next: '37.59849/126.864256'}
        ]
    },
    {
        id: '37.598263/126.864472',
        next: [
            {next: '37.598148/126.864891'},
            {next: '37.598204/126.864699'},
            {next: '37.598343/126.86419'}
        ]
    },
    {
        id: '37.598148/126.864891',
        next: [
            {next: '37.597909/126.864787'},
            {next: '37.598016/126.865256'},
            {next: '37.598289/126.864977'},
            {next: '37.598263/126.864472'}
        ]
    },
    {
        id: '37.598289/126.864977',
        next: [
            {next: '37.598354/126.865109'},
            {next: '37.598148/126.864891'}
        ]
    },
    {
        id: '37.598016/126.865256',
        next: [
            {next: '37.597958/126.865501'},
            {next: '37.598148/126.864891'}
        ]
    },
    {
        id: '37.598029/126.865545',
        next: [
            {next: '37.597958/126.865501'},
            {next: '37.59819/126.865602'},
            {next: '37.597954/126.865816'}
        ]
    },
    {
        id: '37.59819/126.865602',
        next: [
            {next: '37.598045/126.866171'},
            {next: '37.59788/126.866801'},
            {next: '37.598354/126.865109'},
            {next: '37.598029/126.865545'}
        ]
    },
    {
        id: '37.598045/126.866171',
        next: [
            {next: '37.597863/126.866082'},
            {next: '37.59819/126.865602'}
        ]
    },
    {
        id: '37.602478/126.866393',
        next: [
            {next: '37.602327/126.866573'},
            {next: '37.602413/126.866294'}
        ]
    },
    {
        id: '37.600115/126.865367',
        next: [
            {next: '37.600222/126.865427'},
            {next: '37.600147/126.865277'},
            {next: '37.599997/126.865837'},
            {next: '37.599933/126.865416'}
        ]
    },
    {
        id: '37.600029/126.865322',
        next: [
            {next: '37.599959/126.865298'}
        ]
    },
    {
        id: '37.59948/126.864933',
        next: [
            {next: '37.599593/126.864542'},
            {next: '37.599166/126.8648'},
            {next: '37.599632/126.865027'}
        ]
    },
    {
        id: '37.597909/126.864787',
        next: [
            {next: '37.598148/126.864891'}
        ]
    },
    {
        id: '37.597958/126.865501',
        next: [
            {next: '37.598016/126.865256'},
            {next: '37.598029/126.865545'}
        ]
    },
    {
        id: '37.597954/126.865816',
        next: [
            {next: '37.598029/126.865545'}
        ]
    },
    {
        id: '37.597863/126.866082',
        next: [
            {next: '37.598045/126.866171'}
        ]
    },
    {
        id: '37.59788/126.866801',
        next: [
            {next: '37.59819/126.865602'}
        ]
    }
];