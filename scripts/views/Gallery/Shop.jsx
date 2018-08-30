import React from 'react';
import signal from 'signal-js';
import Button from '../Button';

export default function Shop({
	title,
	imageURL,
	author,
	link,
	showLeftArrow,
	showRightArrow,
}) {
	return (
		<div className="shopped">
			<div>
				<p>
					Shopped Images
				</p>
				<h2 className="shopped__title">
					{ title }
				</h2>
				<img src={ imageURL } className="shopped__image" />
				<p className="username">
					{ author }
				</p>
				{ showLeftArrow && (
					<Button
						type="left-click"
						onClick={ () => signal.trigger('gallery:delta', -1) }
					>
						{ '<' }
					</Button>
				) }
				{ showRightArrow && (
					<Button
						type="right-click"
						onClick={ () => signal.trigger('gallery:delta', 1) }
					>
						{ '>' }
					</Button>
				) }
				<div className="shopped__buttons">
					<a
						href={ imageURL }
						target="_blank"
					>
						View Full Size
					</a>
					<a
						href={ link }
						target="_blank"
					>
						View Comments
					</a>
				</div>
			</div>
		</div>
	);
};