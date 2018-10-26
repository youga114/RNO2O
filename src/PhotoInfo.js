import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	Text,
	Image,
	StatusBar,
	TouchableOpacity
} from 'react-native';

StatusBar.setBarStyle('light-content');

export default class PhotoInfo extends Component {
	static navigationOptions = ({navigation}) => {
	    return {
			title: navigation.getParam('title')
		}
	};

	constructor(props) {
		super(props);
		this.state={
			pic: this.props.navigation.getParam('pic')
		}
	}

	_roadFind = () => {
        this.props.navigation.navigate('Path',{ pic: this.state.pic } );
	}

	_addPath = () => {
		this.props.ADDSTOP(this.state.pic);
		alert("경유지에 추가 되었습니다 :)");
	}

	render() {
		return (
			<View style={styles.container}>
	          	<Image
					style={styles.image}
	        	    source={{uri: 'http://210.119.30.212:8000/nailPhoto/'+this.state.pic.filename}}
	          	/>
				<Text
					style={styles.content}
				>
					{this.state.pic.comment}
				</Text>
				<View
					style={{
						flex: 1,
						padding: 5,
        				flexDirection: 'row'
					}}
				>
					<TouchableOpacity
						style={styles.buttonContainer}
						onPress={this._roadFind}
					>
						<Text
							style={styles.buttonText}
						>
							길찾기
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#2c3e50',
     	padding: 20
	},
	image: {
		flex: 3,
		padding: 5
	},
	content: {
		flex: 3,
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
		color: 'white',
		paddingTop: 10
	},
    buttonContainer:{
    	margin:5,
        backgroundColor: '#2980b6',
        paddingVertical: 10,
        flex: 1
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 20
    }
});