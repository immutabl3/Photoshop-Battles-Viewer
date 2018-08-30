import React from 'react';

export default function Modal({ active, children }) {
	if (!active) return null;

	return (
		<div className="modal">
			{ children }
		</div>
	);
};