import React from 'react';
import {colors, fonts, goldGradient} from './theme';

export type Variant = 'tv' | 'doc';

// "Al_3asr|TV" or "Al_3asr Doc", with the suffix set on a gold badge.
export const Wordmark: React.FC<{fontSize: number; variant?: Variant}> = ({fontSize, variant = 'tv'}) => (
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
		}}
	>
		<span style={{textShadow: '0 4px 24px rgba(0,0,0,0.5)'}}>Al</span>
		<span
			style={{
				backgroundImage: goldGradient,
				WebkitBackgroundClip: 'text',
				backgroundClip: 'text',
				color: 'transparent',
			}}
		>
			_
		</span>
		<span style={{textShadow: '0 4px 24px rgba(0,0,0,0.5)'}}>3asr</span>
		{variant === 'doc' ? (
			<span style={{display: 'inline-block', width: fontSize * 0.26}} />
		) : (
			<span
				style={{
					display: 'inline-block',
					width: Math.max(4, fontSize * 0.07),
					height: fontSize * 0.86,
					margin: `0 ${fontSize * 0.16}px`,
					borderRadius: fontSize * 0.04,
					background: colors.gold,
					boxShadow: '0 0 18px rgba(226,169,75,0.45)',
				}}
			/>
		)}
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				padding: `${fontSize * 0.1}px ${fontSize * 0.16}px ${fontSize * 0.08}px`,
				borderRadius: fontSize * 0.14,
				backgroundImage: goldGradient,
				color: colors.navy,
				fontSize: fontSize * 0.8,
				letterSpacing: '0.02em',
				boxShadow: '0 6px 28px rgba(226,169,75,0.35)',
			}}
		>
			{variant === 'doc' ? 'Doc' : 'TV'}
		</span>
	</div>
);

type IconName = 'news' | 'doc' | 'history' | 'science' | 'culture';

// Line icons, 24x24, drawn with the current stroke colour.
const Icon: React.FC<{name: IconName; size: number}> = ({name, size}) => {
	const common = {
		fill: 'none',
		stroke: colors.gold,
		strokeWidth: 1.8,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
	};
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink: 0}}>
			{name === 'news' ? (
				<g {...common}>
					<circle cx="12" cy="13" r="1.9" fill={colors.gold} />
					<path d="M8.4 9.2 A5.3 5.3 0 0 0 8.4 16.8 M15.6 9.2 A5.3 5.3 0 0 1 15.6 16.8" />
					<path d="M5.3 6.1 A9.6 9.6 0 0 0 5.3 19.9 M18.7 6.1 A9.6 9.6 0 0 1 18.7 19.9" />
				</g>
			) : null}
			{name === 'doc' ? (
				<g {...common}>
					<rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
					<path d="M10 9 L15.5 12 L10 15 Z" fill={colors.gold} />
				</g>
			) : null}
			{name === 'history' ? (
				<g {...common}>
					<path d="M3 8.5 L12 3.5 L21 8.5 Z" />
					<path d="M4.5 10.5 H19.5 M6.5 10.5 V18 M10 10.5 V18 M14 10.5 V18 M17.5 10.5 V18 M4 18.5 H20 M3 21 H21" />
				</g>
			) : null}
			{name === 'science' ? (
				<g {...common}>
					<ellipse cx="12" cy="12" rx="10" ry="3.9" />
					<ellipse cx="12" cy="12" rx="10" ry="3.9" transform="rotate(60 12 12)" />
					<ellipse cx="12" cy="12" rx="10" ry="3.9" transform="rotate(120 12 12)" />
					<circle cx="12" cy="12" r="1.7" fill={colors.gold} />
				</g>
			) : null}
			{name === 'culture' ? (
				<g {...common}>
					<path d="M20 3.5 C12.5 4.5 7.8 10 7 17 C13.5 16.2 19 11 20 3.5 Z" />
					<path d="M4 20.5 L15.5 8.5" />
				</g>
			) : null}
		</svg>
	);
};

const LEAD: Record<Variant, {icon: IconName; label: string}> = {
	tv: {icon: 'news', label: 'أخبار'},
	doc: {icon: 'doc', label: 'وثائقيات'},
};

const TOPICS: {icon: IconName; label: string}[] = [
	{icon: 'history', label: 'تاريخ'},
	{icon: 'science', label: 'علوم'},
	{icon: 'culture', label: 'ثقافة'},
];

// "أخبار • تاريخ • علوم • ثقافة" (or "وثائقيات • ..." for Doc), each with an icon.
export const CategoryLine: React.FC<{fontSize: number; variant?: Variant}> = ({fontSize, variant = 'tv'}) => (
	<div
		dir="rtl"
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: fontSize * 0.55,
			fontFamily: fonts.arabic,
			fontWeight: 700,
			fontSize,
			lineHeight: 1.3,
			color: colors.cream,
			whiteSpace: 'nowrap',
		}}
	>
		{[LEAD[variant], ...TOPICS].map((c, i) => (
			<React.Fragment key={c.label}>
				{i > 0 ? (
					<span
						style={{
							width: fontSize * 0.16,
							height: fontSize * 0.16,
							borderRadius: '50%',
							background: colors.gold,
							opacity: 0.7,
						}}
					/>
				) : null}
				<span style={{display: 'flex', alignItems: 'center', gap: fontSize * 0.28}}>
					<Icon name={c.icon} size={fontSize * 0.95} />
					<span>{c.label}</span>
				</span>
			</React.Fragment>
		))}
	</div>
);
