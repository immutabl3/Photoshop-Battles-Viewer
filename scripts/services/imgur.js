import request from 'superagent';

const imgurClientID = 'e14d0c3e92233e1';

export default {
	getJpg(url) {
		const relativeUrl = url.indexOf('/a/') > 0 ?
			`album/${url.substring(url.indexOf('/a') + 3)}` :
			url.indexOf('/gallery/') > 0 ?
				`gallery/${url.substring(url.indexOf('/gal') + 9)}` :
				url;
		debugger;
		return request.get(`https://api.imgur.com/3/${relativeUrl}`)
			.set({ Authorization: `Client-ID ${imgurClientID}` })
			.type('form')
			.then(res => res.body)
			.then(body => body.data.images[0].link);
	},
};