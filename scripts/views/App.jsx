import React from 'react';
import Logo from './Logo';
import SortMenu from './SortMenu/SortMenu';
import Originals from './Originals/Originals';
import More from './More';
import Loading from './Loading';
import Modal from './Modal/Modal';
import Gallery from './Gallery/Gallery';

export default function App(store) {
	if (store.loading) return <Loading />;

	return (
		<header>
			<Logo />
			<SortMenu
				menu={ store.menu }
				timeFrame={ store.timeFrame }
			/>
			<Originals
				cards={ store.originalCards }
			/>
			<More />
			<Modal
				active={ store.modalOpen }
			>
				<Gallery
					{...store.gallery}
				/>
			</Modal>
		</header>
	);
};