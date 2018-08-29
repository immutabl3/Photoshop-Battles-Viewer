import parseTitleAndImageUrl from './parseTitleAndImageUrl';
import isImgurLink from './isImgurLink';
import formatImageUrl from './formatImageUrl';
import imgur from '../services/imgur';

export default async function shop(photoshop) {
	const author = photoshop.author;
	// remove those stupid \n line breaks from the innerHTML
	const body = photoshop.body.replace('\n', ' ');
	const link = `https://www.reddit.com${photoshop.permalink}`;
	const {
		title,
		imageUrl,
	} = parseTitleAndImageUrl(body);
	const url = isImgurLink(imageUrl) ? 
		await imgur.getJpg(imageUrl) : 
		imageUrl;

	const imageURL = formatImageUrl(url);
	if (!imageURL) return;
		
	return {
		title,
		author,
		link,
		imageURL,
	};
};