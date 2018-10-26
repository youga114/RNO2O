import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Text,
	KeyboardAvoidingView
} from 'react-native';

class Login extends Component {
  	static navigationOptions = {
		header: null,
  	};

	constructor(props) {
		super(props);

		this.state = {
			id:"",
			pw:"",
			text:""
		};
	}

	_onPressButton = () => {
      	fetch('http://210.119.30.212:8000/login',{
	  		headers: { 'Content-Type': 'application/json' }, // tells the server we have json
	      	method: 'POST',
	      	body: JSON.stringify({
	      		id: this.state.id,
	      		password: this.state.pw
	      	})
      	})
      	.then((response) => response.json())
      	.then((responseJson) => {
	      	if(responseJson===0){
	      		this.setState({
	      			text:"아이디를 확인해 주세요"
	      		});
	      	}
	      	else if(responseJson===2){
	      		this.setState({
	      			text:"비밀번호를 확인해 주세요"
	      		});
	      	}
	      	else{
	      		this.props.LOGIN(this.state.id);
	       	}
      	})
      	.catch((error) => {
         	console.error(error);
      	});
	}

	_joinFun = () => {
		this.props.navigation.navigate("Join");
	}


	render(){
		return (
			<KeyboardAvoidingView behavior="padding" style={styles.container}>
				<View style={styles.top}>
					<Text
						style={styles.buttonText}
					>
						O2O기반의 지역정보 검색 시스템
					</Text>
				</View>
				<View style={styles.bottom}>
					<Text
						style={styles.text}
					>
						{this.state.text}
					</Text>
					<TextInput
						style={styles.input}
               			placeholder='아이디'
               			placeholderTextColor='rgba(225,225,225,0.7)'
               			underlineColorAndroid='transparent'
               			onChangeText={(text) => this.setState({id:text})}
               			maxLength = {40}
					>
					</TextInput>
					<TextInput
						style={styles.input}
               			placeholder='비밀번호'
               			placeholderTextColor='rgba(225,225,225,0.7)'
               			underlineColorAndroid='transparent'
               			onChangeText={(text) => this.setState({pw:text})}
               			maxLength = {40}
               			secureTextEntry={true}
					>
					</TextInput>
					<TouchableOpacity
						style={styles.buttonContainer}
						onPress={this._onPressButton}
					>
						<Text
							style={styles.buttonText}
						>
							로그인
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.buttonContainer}
						onPress={this._joinFun}
					>
						<Text
							style={styles.buttonText}
						>
							회원가입
						</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#2c3e50',
     	padding: 20
	},
	top: {
		flex: 4
	},
	bottom: {
		flex: 3
	},
    input:{
        height: 40,
        backgroundColor: 'rgba(225,225,225,0.2)',
        marginBottom: 10,
        padding: 10,
        color: '#fff'
    },
    buttonContainer:{
        backgroundColor: '#2980b6',
        paddingVertical: 15,
        marginBottom: 10
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 20
    },
    text:{
    	color: 'red',
    	padding: 10
    }
})

export default Login;