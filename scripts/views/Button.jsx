import React from 'react';
import classnames from 'classnames';

export default function Button({
	type,
	className,
	onClick,
	children
}) {
	return (
		<button
			className={ classnames(`button button--${type}`, className) }
			onClick={ onClick }
		>
			{ children }
		</button>
	);
};