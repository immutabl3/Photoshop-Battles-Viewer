import React from 'react';
import OriginalCard from './OriginalCard';

export default function Originals({ cards }) {
	return (
		<section className="originals">
			{
				cards.map((originalCard, idx) => {
					return (
						<OriginalCard
							{...originalCard}
							key={ idx }
						/>
					);
				})
			}
		</section>
	);
};