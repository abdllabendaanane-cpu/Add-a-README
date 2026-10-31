import React, {useId} from 'react';
import {colors} from './theme';

// Vector redraw of the original logo: an open book, a gold mountain
// ridge rising from its pages and a crescent moon above the peak.
export const Emblem: React.FC<{size: number; style?: React.CSSProperties}> = ({
	size,
	style,
}) => {
	const id = useId().replace(/:/g, '');
	const glow = 'drop-shadow(0 0 6px rgba(226,169,75,0.55))';

	return (
		<svg
			width={size}
			height={size * 0.95}
			viewBox="0 -82 200 190"
			style={{overflow: 'visible', ...style}}
		>
			<defs>
				<linearGradient id={`g${id}`} x1="0" y1="-80" x2="0" y2="30" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={colors.goldLight} />
					<stop offset="1" stopColor={colors.gold} />
				</linearGradient>
				<mask id={`m${id}`}>
					<rect x="150" y="-110" width="60" height="60" fill="white" />
					<circle cx="181.5" cy="-79" r="9" fill="black" />
				</mask>
			</defs>

			{/* mountains */}
			<g style={{filter: glow}}>
				<path
					d="M16 20 L68 -24 L78 -12 L136 -64 L184 20"
					fill="none"
					stroke={`url(#g${id})`}
					strokeWidth={5.5}
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
				{/* crescent */}
				<circle cx="175" cy="-74" r="10" fill={colors.gold} mask={`url(#m${id})`} />
			</g>

			{/* open book */}
			<g
				fill="none"
				stroke={colors.cream}
				strokeWidth={5.5}
				strokeLinejoin="round"
				strokeLinecap="round"
			>
				<path
					d="M100 30 C80 19 46 15 14 20 L14 92 C46 88 80 92 100 102 Z"
					fill="rgba(243,236,224,0.03)"
				/>
				<path
					d="M100 30 C120 19 154 15 186 20 L186 92 C154 88 120 92 100 102 Z"
					fill="rgba(243,236,224,0.03)"
				/>
				<path d="M5 28 L5 101 C46 96 80 100 100 111 C120 100 154 96 195 101 L195 28" />
			</g>
		</svg>
	);
};
