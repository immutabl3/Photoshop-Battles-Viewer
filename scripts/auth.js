import reddit from './services/reddit';
import uuid from 'uuid/v4';
import date from './utils/date';

// check if user has valid auth token and its expiration. 
// If the token is going to expire in less than 5 minutes, it will grab a new token.
const validToken = function() {
	if (!global.localStorage.getItem('accessToken')) return false;

	const currentDate = new Date();
	const expires = new Date(global.localStorage.getItem('expires'));
	const difference = expires.getTime() - currentDate.getTime();
	const minutesDifference = Math.ceil(difference / (1000 * 60));
	return minutesDifference < 5;
};

export default async function auth() {
	// checks if the user already has a device ID locally stored. It will set one if they do not or it will continue with the request if they do.
	if (!global.localStorage.getItem('deviceID')) global.localStorage.setItem('deviceID', uuid());
	if (validToken()) return;

	const { token, expires } = await reddit.getCredentials();
	global.localStorage.setItem('accessToken', token);
	global.localStorage.setItem(
		'expires',
		date.addHours(expires / 3600)
	);
};