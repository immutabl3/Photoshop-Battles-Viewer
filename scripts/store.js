import Boabob from 'baobab';

export default new Boabob({
	loading: true,
	modalOpen: false,
	timeFrame: 'month',
	paginationAfter: '',
	originalCards: [],
	gallery: {
		title: '',
		image: '',
		link: '',
		index: 0,
		shops: []
	},
	menu: [ 
		{
			timeframe: 'all',
			text: 'All Time'
		},
		{
			timeframe: 'year',
			text: 'Year'
		},
		{
			timeframe: 'month',
			text: 'Month'
		},
		{
			timeframe: 'week',
			text: 'Week'
		},
	],
});