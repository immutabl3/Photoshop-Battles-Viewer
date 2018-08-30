import React from 'react';
import signal from 'signal-js';

export default function SortLink({ timeframe, active, children }) {
	return (
		<p
			className={ `sorter ${active ? 'sorter--active' : ''}` }
			onClick={ () => signal.trigger('timeframe:change', timeframe) }
		>
			{ children }
		</p>
	);
};