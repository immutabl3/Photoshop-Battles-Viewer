import React from 'react';
import SortLink from './SortLink';

export default function SortMenu({ menu, timeFrame }) {
	return (
		<div className="sort">
			<div className="sort__container">
				<p className="sorter--label">Sort posts by top of: </p>
				{
					menu.map(({ timeframe, text }, idx) => {
						return (
							<SortLink
								key={ idx }
								timeframe={ timeframe }
								active={ timeframe === timeFrame }
							>
								{ text }
							</SortLink>
						);
					})
				}
			</div>
		</div>
	);
};