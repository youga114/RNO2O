import { combineReducers, createStore } from 'redux';

const initialState = {
	isLoggedIn: false,
	username: '',
	stops: []
};

const loginReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'LOGIN':
			return Object.assign({}, state, {
				isLoggedIn: true,
				username: action.username
			});
		case 'LOGOUT':
			return Object.assign({}, state, {
				isLoggedIn:false,
				username: ''
			});
		case 'ADDSTOP':
			var temp=state.stops;
			
			console.log(temp.push(action.stop));
			return Object.assign({}, state, {
				stops: temp
			});
		default:
			return state;
	}
};

const rootReducer = combineReducers({
	loginReducer
});

export default createStore(loginReducer);