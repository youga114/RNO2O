import React, { Component } from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import App from './App';
import { Provider, connect } from 'react-redux';
import store from './src/store';
import { LOGIN } from './src/action';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

const mapStateToProps = state => ({
  isLoggedIn: state.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
  LOGIN: (id) => dispatch(LOGIN(id))
});

const AppContainer = connect(
	mapStateToProps,
  	mapDispatchToProps
)(App);

class MyApp extends Component {
	render(){
		return (
			<Provider store={store}>
				<AppContainer/>
			</Provider>
		);
	}
};

AppRegistry.registerComponent('RNO2O', () => MyApp);
