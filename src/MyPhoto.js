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

class MyPhoto extends Component {
	static navigationOptions = {
		title: "내가 올린 사진"
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
		  	bottomPics:[],
	  	}
	  	let map;
	}

	componentDidMount(){
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

		      	fetch('http://210.119.30.212:8000/bringMyPics',{
		  			headers: { 'Content-Type': 'application/json' }, // tells the server we have json
		      		method: 'POST',
		      		body: JSON.stringify({
		      			id: this.props.username
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

export default MyPhoto;