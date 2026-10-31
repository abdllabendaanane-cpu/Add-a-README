import React from 'react';
import {colors, fonts, goldGradient} from './theme';

const goldText: React.CSSProperties = {
	backgroundImage: goldGradient,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	color: 'transparent',
};

// "Al_3asr|TV": the underscore and the "|TV" part are set in gold.
export const Wordmark: React.FC<{fontSize: number}> = ({fontSize}) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				fontFamily: fonts.latin,
				fontWeight: 800,
				fontSize,
				lineHeight: 1,
				letterSpacing: '-0.015em',
				color: colors.cream,
				whiteSpace: 'nowrap',
				textShadow: '0 4px 24px rgba(0,0,0,0.45)',
			}}
		>
			<span>Al</span>
			<span style={{...goldText, textShadow: 'none'}}>_</span>
			<span>3asr</span>
			<span
				style={{
					display: 'inline-block',
					width: Math.max(4, fontSize * 0.075),
					height: fontSize * 0.86,
					margin: `0 ${fontSize * 0.2}px`,
					borderRadius: fontSize * 0.04,
					backgroundImage: goldGradient,
					boxShadow: '0 0 18px rgba(226,169,75,0.45)',
				}}
			/>
			<span style={{...goldText, textShadow: 'none'}}>TV</span>
		</div>
	);
};

// Arabic name between two thin gold rules: ── العصر ──
export const ArabicName: React.FC<{fontSize: number; rule?: number}> = ({
	fontSize,
	rule = fontSize * 2.2,
}) => {
	const line = (dir: 'left' | 'right'): React.CSSProperties => ({
		width: rule,
		height: Math.max(2, fontSize * 0.035),
		background: `linear-gradient(to ${dir}, rgba(226,169,75,0), ${colors.gold})`,
	});
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: fontSize * 0.45}}>
			<div style={line('right')} />
			<div
				dir="rtl"
				style={{
					fontFamily: fonts.kufi,
					fontWeight: 700,
					fontSize,
					lineHeight: 1.2,
					color: colors.gold,
				}}
			>
				العصر
			</div>
			<div style={line('left')} />
		</div>
	);
};
