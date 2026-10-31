import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Emblem} from './Emblem';
import {Backdrop, Guides, Moon, Mountains, RidgeLayer, Sparkle} from './Scenery';
import {colors} from './theme';
import {ArabicName, Wordmark} from './Wordmark';

// Horizontal logo lockup: emblem | wordmark over the Arabic name.
const Lockup: React.FC<{scale: number}> = ({scale}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 64 * scale}}>
		<Emblem size={240 * scale} />
		<div
			style={{
				width: 3 * scale,
				height: 250 * scale,
				background: `linear-gradient(180deg, rgba(226,169,75,0), ${colors.gold} 50%, rgba(226,169,75,0))`,
			}}
		/>
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * scale}}>
			<Wordmark fontSize={150 * scale} />
			<ArabicName fontSize={56 * scale} rule={170 * scale} />
		</div>
	</div>
);

const scaleLayers = (layers: RidgeLayer[], sx: number, sy: number, dy = 0): RidgeLayer[] =>
	layers.map((l) => ({
		...l,
		points: l.points.map(([x, y]) => [x * sx, y * sy + dy] as [number, number]),
	}));

// Ridges drawn on the 2560x1440 YouTube canvas. Peaks rise only at the
// sides; under the logo (x 640-1920) they stay low so it sits on clean sky.
const ridges: RidgeLayer[] = [
	{
		points: [
			[0, 830], [150, 700], [270, 760], [420, 600], [540, 720], [620, 840], [760, 885],
			[920, 900], [1100, 885], [1280, 905], [1460, 885], [1640, 900], [1800, 885],
			[1940, 840], [2020, 720], [2140, 600], [2290, 760], [2410, 700], [2560, 830],
		],
		fill: colors.dusk,
		stroke: colors.gold,
		strokeOpacity: 0.35,
		strokeWidth: 2,
	},
	{
		points: [
			[0, 930], [200, 820], [320, 870], [480, 740], [700, 880], [860, 935], [1040, 965],
			[1280, 950], [1520, 965], [1700, 935], [1860, 880], [2080, 740], [2240, 870],
			[2360, 820], [2560, 930],
		],
		fill: '#14132a',
		stroke: colors.gold,
		strokeOpacity: 0.7,
		strokeWidth: 3,
	},
];

export const YouTubeBanner: React.FC<{guides?: boolean}> = ({guides}) => {
	const W = 2560;
	const H = 1440;
	return (
		<AbsoluteFill>
			<Backdrop
				width={W}
				height={H}
				glow={{x: '50%', y: '52%'}}
				starCount={260}
				seed="yt"
				tile={150}
				clearCenter="ellipse 900px 360px at 50% 50%"
			/>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Moon x={2160} y={600} r={44} />
				<Sparkle x={420} y={590} size={16} />
				<Sparkle x={1900} y={560} size={11} opacity={0.7} />
				<Sparkle x={700} y={420} size={9} opacity={0.6} />
			</svg>
			<Mountains width={W} height={H} layers={ridges} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<Lockup scale={1} />
			</AbsoluteFill>
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
	return (
		<AbsoluteFill>
			<Backdrop
				width={W}
				height={H}
				glow={{x: '50%', y: '50%'}}
				starCount={150}
				seed="fb"
				tile={110}
				clearCenter="ellipse 560px 260px at 50% 46%"
			/>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Moon x={1300} y={110} r={28} />
				<Sparkle x={330} y={140} size={11} />
				<Sparkle x={1450} y={300} size={8} opacity={0.6} />
			</svg>
			<Mountains width={W} height={H} layers={scaleLayers(ridges, W / 2560, 0.62, -40)} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 40}}>
				<Lockup scale={0.66} />
			</AbsoluteFill>
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
