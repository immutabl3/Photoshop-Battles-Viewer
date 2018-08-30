import request from 'superagent';

export default {
	getJpg(url) {
		const relativeUrl = url.indexOf('/a/') > 0 ?
			`album/${url.substring(url.indexOf('/a') + 3)}` :
			url.indexOf('/gallery/') > 0 ?
				`gallery/${url.substring(url.indexOf('/gal') + 9)}` :
				url;

		return request.get(`/imgur?url=${relativeUrl}`)
			.then(res => res.body)
			.then(({ link }) => link);
	},
};