import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {FacebookCover, YouTubeBanner} from './Covers';
import {Profile} from './Profile';
import {FacebookCover as V1FacebookCover, YouTubeBanner as V1YouTubeBanner} from './v1/Covers';
import {Profile as V1Profile} from './v1/Profile';
import {FPS as TAMBORA_FPS, TIMELINE as TAMBORA, TamboraCover, TamboraReel} from './reels/tambora/Reel';
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

			{/* Same designs for the "Al_3asr Doc" channel name. */}
			<Folder name="doc">
				<Still id="Doc-Profile" component={Profile} width={1080} height={1080} defaultProps={{guides: false, variant: 'doc' as const}} />
				<Still id="Doc-FacebookCover" component={FacebookCover} width={1640} height={624} defaultProps={{guides: false, variant: 'doc' as const}} />
				<Still id="Doc-YouTubeBanner" component={YouTubeBanner} width={2560} height={1440} defaultProps={{guides: false, variant: 'doc' as const}} />
			</Folder>

			{/* Same designs for the "Al.Asr_Doc" channel name. */}
			<Folder name="asrdoc">
				<Still id="AsrDoc-Profile" component={Profile} width={1080} height={1080} defaultProps={{guides: false, variant: 'asrdoc' as const}} />
				<Still id="AsrDoc-FacebookCover" component={FacebookCover} width={1640} height={624} defaultProps={{guides: false, variant: 'asrdoc' as const}} />
				<Still id="AsrDoc-YouTubeBanner" component={YouTubeBanner} width={2560} height={1440} defaultProps={{guides: false, variant: 'asrdoc' as const}} />
			</Folder>

			{/* Reels (1080x1920). */}
			<Folder name="reels">
				<Composition
					id="Tambora-Part1"
					component={TamboraReel}
					width={1080}
					height={1920}
					fps={TAMBORA_FPS}
					durationInFrames={TAMBORA.total}
					defaultProps={{audio: true}}
				/>
				<Still id="Tambora-Part1-Cover" component={TamboraCover} width={1080} height={1920} />
			</Folder>

			{/* First version: book, mountains and night sky. */}
			<Folder name="v1">
				<Still id="V1-Profile" component={V1Profile} width={1080} height={1080} defaultProps={{guides: false}} />
				<Still id="V1-FacebookCover" component={V1FacebookCover} width={1640} height={624} defaultProps={{guides: false}} />
				<Still id="V1-YouTubeBanner" component={V1YouTubeBanner} width={2560} height={1440} defaultProps={{guides: false}} />
			</Folder>
		</>
	);
};
