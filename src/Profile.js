import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Text
} from 'react-native';


class Profile extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
  }

  _logoutFun = () => {
    fetch('http://210.119.30.212:8000/logout')
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson!==0){
        this.props.LOGOUT();
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  render(){
  	return (
  		<View style={styles.container}>
        <View
          style={styles.top}
        >
          <Text style={styles.topText}>{this.props.username}님</Text>
          <TouchableOpacity
            onPress={this._logoutFun}
            style={styles.logoutContainer}
          >
            <Text style={styles.logoutText}>
              로그아웃
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={styles.bottom}
        >
    			<TouchableOpacity
    				style={styles.buttonContainer}
            onPress={() => {
              this.props.navigation.navigate('Upload');
            }}
    			>
    				<Text style={styles.buttonText}>
    					사진 업로드
    				</Text>
    			</TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              this.props.navigation.navigate('MyPhoto');
            }}
          >
            <Text style={styles.buttonText}>
              내가 올린 사진보기
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
		backgroundColor: '#fff',
     	padding: 20
	},
  input:{
    height: 40,
    backgroundColor: 'rgba(225,225,225,0.2)',
    marginBottom: 10,
    padding: 10,
    color: '#fff'
  },
  buttonContainer:{
    paddingVertical: 15
  },
  buttonText:{
    color: '#2980b6',
    fontWeight: '200'
  },
  logoutContainer:{
    margin:30,
    backgroundColor: '#f5f5f5',
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    width: 70
  },
  logoutText:{
      color: '#000',
      textAlign: 'center',
      fontWeight: '100'
  },
  top:{
    flex:1,
    borderBottomWidth:1,
    alignItems: 'center'
  },
  bottom:{
    padding:10,
    flex:2
  },
  topText:{
    textAlign: 'center',
    fontWeight: '500',
    margin: 30,
    fontSize: 20
  }
})

export default Profile;