import 'babel-polyfill';
import $ from 'jquery';
import uuid from 'uuid/v4';
import reddit from './services/reddit';
import originalArea from './originalArea';
import shop from './shop';

const $originals = $('#originals');
const $originalArea = $('#originalArea');
const $shoppedTitle = $('#shoppedTitle');
const $shoppedImage = $('#shoppedImage');
const $shoppedButtons = $('#shoppedButtons');
const $username = $('#username');
const $leftClick = $('#leftClick');
const $rightClick = $('#rightClick');
const $body = $('body');
const $close = $('#close');
const $more = $('#more');
const $sorter = $('#sorter');
const $modal = $('#modal');

let timeFrame = 'month';
let paginationAfter;

// check if user has valid auth token and its expiration. 
// If the token is going to expire in less than 5 minutes, it will grab a new token.
const validToken = function() {
	if (!global.localStorage.getItem('accessToken')) return false;

	const currentDate = new Date();
	const expires = new Date(global.localStorage.getItem('expires'));
	const difference = expires.getTime() - currentDate.getTime();
	const minutesDifference = Math.ceil(difference / (1000 * 60));
	return minutesDifference < 5;
};

// function to handle the data after a successful request
const processPsBattleData = function(data) {
	const posts = data.data.children;
	paginationAfter = data.data.after;

	const postsHtml = posts
		.map(function(post) {
			const link = post.data.permalink;
			const {
				title,
				image,
			} = originalArea({
				title: post.data.title,
				image: post.data.url,
			});

			return `
				<div class="original-card">
					<div class="original-card__image">
						<div style="background-image: url('${image}');"></div>
					</div>
					<div class="original-card__info">
						<p>
							${title}
						</p>
						<a href="#" class="link" data-url="${link}" data-title="${title}">
							View Photoshops
						</a>
					</div>
				</div>
			`;
		});

	$originals.append(
		postsHtml.join('')
	);
};

// handle the data of the photoshop submissions of the post that the user clicked on
const shoppedGallery = function(photoshops, index = 0) {
	// nothing here!
	// TODO: there has to be a better way of handling this
	if (!photoshops[index]) return;

	const photoshop = photoshops[index];

	// show the left button if index is off the first photoshop, hide the right button if index is on the last photoshop
	if (index > 0) {
		$leftClick.show();
	} else {
		$leftClick.hide();
	}
	if (photoshops[index + 1]) {
		$rightClick.show(); 
	} else {
		$rightClick.hide();
	}

	$shoppedTitle.text(photoshop.title);
	$shoppedImage.attr('src', photoshop.imageURL);
	$username.text(`created by: ${photoshop.author}`);
	$shoppedButtons
		.empty()
		.append(`
			<a href="${photoshop.imageURL}" target="_blank">
				View Full Size
			</a>
			<a href="${photoshop.link}" target="_blank">
				View Comments
			</a>
		`);

	$rightClick
		.off()
		.on('click', () => shoppedGallery(photoshops, index + 1));

	$leftClick
		.off()
		.on('click', () => shoppedGallery(photoshops, index - 1));
};

// function to handle the data for a specific reddit post
const processPostPsBattleData = async function(data) {
	// add the original reddit post image to the left
	const link = data[0].data.children[0].data.permalink;
	const {
		title,
		image,
	} = originalArea({
		title: data[0].data.children[0].data.title,
		image: data[0].data.children[0].data.url,
	});

	$originalArea.append(`
		<div>
			<p>Original Image</p>
			<h2>${title}</h2>
			<img src="${image}">
			<div>
				<a href="${image}" target="_blank">
					View Full Size
				</a>
				<a href="https://www.reddit.com${link}" target="_blank">
					View on Reddit
				</a>
			</div>
		</div>
	`);

	// for each parent comment in the reddit post, filter out the relevant data
	const photoshops = data[1].data.children;
	const shops = await Promise.all(
		photoshops
			// ignore the pagination object at the end
			.filter(({ kind }) => kind === 't1')
			.map(({ data }) => data)
			// construct a shop object
			.map(shop)
	);

	shoppedGallery(
		// make sure we only items with results
		shops.filter(item => !!item)
	);
};

const addHours = function(hours) {
	const date = new Date();
	date.setTime(date.getTime() + hours * 60 * 60 * 1000);
	return date;
};

const showModal = () => {
	$body.addClass('modal-open');
	$modal.removeClass('modal--hidden');
};

const hideModal = () => {
	$body.removeClass('modal-open');
	$modal.addClass('modal--hidden');
};

const startLoading = () => $body.hide();
const stopLoading = () => $body.show();

const init = async function() {
	// checks if the user already has a device ID locally stored. It will set one if they do not or it will continue with the request if they do.
	if (!global.localStorage.getItem('deviceID')) global.localStorage.setItem('deviceID', uuid());
	if (!validToken()) {
		const { token, expires } = await reddit.getCredentials();
		global.localStorage.setItem('accessToken', token);
		global.localStorage.setItem(
			'expires',
			addHours(expires / 3600)
		);
	}

	// grab the "View Shops" anchor handle (dynamically appended) to interact with the modal
	$originals.on('click', '.link', function() {
		startLoading();

		const permalink = this.getAttribute('data-url');
		reddit.getPost(permalink)
			.then(processPostPsBattleData)
			.then(() => stopLoading())
			.then(() => showModal());
	});

	// empty the modal content when it is closed and remove the arrow button events
	$close.on('click', function() {
		hideModal();
		$originalArea.empty();
		$shoppedTitle.empty();
		$shoppedImage.removeAttr('src');
		$shoppedButtons.empty();
		$username.text('');
		$leftClick.hide();
		$rightClick.show();
	});

	// clear the body and append new reddit posts sorted by timeframe
	$sorter.on('click', async function() {
		timeFrame = this.getAttribute('data-timeframe');
		
		const $this = $(this);
		$originals.empty();
		paginationAfter = '';

		$sorter.find('.sorter--active').removeClass('sorter--active');
		$this.addClass('sorter--active');

		startLoading();

		await reddit.getBattles(timeFrame, paginationAfter)
			.then(processPsBattleData);

		stopLoading();
	});

	// use the pagination set in processPsBattleData() to append more posts
	$more.on('click', async function() {
		startLoading();

		await reddit.getBattles(timeFrame, paginationAfter)
			.then(processPsBattleData);
		
		stopLoading();
	});

	hideModal();
	// we're starting out on week
	$sorter.find(`[data-timeframe="${timeFrame}"]`).addClass('sorter--active');

	reddit.getBattles(timeFrame, paginationAfter)
		.then(processPsBattleData);
};
init();
