import React from 'react';

export default function Area({
	title,
	image,
	link,
}) {
	return (
		<div className="original-area">
			<div>
				<p>
					Original Image
				</p>
				<h2>
					{ title }
				</h2>
				<img
					src={ image }
				/>
				<div>
					<a
						href={ image }
						target="_blank"
					>
						View Full Size
					</a>
					<a
						href={ `https://www.reddit.com${link}` }
						target="_blank"
					>
						View on Reddit
					</a>
				</div>
			</div>
		</div>
	);
};