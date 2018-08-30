import 'babel-polyfill';
import signal from 'signal-js';
import renderer from './renderer.jsx';
import App from './views/App.jsx';
import actions from './actions';
import store from './store';
import auth from './auth';

const init = async function() {
	await auth();
	const render = renderer(App, store);
	render();
	actions(store);
	signal.trigger('load:cards');
};
Promise.resolve()
	.then(init)
	.catch(err => {
		console.error(err);
	});