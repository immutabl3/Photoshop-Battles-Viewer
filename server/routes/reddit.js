import express from 'express';
import request from 'superagent';
import btoa from 'btoa';

const router = express.Router();
const clientID = process.env.REDDIT_CLIENT_ID;

// requests an access token by using the clientID and custom deviceID. It then locally stores the token and its expiration.
router.get('/reddit/credentials', (req, res) => {
	const token = btoa(`${clientID}:`);
	const device = req.query.device;
	return request.post('https://www.reddit.com/api/v1/access_token')
		.type('form')
		.set({ Authorization: `Basic ${token}` })
		.send({
			grant_type: 'https://oauth.reddit.com/grants/installed_client',
			device_id: device,
		})
		.then(res => res.body)
		.then(data => {
			if (!data.access_token) throw new Error('missing access_token');
			return {
				token: data.access_token,
				expires: data.expires_in,
			};
		})
		.then(data => res.json(data));
});

// perform the subreddit get request after the user has valid token
router.get('/reddit/battles', (req, res) => {
	const token = req.query.token;
	const timeframe = req.query.timeframe;
	const after = req.query.after;
	return request.get(`https://oauth.reddit.com/r/photoshopbattles/top/?sort=top&t=${timeframe}&after=${after}`)
		.set({ Authorization: `Bearer ${token}` })
		.then(res => res.body)
		.then(body => res.json(body));
});

// perform the get request on the specific reddit post that the user clicks on
router.get('/reddit/post', function(req, res) {
	const permalink = req.query.url;
	const token = req.query.token;

	return request.get(`https://oauth.reddit.com${permalink}?sort=best`)
		.type('form')
		.set({ Authorization: `Bearer ${token}` })
		.then(res => res.body)
		.then(body => res.json(body));
});

export default router;