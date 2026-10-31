import React from 'react';
import {Still} from 'remotion';
import {FacebookCover, YouTubeBanner} from './Covers';
import {Profile} from './Profile';
import './fonts';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			{/* Profile picture for Facebook and YouTube (shown as a circle). */}
			<Still id="Profile" component={Profile} width={1080} height={1080} defaultProps={{guides: false}} />
			{/* Facebook page cover. */}
			<Still id="FacebookCover" component={FacebookCover} width={1640} height={624} defaultProps={{guides: false}} />
			{/* YouTube channel banner; logo stays inside the 1546x423 safe area. */}
			<Still id="YouTubeBanner" component={YouTubeBanner} width={2560} height={1440} defaultProps={{guides: false}} />
		</>
	);
};
