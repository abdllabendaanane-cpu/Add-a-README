import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Wordmark} from './Brand';
import {GlobeEmblem} from './GlobeEmblem';
import {colors} from './theme';
import {Atmosphere, Vignette} from './WorldMap';

const SIZE = 1080;
const C = SIZE / 2;

// Thin dial around the logo: "العصر" also means "the age / the era".
const Dial: React.FC = () => {
	const r = 486;
	const ticks = new Array(72).fill(0).map((_, i) => {
		const a = (i * 5 * Math.PI) / 180;
		const major = i % 6 === 0;
		const r1 = r - 12;
		const r2 = r1 - (major ? 18 : 8);
		return (
			<line
				key={i}
				x1={C + r1 * Math.sin(a)}
				y1={C - r1 * Math.cos(a)}
				x2={C + r2 * Math.sin(a)}
				y2={C - r2 * Math.cos(a)}
				stroke={major ? colors.gold : colors.cream}
				strokeOpacity={major ? 0.6 : 0.16}
				strokeWidth={major ? 3 : 2}
				strokeLinecap="round"
			/>
		);
	});
	return (
		<svg width={SIZE} height={SIZE} style={{position: 'absolute', inset: 0}}>
			<circle cx={C} cy={C} r={r} fill="none" stroke={colors.gold} strokeOpacity={0.35} strokeWidth={2} />
			{ticks}
		</svg>
	);
};

export const Profile: React.FC<{guides?: boolean}> = ({guides}) => (
	<AbsoluteFill>
		<Atmosphere width={SIZE} height={SIZE} goldGlow={{x: '50%', y: '40%'}} tealGlow={{x: '50%', y: '62%'}} />
		<Vignette />
		<Dial />
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: 10}}>
			<GlobeEmblem size={600} style={{marginTop: -40}} />
			<div style={{height: 4}} />
			<Wordmark fontSize={92} />
		</AbsoluteFill>
		{guides ? (
			<svg width={SIZE} height={SIZE} style={{position: 'absolute', inset: 0}}>
				<circle cx={C} cy={C} r={C} fill="none" stroke="#3cf" strokeWidth={3} strokeDasharray="12 10" />
			</svg>
		) : null}
	</AbsoluteFill>
);
