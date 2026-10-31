import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CategoryLine, Wordmark} from './Brand';
import {GlobeEmblem} from './GlobeEmblem';
import {Guides} from './Scenery';
import {Atmosphere, Vignette, WorldMap} from './WorldMap';

// Logo stacked over the wordmark and the category line.
const Lockup: React.FC<{centerX: number; scale: number; offsetY?: number}> = ({centerX, scale, offsetY = 0}) => (
	<AbsoluteFill>
		<div
			style={{
				position: 'absolute',
				left: centerX,
				top: offsetY,
				bottom: -offsetY,
				transform: 'translateX(-50%)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<GlobeEmblem size={250 * scale} />
			<div style={{height: 2 * scale}} />
			<Wordmark fontSize={104 * scale} />
			<div style={{height: 20 * scale}} />
			<CategoryLine fontSize={38 * scale} />
		</div>
	</AbsoluteFill>
);

export const YouTubeBanner: React.FC<{guides?: boolean}> = ({guides}) => {
	const W = 2560;
	const H = 1440;
	const logoX = 925;
	return (
		<AbsoluteFill>
			<Atmosphere width={W} height={H} goldGlow={{x: '68%', y: '50%'}} tealGlow={{x: '36%', y: '50%'}} />
			<WorldMap
				width={W}
				height={H}
				k={11}
				lon0={22}
				lat0={32}
				x0={1737}
				y0={720}
				dotRadius={2.1}
				scale={1}
				focus={{x: 1760, y: 720, r: 560, strength: 0.42}}
				dim={{x: logoX, y: 720, r: 520, strength: 0.8}}
			/>
			<Vignette />
			<Lockup centerX={logoX} scale={1} offsetY={-14} />
			{guides ? (
				<Guides
					boxes={[
						{x: 0, y: 508, w: 2560, h: 423, label: 'Desktop', color: '#f55'},
						{x: 352, y: 508, w: 1855, h: 423, label: 'Tablet', color: '#fc3'},
						{x: 507, y: 508, w: 1546, h: 423, label: 'Safe (all devices)', color: '#3cf'},
					]}
				/>
			) : null}
		</AbsoluteFill>
	);
};

export const FacebookCover: React.FC<{guides?: boolean}> = ({guides}) => {
	const W = 1640;
	const H = 624;
	const logoX = 610;
	return (
		<AbsoluteFill>
			<Atmosphere width={W} height={H} goldGlow={{x: '68%', y: '48%'}} tealGlow={{x: '34%', y: '50%'}} />
			<WorldMap
				width={W}
				height={H}
				k={9.2}
				lon0={22}
				lat0={32}
				x0={1128}
				y0={300}
				dotRadius={1.8}
				scale={0.8}
				focus={{x: 1110, y: 300, r: 420, strength: 0.42}}
				dim={{x: logoX, y: 300, r: 380, strength: 0.8}}
			/>
			<Vignette />
			<Lockup centerX={logoX} scale={0.68} offsetY={-36} />
			{guides ? (
				<Guides
					boxes={[
						{x: 265, y: 0, w: 1110, h: 624, label: 'Mobile', color: '#3cf'},
						{x: 30, y: 420, w: 340, h: 204, label: 'Profile photo (desktop)', color: '#f55'},
					]}
				/>
			) : null}
		</AbsoluteFill>
	);
};
