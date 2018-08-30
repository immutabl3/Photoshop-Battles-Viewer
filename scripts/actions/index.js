import signal from 'signal-js';
import reddit from '../services/reddit';
import originalArea from '../originalArea';
import shop from '../shop';

export default function actions(store) {
	store.select('modalOpen')
		.on('update', function({ data }) {
			const isOpen = data.currentData;
			if (isOpen) return document.body.classList.add('modal-open');
			document.body.classList.remove('modal-open');
		});

	const fetchCards = function() {
		return reddit.getBattles(store.get())
			.then(function({ data }) {
				store.set('paginationAfter', data.after);

				const posts = data.children;
				return posts
					.map(function(post) {
						const link = post.data.permalink;
						const {
							title,
							image,
						} = originalArea({
							title: post.data.title,
							image: post.data.url,
						});

						return {
							title,
							image,
							link,
						};
					});
			});
	};

	signal.on('timeframe:change', async function(timeframe) {
		store.set('paginationAfter', '');
		store.set('timeFrame', timeframe);
		store.set('loading', true);

		const cards = await fetchCards();

		store.set('originalCards', cards);
		store.set('loading', false);
	});

	signal.on('load:cards', async function() {
		store.set('loading', true);

		const cards = await fetchCards();

		store.set('originalCards', cards);
		store.set('loading', false);
	});

	signal.on('push:cards', async function() {
		store.set('loading', true);

		const cardsData = await fetchCards();
		
		const cards = [...store.get('originalCards'), ...cardsData];
		store.set('originalCards', cards);
		store.set('loading', false);
	});

	signal.on('gallery:close', () => {
		store.set('modalOpen', false);
	});

	// function to handle the data for a specific reddit post
	const processPostPsBattleData = async function(data) {
		// add the original reddit post image to the left
		const originalAreaData = data[0].data.children[0].data;
		const link = originalAreaData.permalink;
		const {
			title,
			image,
		} = originalArea({
			title: originalAreaData.title,
			image: originalAreaData.url,
		});

		// for each parent comment in the reddit post, filter out the relevant data
		const shopData = data[1].data;
		const photoshops = shopData.children;
		const shops = await Promise.all(
			photoshops
				// ignore the pagination object at the end
				.filter(({ kind }) => kind === 't1')
				.map(({ data }) => data)
				// construct a shop object
				.map(shop)
		);

		return {
			title,
			image,
			link,
			index: 0,
			shops: shops.filter(item => !!item),
		};
	};

	signal.on('gallery:load', async function(link) {
		store.set('loading', true);

		const gallery = await reddit.getPost(link).then(processPostPsBattleData);

		store.set('gallery', gallery);
		store.set('loading', false);
		store.set('modalOpen', true);
	});
	
	signal.on('gallery:delta', function(delta) {
		const index = store.get(['gallery', 'index']) + delta;
		store.set(['gallery', 'index'], index);
	});
};