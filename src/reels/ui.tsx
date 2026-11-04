import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, goldGradient} from '../theme';

// On-screen text in the style of the solar-storm reel: series label and
// channel name on top, a big headline, captions in a dark box, and gold/red
// tags for sources and key numbers.

export const RED = '#e5392f';
const shadow = '0 6px 30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.9)';

export const TopBar: React.FC<{series: string}> = ({series}) => (
	<div
		style={{
			position: 'absolute',
			top: 54,
			left: 48,
			right: 48,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			textShadow: shadow,
		}}
	>
		<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 32, color: colors.gold}}>
			{series}
		</div>
		<div style={{fontFamily: fonts.latin, fontWeight: 800, fontSize: 32, color: colors.cream, letterSpacing: '-0.01em'}}>
			Al<span style={{color: colors.gold}}>.</span>Asr<span style={{color: colors.gold}}>_</span>Doc
		</div>
	</div>
);

export const Headline: React.FC<{text: string; tone?: 'white' | 'gold'}> = ({text, tone = 'white'}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 7], [1.18, 1], {extrapolateRight: 'clamp'});
	const opacity = interpolate(frame, [0, 4], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', top: 150, left: 40, right: 40, display: 'flex', justifyContent: 'center'}}>
			<div
				dir="rtl"
				style={{
					fontFamily: fonts.arabic,
					fontWeight: 900,
					fontSize: 128,
					lineHeight: 1.15,
					textAlign: 'center',
					color: tone === 'gold' ? colors.goldLight : '#ffffff',
					textShadow: shadow,
					transform: `scale(${scale})`,
					opacity,
				}}
			>
				{text}
			</div>
		</div>
	);
};

export const Pill: React.FC<{text: string; tone: 'gold' | 'red'; top: number; delay?: number}> = ({
	text,
	tone,
	top,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 180}});
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div
				dir="rtl"
				style={{
					fontFamily: fonts.arabic,
					fontWeight: 800,
					fontSize: tone === 'red' ? 54 : 42,
					lineHeight: 1.3,
					padding: tone === 'red' ? '10px 30px' : '8px 26px',
					borderRadius: 16,
					color: tone === 'red' ? '#ffffff' : colors.navy,
					backgroundImage: tone === 'red' ? `linear-gradient(180deg, #ff5a4a, ${RED})` : goldGradient,
					boxShadow: tone === 'red' ? '0 10px 40px rgba(229,57,47,0.55)' : '0 10px 34px rgba(226,169,75,0.4)',
					transform: `scale(${0.6 + 0.4 * s})`,
					opacity: Math.min(1, s * 1.5),
				}}
			>
				{text}
			</div>
		</div>
	);
};

export const CaptionBox: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const y = interpolate(frame, [0, 6], [16, 0], {extrapolateRight: 'clamp'});
	const opacity = interpolate(frame, [0, 5], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', top: 1400, left: 60, right: 60, display: 'flex', justifyContent: 'center'}}>
			<div
				dir="rtl"
				style={{
					fontFamily: fonts.arabic,
					fontWeight: 800,
					fontSize: 58,
					lineHeight: 1.4,
					textAlign: 'center',
					color: '#ffffff',
					background: 'rgba(8,8,14,0.66)',
					borderRadius: 18,
					padding: '12px 30px',
					maxWidth: 960,
					transform: `translateY(${y}px)`,
					opacity,
				}}
			>
				{text}
			</div>
		</div>
	);
};
