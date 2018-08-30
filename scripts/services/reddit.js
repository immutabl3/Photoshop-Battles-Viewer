import request from 'superagent';

const clientID = 'CKD4C_WLhbnNIQ';

export default {
	// requests an access token by using the clientID and custom deviceID. It then locally stores the token and its expiration.
	getCredentials() {
		return request.post('https://www.reddit.com/api/v1/access_token')
			.type('form')
			.set({ Authorization: `Basic ${global.btoa(`${clientID}:`)}` })
			.send({
				grant_type: 'https://oauth.reddit.com/grants/installed_client',
				device_id: global.localStorage.getItem('deviceID'),
			})
			.then(res => res.body)
			.then(data => {
				if (!data.access_token) throw new Error('missing access_token');
				return {
					token: data.access_token,
					expires: data.expires_in,
				};
			});
	},

	// perform the subreddit get request after the user has valid token
	getBattles({ timeFrame, paginationAfter }) {
		console.log(timeFrame);
		console.log(paginationAfter);
		return request.get(`https://oauth.reddit.com/r/photoshopbattles/top/?sort=top&t=${timeFrame}&after=${paginationAfter}`)
			.type('form')
			.set({ Authorization: `Bearer ${global.localStorage.getItem('accessToken')}` })
			.then(res => res.body);
	},

	// perform the get request on the specific reddit post that the user clicks on
	getPost(permalink) {
		return request.get(`https://oauth.reddit.com${permalink}?sort=best`)
			.type('form')
			.set({ Authorization: `Bearer ${global.localStorage.getItem('accessToken')}` })
			.then(res => res.body);
	},
};