import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Emblem} from './Emblem';
import {Backdrop, Guides, Sparkle} from '../Scenery';
import {colors} from '../theme';
import {ArabicName, Wordmark} from './Wordmark';

const SIZE = 1080;
const C = SIZE / 2;

// A thin clock-dial ring: "العصر" is the afternoon hour, so a gold arc runs
// from 12 o'clock to about 4 o'clock and ends in a glowing dot.
const DialRing: React.FC = () => {
	const r = 478;
	const circumference = 2 * Math.PI * r;
	const arcDeg = 120;
	const end = ((-90 + arcDeg) * Math.PI) / 180;

	const ticks = new Array(60).fill(0).map((_, i) => {
		const a = (i * 6 * Math.PI) / 180;
		const major = i % 5 === 0;
		const len = major ? 20 : 9;
		const r1 = r - 14;
		const r2 = r1 - len;
		return (
			<line
				key={i}
				x1={C + r1 * Math.sin(a)}
				y1={C - r1 * Math.cos(a)}
				x2={C + r2 * Math.sin(a)}
				y2={C - r2 * Math.cos(a)}
				stroke={major ? colors.gold : colors.cream}
				strokeOpacity={major ? 0.75 : 0.22}
				strokeWidth={major ? 3 : 2}
				strokeLinecap="round"
			/>
		);
	});

	return (
		<svg width={SIZE} height={SIZE} style={{position: 'absolute', inset: 0}}>
			<defs>
				<linearGradient id="arc" x1="540" y1="62" x2="947" y2="779" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={colors.gold} stopOpacity="0.15" />
					<stop offset="1" stopColor={colors.goldLight} stopOpacity="1" />
				</linearGradient>
			</defs>
			<circle cx={C} cy={C} r={r} fill="none" stroke={colors.gold} strokeOpacity={0.28} strokeWidth={2} />
			{ticks}
			<circle
				cx={C}
				cy={C}
				r={r}
				fill="none"
				stroke="url(#arc)"
				strokeWidth={5}
				strokeLinecap="round"
				strokeDasharray={`${(circumference * arcDeg) / 360} ${circumference}`}
				transform={`rotate(-90 ${C} ${C})`}
				style={{filter: 'drop-shadow(0 0 8px rgba(246,213,142,0.6))'}}
			/>
			<circle
				cx={C + r * Math.cos(end)}
				cy={C + r * Math.sin(end)}
				r={11}
				fill={colors.goldLight}
				style={{filter: 'drop-shadow(0 0 14px rgba(246,213,142,0.95))'}}
			/>
			<Sparkle x={200} y={250} size={13} opacity={0.75} />
			<Sparkle x={870} y={330} size={9} opacity={0.6} />
		</svg>
	);
};

export const Profile: React.FC<{guides?: boolean}> = ({guides}) => {
	return (
		<AbsoluteFill>
			<Backdrop
				width={SIZE}
				height={SIZE}
				glow={{x: '50%', y: '42%'}}
				starCount={70}
				seed="profile"
				tile={135}
				clearCenter="circle 520px at 50% 50%"
			/>
			<DialRing />
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					paddingTop: 30,
				}}
			>
				<Emblem size={250} />
				<div style={{height: 54}} />
				<Wordmark fontSize={112} />
				<div style={{height: 30}} />
				<ArabicName fontSize={58} rule={110} />
			</AbsoluteFill>
			{guides ? (
				<svg width={SIZE} height={SIZE} style={{position: 'absolute', inset: 0}}>
					<circle cx={C} cy={C} r={C} fill="none" stroke="#3cf" strokeWidth={3} strokeDasharray="12 10" />
				</svg>
			) : null}
			{guides ? <Guides boxes={[]} /> : null}
		</AbsoluteFill>
	);
};
