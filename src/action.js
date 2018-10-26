export const LOGIN = (username) => {
	const action = {
		type: 'LOGIN',
		username: username	
	};
	return action;
};
export const LOGOUT = () => {
	const action = {
		type: 'LOGOUT',
		username: ''
	};
	return action;
};
export const ADDSTOP = (stop) => {
	const action = {
		type: 'ADDSTOP',
		stop: stop	
	};
	return action;
};