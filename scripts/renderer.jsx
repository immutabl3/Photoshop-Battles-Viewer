import React from 'react';
import ReactDOM from 'react-dom';

const mount = document.querySelector('#mount');

export default function renderer(App, store) {
	const render = () => ReactDOM.render(<App {...store.get()} />, mount);
	store.on('update', render);
	return render;
};
