import React from 'react';
import signal from 'signal-js';

export default function OriginalCard({
	image,
	title,
	link
}) {
	return (
		<div className="original-card">
			<div className="original-card__image">
				<div
					style={ {
						backgroundImage: `url('${image}')`,
					} }
				/>
			</div>
			<div className="original-card__info">
				<p>
					{ title }
				</p>
				<a
					href="#"
					className="link"
					onClick={ () => signal.trigger('gallery:load', link) }
				>
					View Photoshops
				</a>
			</div>
		</div>
	);
};