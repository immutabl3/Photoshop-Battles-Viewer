import capitalize from 'lodash/capitalize';

export default function originalArea({
	title = '',
	image = '',
}) {
	const originalTitle = capitalize(
		title
			.replace(/^PsBattle: /i, '')
			.replace(/this /i, '')
	);
	// if the url is http change it to https to prevent tracker protection
	const secureImage = image.indexOf('http:') > -1 ?
		image.replace('http', 'https') :
		image;

	// add the original reddit post image to the left
	return {
		title: originalTitle,
		image: secureImage,
	};
};