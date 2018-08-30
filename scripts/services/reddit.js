import request from 'superagent';

export default {
	// requests an access token by using the clientID and custom deviceID. It then locally stores the token and its expiration.
	getCredentials() {
		const device = global.localStorage.getItem('deviceID');
		return request.get(`/reddit/credentials?device=${device}`)
			.then(res => res.body);
	},

	// perform the subreddit get request after the user has valid token
	getBattles({ timeFrame, paginationAfter }) {
		const token = global.localStorage.getItem('accessToken');
		return request.get(`/reddit/battles?timeframe=${timeFrame}&after=${paginationAfter}&token=${token}`)
			.then(res => res.body);
	},

	// perform the get request on the specific reddit post that the user clicks on
	getPost(permalink) {
		const token = global.localStorage.getItem('accessToken');
		return request.get(`/reddit/post?url=${permalink}&token=${token}`)
			.then(res => res.body);
	},
};