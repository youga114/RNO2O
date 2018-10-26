import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapView, { Marker } from 'react-native-maps';
import {
	View,
    StyleSheet,
    Image,
    ImageBackground,
    Text,
    TouchableOpacity,
    Animated
} from 'react-native';
// import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

class Seemap extends Component {
  	static navigationOptions = {
		header: null,
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
		  	pics:[],
		  	showPics:[],
		  	radius: 300,
		  	bottomPics:[],
	  	}
	  	let map;
	}


	componentDidMount(){
		// RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
		// .then(data => {
		// 	alert(data);
		//     // The user has accepted to enable the location services
		//     // data can be :
		//     //  - "already-enabled" if the location services has been already enabled
		//     //  - "enabled" if user has clicked on OK button in the popup
		// }).catch(err => {
		//     // The user has not accepted to enable the location services or something went wrong during the process
		//     // "err" : { "code" : "ERR00|ERR01|ERR02", "message" : "message"}
		//     // codes : 
		//     //  - ERR00 : The user has clicked on Cancel button in the popup
		//     //  - ERR01 : If the Settings change are unavailable
		//     //  - ERR02 : If the popup has failed to open
		// });

		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.setState({
				  	region: {
				  		latitude: position.coords.latitude,
				  		longitude: position.coords.longitude,
				        latitudeDelta:  0.003,
				        longitudeDelta: 0.0015
					}
				});
				let rotate = LWLatLngtoTM(position.coords.latitude, position.coords.longitude);
		      	fetch('http://210.119.30.212:8000/bringPics',{
		  			headers: { 'Content-Type': 'application/json' }, // tells the server we have json
		      		method: 'POST',
		      		body: JSON.stringify({
					    tmx: rotate.x,
					    tmy: rotate.y,
						radius: this.state.radius
					})
		      	})
		      	.then((response) => response.json())
		      	.then((responseJson) => {
		      		let tempPics=new Array(responseJson.length);
		      		let timing=0;
		      		let newShowPics=[];
		      		responseJson.map((item,index) => {
			      		this.map.pointForCoordinate({ latitude: item.latitude, longitude: item.longitude })
						.then(
							(point) => {
								tempPics[index]=point;
								timing++;

								if(timing===responseJson.length){
									let flag;
									for(var i=0;i<responseJson.length;i++){
										flag=0;
										for(var j=0;j<newShowPics.length;j++){
											if((Math.abs(newShowPics[j][0].point.x-tempPics[i].x)<width*4)&&(Math.abs(newShowPics[j][0].point.y-tempPics[i].y)<height*4)){
												flag=1;
												break;
											}
										}
										if(flag===0){
											newShowPics.push([{pic: responseJson[i], point: tempPics[i]}]);
										}
										else{
											newShowPics[j].push({pic: responseJson[i], point: tempPics[i]});
										}
									}
						      		this.setState({
						      			pics:responseJson,
						      			showPics:newShowPics
						      		});
								}
							}
						)
						.catch(e => console.log(e))
		      		})
		      	})
		      	.catch((error) => {
		         	console.error(error);
		      	});
			},
	      	(error) => {
	      		console.log(error);
	      	}
		);

		this.watchID = navigator.geolocation.watchPosition(
			(position) => {
				let rotate = LWLatLngtoTM(position.coords.latitude, position.coords.longitude);
		      	fetch('http://210.119.30.212:8000/bringPics',{
		  			headers: { 'Content-Type': 'application/json' }, // tells the server we have json
		      		method: 'POST',
		      		body: JSON.stringify({
					    tmx: rotate.x,
					    tmy: rotate.y,
						radius: this.state.radius
					})
		      	})
		      	.then((response) => response.json())
		      	.then((responseJson) => {
		      		let tempPics=new Array(responseJson.length);
		      		let timing=0;
		      		let newShowPics=[];
		      		responseJson.map((item,index) => {
			      		this.map.pointForCoordinate({ latitude: item.latitude, longitude: item.longitude })
						.then(
							(point) => {
								tempPics[index]=point;
								timing++;

								if(timing===responseJson.length){
									let flag;
									for(var i=0;i<responseJson.length;i++){
										flag=0;
										for(var j=0;j<newShowPics.length;j++){
											if((Math.abs(newShowPics[j][0].point.x-tempPics[i].x)<width*4)&&(Math.abs(newShowPics[j][0].point.y-tempPics[i].y)<height*4)){
												flag=1;
												break;
											}
										}
										if(flag===0){
											newShowPics.push([{pic: responseJson[i], point: tempPics[i]}]);
										}
										else{
											newShowPics[j].push({pic: responseJson[i], point: tempPics[i]});
										}
									}
						      		this.setState({
						      			pics:responseJson,
						      			showPics:newShowPics
						      		});
								}
							}
						)
						.catch(e => console.log(e))
		      		})
		      	})
		      	.catch((error) => {
		         	console.error(error);
		      	});
			},
			(error) => {

			},
			{ enableHighAccuracy: true, timeout: 20000, distanceFilter: 30 }
		);
	}

	componentWillUnmount(){
		navigator.geolocation.clearWatch(this.watchID);
	}

	_onRegionChangeCompleteFun(region){
		let tempPics=new Array(this.state.pics);
		let timing=0;
		let newShowPics=[];
		this.state.pics.map((item,index) => {
			this.map.pointForCoordinate({ latitude: item.latitude, longitude: item.longitude })
			.then(
				(point) => {
					tempPics[index]=point;
					timing++;

					if(timing===this.state.pics.length){
						let flag;
						for(var i=0;i<this.state.pics.length;i++){
							flag=0;
							for(var j=0;j<newShowPics.length;j++){
								if((Math.abs(newShowPics[j][0].point.x-tempPics[i].x)<width*4)&&(Math.abs(newShowPics[j][0].point.y-tempPics[i].y)<height*4)){
									flag=1;
									break;
								}
							}
							if(flag===0){
								newShowPics.push([{pic: this.state.pics[i], point: tempPics[i]}]);
							}
							else{
								newShowPics[j].push({pic: this.state.pics[i], point: tempPics[i]});
							}
						}
			      		this.setState({
			      			showPics:newShowPics,
          					region:region
			      		});
					}
				}
			)
			.catch(e => console.log(e))
		})
	}

	render(){
		return (
			<View style={styles.content}>
				<MapView
    				ref={ref => { this.map = ref }}
          			initialRegion={this.state.region}
          			onRegionChangeComplete={
          				(region) => {
          					this._onRegionChangeCompleteFun(region);
          				}
          			}
			    	style={styles.mapsee}
            		showsUserLocation = {true}
            		followsUserLocation = {true}
            		onPress = {
            			() => {
            				this.setState({
            					bottomPics:[]
            				})
            			}
            		}
			  	>
			  		{
			  			this.state.showPics.map((item,index) => {
			  				return(
							  	<Marker
								  	coordinate={{
							      		latitude: item[0].pic.latitude,
							      		longitude: item[0].pic.longitude
						      		}}
									anchor={{ x: 0.5, y: 0.5 }}
						      		key={item[0].pic.PH_PK}
						      		onPress={ 
						      			() => {
											this.setState({
												bottomPics: this.state.showPics[index]
											})
						      			}
						      		}
								>
									<ImageBackground
						                onLoad={() => this.forceUpdate()}
										source={{uri: 'http://210.119.30.212:8000/nailPhoto/'+item[0].pic.filename}}
										style={styles.image}
									>
										<Text
											style={styles.photoNum}
										>
											{this.state.showPics[index].length}
										</Text>
										<Text style={{height:0, width:0}}>{Math.random()}</Text>
									</ImageBackground>
								</Marker>
			  				)
			  			})
			  		}
			  	</MapView>
			  	<Animated.ScrollView
		          	horizontal
		          	scrollEventThrottle={16}
		          	showsHorizontalScrollIndicator={false}
		          	style={styles.scrollView}
			  	>
			  		{
				  		this.state.bottomPics.map((item,index) => {
				  			return (
				  				<TouchableOpacity
				  					onPress={() => {
				  						this.props.navigation.navigate('Info',{ pic: this.state.bottomPics[index].pic, title: item.pic.title});
				  					}}
				  					key={item.pic.PH_PK+'clicked'}
				  				>
	    							<View style={styles.card}>
							          	<Image
	                						style={styles.cardImage}
							        	    source={{uri: 'http://210.119.30.212:8000/nailPhoto/'+item.pic.filename}}
	        								resizeMode="cover"
							          	/>
			  						</View>
			  					</TouchableOpacity>
				  			)
				  		},this)
			  		}
			  	</Animated.ScrollView>
			</View>
		);
	}
}

