const disallowSpaces = function(str) {
	if (!str.includes(' ')) return str;
	return str.split(' ')[0];
};

export default function parseTitleAndImageUrl(str) {
	// if the comment used a markdown link
	if (str.indexOf('[') >= 0) {
		// change the title to no caption if the title is the same as the link
		return {
			title: str.indexOf('http') ? 
				'(no caption)' : 
				`"${str.substring(str.indexOf('[') + 1, str.indexOf(']'))}"`,
			imageUrl: str.substring(str.indexOf('(') + 1, str.indexOf(')')),
		};
	}


	return {
		title: '(no caption)',
		imageUrl: disallowSpaces(str.trim()),
	};
};