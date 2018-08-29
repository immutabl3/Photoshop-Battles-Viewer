export default function formatImageUrl(url) {
	// not a valid url
	if (!url || url.includes('http') === -1) return;

	if (url.includes('gifv')) {
		return url.replace('gifv', 'gif');
	}
	
	return `${url}.jpg`;
}