const width = 50;
const height = 40;

const CARD_HEIGHT = 100;
const CARD_WIDTH = CARD_HEIGHT + 50;

const styles = StyleSheet.create({
  content: {
  	flex:1
  },
  mapsee: {
  	flex:1
  },
  image: {
  	width:width,
  	height: height,
  	opacity: 1
  },
  scrollView: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    paddingVertical: 5,
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  card: {
    padding: 5,
    elevation: 2,
    backgroundColor: "#eee",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  photoNum: {
  	top: 1,
  	left: 1,
  	width:10,
  	height:10,
  	backgroundColor: "tomato",
  	borderRadius: 50,
  	color: "#fff",
  	margin: 0,
  	textAlign: "center",
  	fontSize: 7.5
  }
});

const LWLatLngtoTM = (latitude,longitude) => {
    var zx_phi = latitude / 180.0 * Math.PI;
    var zx_lambda = longitude / 180.0 * Math.PI;
    var zx_T = Math.pow(Math.tan(zx_phi), 2.0);
    var zx_C = 0.006739496775478856 * Math.pow(Math.cos(zx_phi), 2.0);
    var zx_A = (zx_lambda - 2.2165681500327987) * Math.cos(zx_phi);
    var zx_N = 6378137.0 / Math.sqrt(1.0 - 0.006694380022900686 * Math.pow(Math.sin(zx_phi), 2.0));
    var zx_M = 6378137.0 * (0.9983242984445848 * zx_phi - 0.0025146070728447813 * Math.sin(2.0 * zx_phi) + 0.0000026390466202308188 * Math.sin(4.0 * zx_phi) - 3.4180461367750593e-9 * Math.sin(6.0 * zx_phi));
    // Y 좌표 출력
    var zx_Y = 600000.0 + 1.0 * (zx_M - 4207498.019150324 + zx_N * Math.tan(zx_phi) * (Math.pow(zx_A, 2.0) / 2.0 + Math.pow(zx_A, 4.0) / 24.0 * (5.0 - zx_T + 9.0 * zx_C + 4.0 * Math.pow(zx_C, 2.0)) + Math.pow(zx_A, 6.0) / 720.0 * (61.0 - 58.0 * zx_T + Math.pow(zx_T, 2.0) + 600.0 * zx_C - 2.2240339359080226)));
    // X 좌표 출력
    var zx_X = 200000.0 + 1.0 * zx_N * (zx_A + Math.pow(zx_A, 3.0) / 6.0 * (1.0 - zx_T + zx_C) + Math.pow(zx_A, 5.0) / 120.0 * (5.0 - 18.0 * zx_T + Math.pow(zx_T, 2.0) + 72.0 * zx_C - 0.3908908129777736));
    return ({
    	x: zx_X,
    	y: zx_Y
    });
}

export default Seemap;