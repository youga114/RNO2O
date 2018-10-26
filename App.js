import React, { Component } from 'react';
import {
  createStackNavigator,
  createBottomTabNavigator
} from 'react-navigation';
import Seemap from './src/Seemap';
import PhotoInfo from './src/PhotoInfo';
import MyPhotoInfo from './src/MyPhotoInfo';
import Path from './src/Path';
import Profile from './src/Profile';
import Upload from './src/Upload';
import MyPhoto from './src/MyPhoto';
import Login from './src/Login';
import Join from './src/Join';
import { LOGIN, LOGOUT, ADDSTOP } from './src/action';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

const mapStateToProps = state => ({
  username: state.username
})

const mapDispatchToProps = dispatch => ({
  LOGIN: (id) => dispatch(LOGIN(id))
});

const mapDispatchToProps2 = dispatch => ({
  LOGOUT: () => dispatch(LOGOUT())
});

const ProfileContainer = connect(
  mapStateToProps,
  mapDispatchToProps2
)(Profile);

const LoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

const MyPhotoContainer = connect(
  mapStateToProps
)(MyPhoto);

const mapStateToProps2 = state => ({
  stops: state.stops
})

const mapDispatchToProps3 = dispatch => ({
  ADDSTOP: (stop) => dispatch(ADDSTOP(stop))
});

const PhotoInfoContainer = connect(
  mapStateToProps2,
  mapDispatchToProps3
)(PhotoInfo);

const LoginStack = createStackNavigator(
  {
    Login: LoginContainer,
    Join: Join
  }
);

const MapStack = createStackNavigator(
  {
    Map: Seemap,
    Info: PhotoInfoContainer,
    Path: Path
  }
);

const ProfileStack = createStackNavigator(
  {
    Profile: ProfileContainer,
    Upload: Upload,
    MyPhoto: MyPhotoContainer,
    Info: MyPhotoInfo
  }
);

const Main = createBottomTabNavigator(
  {
    Map: MapStack,
    Profile: ProfileStack
  },
  {
      navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
          const { routeName } = navigation.state;
          let iconName;
          if (routeName === 'Map') {
            iconName = `ios-map${focused ? '' : '-outline'}`;
          } else if (routeName === 'Profile') {
            iconName = `ios-person${focused ? '' : '-outline'}`;
          }

          // You can return any component that you like here! We usually use an
          // icon component from react-native-vector-icons
          return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray'
      }
  }
);

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount(){
    fetch('http://210.119.30.212:8000/loginCheck')
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson!==0){
        this.props.LOGIN(responseJson.id);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  render(){
    if(this.props.isLoggedIn===true){
      return (
        <Main />
      );
    }
    return (
      <LoginStack />
    );
  }
}

export default App;