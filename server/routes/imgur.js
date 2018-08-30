import express from 'express';
import request from 'superagent';

const router = express.Router();
const imgurClientID = process.env.IMGUR_CLIENT_ID;

router.get('/imgur', function(req, res) {
	const { url } = req.query;

	return request.get(`https://api.imgur.com/3/${url}`)
		.set({ Authorization: `Client-ID ${imgurClientID}` })
		.type('form')
		.then(res => res.body)
		.then(body => body.data.images[0].link)
		.then(link => res.json({ link }));
});

export default router;