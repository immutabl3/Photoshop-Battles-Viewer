import React from 'react';
import signal from 'signal-js';

export default function More() {
	return (
		<div
			className="more"
			onClick={ () => signal.trigger('push:cards') }
		>
			<div>More...</div>	
		</div>
	);
};