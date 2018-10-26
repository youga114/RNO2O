import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Text,
  	Image,
  	ScrollView,
  	Button
} from 'react-native';

class Join extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '회원가입',
      headerRight: (
        <Button
          onPress={navigation.getParam('joinFun')}
          title="가입"
          color="tomato"
        />
      )
    };
  };

  constructor(props) {
    super(props);
	this.state={
		idText: '',
		idColor: 'red',
		pwText: '',
		pwFlag: 0,
		id: '',
		pw: '',
		pw2: ''
	}
  }

  componentDidMount() {
    this.props.navigation.setParams({ joinFun: this._joinFun });
  }

  _idCheck = () => {
    fetch('http://210.119.30.212:8000/idCheck',{
		headers: { 'Content-Type': 'application/json' }, // tells the server we have json
	  	method: 'POST',
	  	body: JSON.stringify({
	  		id: this.state.id
	  	})
    })
    .then((response) => response.json())
    .then((responseJson) => {
    	if(responseJson==1){
    		this.setState({
    			idText: '이미 존재하는 아이디입니다',
    			idColor: 'tomato'
    		})
    	}
    	else{
    		this.setState({
    			idText: '사용할 수 있는 아이디입니다',
    			idColor: 'dodgerblue'
    		})
    	}
    })
    .catch((error) => {
     	console.error(error);
    });
  }

  _pwCheck = () => {
  	if(this.state.pw!==this.state.pw2){
  		this.setState({
  			pwText: '비밀번호가 일치하지 않습니다',
  			pwFlag: 0
  		})
  	}
  	else{
  		this.setState({
  			pwText: '',
  			pwFlag: 1
  		})
  	}
  }

  _joinFun = () => {
  	if(this.state.pwFlag===1&&this.state.idText==='사용할 수 있는 아이디입니다'){
	    fetch('http://210.119.30.212:8000/join',{
			headers: { 'Content-Type': 'application/json' }, // tells the server we have json
		  	method: 'POST',
		  	body: JSON.stringify({
		  		id: this.state.id,
		  		pw: this.state.pw
		  	})
	    })
	    .then((response) => response.json())
	    .then((responseJson) => {
	    	if(responseJson===1){
		    	alert("가입이 완료되었습니다 :)");
				this.props.navigation.navigate("Login");
	    	}
	    	else{
		    	alert("다시 시도해 주세요 :(");
	    	}
	    })
	    .catch((error) => {
	     	console.error(error);
	    });
  	}
  	else{
  		alert("아이디나 비밀번호를 다시 입력해주세요 :(");
  	}
  }
  
  render(){
  	return (
  		<ScrollView style={styles.container}>
        <View
          style={styles.content}
        >
          <TextInput
            style={styles.input}
            placeholder='아이디'
            placeholderTextColor='rgba(225,225,225,0.7)'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({id:text})}
            onBlur={this._idCheck}
            maxLength = {20}
          />
		  <Text
			style={{
				color: this.state.idColor,
				marginBottom: 5
			}}
		  >
			{this.state.idText}
		  </Text>
          <TextInput
            style={styles.contentInput}
            placeholder='비밀번호'
            placeholderTextColor='rgba(225,225,225,0.7)'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({pw:text})}
            maxLength = {20}
            secureTextEntry = {true}
          />
          <TextInput
            style={styles.contentInput}
            placeholder='비밀번호 확인'
            placeholderTextColor='rgba(225,225,225,0.7)'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({pw2:text})}
            onBlur={this._pwCheck}
            maxLength = {20}
            secureTextEntry = {true}
          />
		  <Text
			style={{
				color: 'red',
				marginBottom: 5
			}}
		  >
			{this.state.pwText}
		  </Text>
        </View>
      </ScrollView>
  	);
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#2c3e50',
    padding: 20
  },
  content: {
    flex: 1,
    margin: 5,
    paddingTop: 10
  },
  input:{
    height: 40,
    backgroundColor: 'rgba(225,225,225,0.2)',
    marginBottom: 5,
    padding: 10,
    color: '#fff'
  },
  contentInput:{
    height: 40,
    backgroundColor: 'rgba(225,225,225,0.2)',
    marginBottom: 10,
    padding: 10,
    color: '#fff'
  }
});

export default Join;