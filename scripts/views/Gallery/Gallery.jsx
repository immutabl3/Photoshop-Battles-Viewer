import React, { Fragment } from 'react';
import signal from 'signal-js';
import Area from './Area';
import Shop from './Shop';
import Button from '../Button';

export default function Gallery({
	title,
	link,
	image,
	shops,
	index,
}) {
	const shop = shops[index];
	return (
		<Fragment>
			<Area
				title={ title }
				image={ image }
				link={ link }
			/>
			<Shop
				{...shop}
				showLeftArrow={ shops[index - 1] }
				showRightArrow={ shops[index + 1] }
			/>
			<Button
				type="close"
				onClick={ () => signal.trigger('gallery:close') }
			>
				×
			</Button>
		</Fragment>
	);
};