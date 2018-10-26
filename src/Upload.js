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
import ImagePicker from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RNFetchBlob from 'react-native-fetch-blob';


var options = {
  title: '사진 선택',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class Upload extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '사진 업로드',
      headerRight: (
        <Button
          onPress={navigation.getParam('upload')}
          title="업로드"
          color="tomato"
        />
      )
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ upload: this._upload });
  }

  constructor(props) {
    super(props);

    this.state={
      avatarSource:'',
      subject:'',
      content:''
    }
  }

  _myFun = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        console.log(response);
        if(response.latitude){
          this.setState({
            avatarSource: response
          });
        }
        else{
          alert("위치정보가 담겨있지 않은 사진입니다 :)");
          this.setState({
            avatarSource: ''
          });
        }
      }
    });
  }

  _upload = () => {
    if(this.state.avatarSource!==''){
      RNFetchBlob.fetch('POST','http://210.119.30.212:8000/upload',{
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data;'
        },
        [
          {
            name: 'image',
            filename: this.state.avatarSource.fileName,
            type: this.state.avatarSource.type,
            data: RNFetchBlob.wrap(this.state.avatarSource.uri)
          },
          {
            name : 'subject', 
            data : this.state.subject
          },
          {
            name : 'content', 
            data : this.state.content
          }
        ]
      )
      .then(res => {
        if(res.data==="success"){
          alert("감사합니다 :D");
          this.props.navigation.navigate('Profile');
        }
        else{
          alert("오류가 발생했습니다 :(");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    }
    else{
      alert('사진을 선택해주세요 :)');
    }
  }
  
  render(){
  	return (
  		<ScrollView style={styles.container}>
        <TouchableOpacity
          onPress={this._myFun}
          style={styles.image}
        >
          {
            (this.state.avatarSource==='') ?
            <FontAwesome name={'photo'} size={230}/> :
            <Image
              style={{width: 320, height: 230}}
              source={{uri: this.state.avatarSource.uri}}
            />
          }
        </TouchableOpacity>
        <View
          style={styles.content}
        >
          <TextInput
            style={styles.input}
            placeholder='제목'
            placeholderTextColor='rgba(225,225,225,0.7)'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({subject:text})}
            maxLength = {20}
          />
          <TextInput
            style={styles.contentInput}
            placeholder='내용'
            placeholderTextColor='rgba(225,225,225,0.7)'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({content:text})}
            maxLength = {100}
            multiline={true}
          />
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
  image: {
    flex: 1,
    margin: 5,
    alignItems: 'center'
  },
  content: {
    flex: 1,
    margin: 5,
    paddingTop: 10
  },
  input:{
    height: 40,
    backgroundColor: 'rgba(225,225,225,0.2)',
    marginBottom: 10,
    padding: 10,
    color: '#fff'
  },
  contentInput:{
    height: 150,
    backgroundColor: 'rgba(225,225,225,0.2)',
    marginBottom: 10,
    padding: 10,
    color: '#fff'
  }
});

export default Upload;