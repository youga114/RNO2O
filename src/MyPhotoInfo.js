import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	Text,
	Image,
	StatusBar,
	TouchableOpacity,
	Alert,
	Button
} from 'react-native';

StatusBar.setBarStyle('light-content');

export default class MyPhotoInfo extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	      	title: navigation.getParam('title'),
	      	headerRight: (
	        	<Button
	          		onPress={navigation.getParam('delete')}
	          		title="삭제"
	          		color="tomato"
	        	/>
	      	)
	    };
	};

	constructor(props) {
		super(props);
		this.state={
			pic: this.props.navigation.getParam('pic')
		}
	}

	componentDidMount() {
	    this.props.navigation.setParams({ delete: this._delete });
	}

	_delete = () => {
		Alert.alert(
		  	'',
		  	'삭제 하시겠습니까?',
		  	[
		    	{text: '취소', onPress: () => {

		    	}, style: 'cancel'},
		    	{text: '확인', onPress: () => {
			      	fetch('http://210.119.30.212:8000/delete',{
				  		headers: { 'Content-Type': 'application/json' }, // tells the server we have json
				      	method: 'POST',
				      	body: JSON.stringify({
				      		pic: this.state.pic
				      	})
			      	})
			      	.then((response) => response.json())
			      	.then((responseJson) => {
			      		if(responseJson===1){
			      			alert("삭제 되었습니다 :)");
			      			this.props.navigation.popToTop();
			      		}
			      		else{
			      			alert("오류로 인해 취소되었습니다 :(");
			      		}
			      	})
			      	.catch((error) => {
			         	console.error(error);
			      	});
		    	}},
		  	],
		  	{ cancelable: false }
		)
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
        backgroundColor: '#2980b6',
        paddingVertical: 15
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 20
    }
});