export default function isImgurLink(url) {
	return url.indexOf('/a/') > 0 || url.indexOf('/gallery/') > 0;
};