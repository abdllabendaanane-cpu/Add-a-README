import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {colors} from './theme';

// Night-sky gradient with a faint geometric star pattern, stars, film grain
// and a vignette.
export const Backdrop: React.FC<{
	width: number;
	height: number;
	glow?: {x: string; y: string};
	starCount?: number;
	seed?: string;
	tile?: number;
	clearCenter?: string;
}> = ({
	width,
	height,
	glow = {x: '50%', y: '45%'},
	starCount = 120,
	seed = 'stars',
	tile = 120,
	clearCenter = 'ellipse 45% 45% at 50% 50%',
}) => {
	const id = useId().replace(/:/g, '');
	const unit = Math.max(width, height) / 1080;

	const stars = new Array(starCount).fill(0).map((_, i) => {
		const x = random(`${seed}-x-${i}`) * width;
		// bias the stars towards the top of the frame
		const y = Math.pow(random(`${seed}-y-${i}`), 1.6) * height;
		const r = (0.6 + random(`${seed}-r-${i}`) * 1.6) * unit;
		const o = 0.15 + random(`${seed}-o-${i}`) * 0.6;
		const gold = random(`${seed}-c-${i}`) > 0.82;
		return {x, y, r, o, gold};
	});

	const s = tile;
	const sq = s * 0.26;

	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 75% 70% at ${glow.x} ${glow.y}, ${colors.dusk} 0%, ${colors.navy} 48%, ${colors.night} 100%)`,
			}}
		>
			<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
				<defs>
					<pattern id={`p${id}`} width={s} height={s} patternUnits="userSpaceOnUse">
						<g
							transform={`translate(${s / 2} ${s / 2})`}
							fill="none"
							stroke={colors.gold}
							strokeWidth={1.1 * unit}
						>
							<rect x={-sq} y={-sq} width={sq * 2} height={sq * 2} />
							<rect
								x={-sq}
								y={-sq}
								width={sq * 2}
								height={sq * 2}
								transform="rotate(45)"
							/>
							<circle r={sq * 0.42} />
							<path
								d={`M${-s / 2} 0 L${-sq * 1.414} 0 M${sq * 1.414} 0 L${s / 2} 0 M0 ${-s / 2} L0 ${-sq * 1.414} M0 ${sq * 1.414} L0 ${s / 2}`}
							/>
						</g>
					</pattern>
					<filter id={`n${id}`}>
						<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<radialGradient id={`s${id}`}>
						<stop offset="0" stopColor="#fff" stopOpacity="1" />
						<stop offset="1" stopColor="#fff" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* geometric pattern, faded out behind the logo */}
				<rect
					width={width}
					height={height}
					fill={`url(#p${id})`}
					opacity={0.07}
					style={{
						WebkitMaskImage: `radial-gradient(${clearCenter}, transparent 35%, black 100%)`,
						maskImage: `radial-gradient(${clearCenter}, transparent 35%, black 100%)`,
					}}
				/>

				{stars.map((st, i) => (
					<circle
						key={i}
						cx={st.x}
						cy={st.y}
						r={st.r}
						fill={st.gold ? colors.goldLight : colors.cream}
						opacity={st.o}
					/>
				))}

				<rect
					width={width}
					height={height}
					filter={`url(#n${id})`}
					opacity={0.07}
					style={{mixBlendMode: 'overlay'}}
				/>
			</svg>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

// Four-pointed twinkle.
export const Sparkle: React.FC<{x: number; y: number; size: number; opacity?: number}> = ({
	x,
	y,
	size,
	opacity = 0.9,
}) => {
	const s = size;
	const k = s * 0.14;
	return (
		<path
			d={`M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`}
			fill={colors.goldLight}
			opacity={opacity}
			style={{filter: `drop-shadow(0 0 ${s * 0.6}px rgba(246,213,142,0.8))`}}
		/>
	);
};

export const Moon: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
	const id = useId().replace(/:/g, '');
	return (
		<g>
			<defs>
				<mask id={`mm${id}`}>
					<rect x={x - r * 2} y={y - r * 2} width={r * 4} height={r * 4} fill="white" />
					<circle cx={x + r * 0.42} cy={y - r * 0.32} r={r * 0.9} fill="black" />
				</mask>
				<radialGradient id={`mh${id}`}>
					<stop offset="0" stopColor={colors.gold} stopOpacity="0.28" />
					<stop offset="1" stopColor={colors.gold} stopOpacity="0" />
				</radialGradient>
			</defs>
			<circle cx={x} cy={y} r={r * 4} fill={`url(#mh${id})`} />
			{/* glow on the group so it is applied after the mask */}
			<g style={{filter: `drop-shadow(0 0 ${r * 0.5}px rgba(246,213,142,0.7))`}}>
				<circle cx={x} cy={y} r={r} fill={colors.goldLight} mask={`url(#mm${id})`} />
			</g>
		</g>
	);
};

type Pt = [number, number];

export type RidgeLayer = {
	points: Pt[];
	fill: string;
	stroke?: string;
	strokeOpacity?: number;
	strokeWidth?: number;
};

// Angular mountain ridges echoing the line-art peaks in the logo.
export const Mountains: React.FC<{width: number; height: number; layers: RidgeLayer[]}> = ({
	width,
	height,
	layers,
}) => {
	const id = useId().replace(/:/g, '');
	return (
		<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
			{layers.map((layer, i) => {
				const ridge = layer.points.map(([x, y], j) => `${j === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
				const first = layer.points[0];
				const last = layer.points[layer.points.length - 1];
				const top = Math.min(...layer.points.map((p) => p[1]));
				return (
					<g key={i}>
						<defs>
							<linearGradient id={`f${id}${i}`} x1="0" y1={top} x2="0" y2={height} gradientUnits="userSpaceOnUse">
								<stop offset="0" stopColor={layer.fill} stopOpacity="0.92" />
								<stop offset="1" stopColor={colors.night} stopOpacity="1" />
							</linearGradient>
						</defs>
						<path
							d={`${ridge} L${last[0]} ${height} L${first[0]} ${height} Z`}
							fill={`url(#f${id}${i})`}
						/>
						{layer.stroke ? (
							<path
								d={ridge}
								fill="none"
								stroke={layer.stroke}
								strokeOpacity={layer.strokeOpacity ?? 1}
								strokeWidth={layer.strokeWidth ?? 2}
								strokeLinejoin="round"
								strokeLinecap="round"
							/>
						) : null}
					</g>
				);
			})}
		</svg>
	);
};

// Dashed boxes showing where each platform crops the image (preview only).
export const Guides: React.FC<{
	boxes: {x: number; y: number; w: number; h: number; label: string; color: string}[];
}> = ({boxes}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		{boxes.map((b) => (
			<div
				key={b.label}
				style={{
					position: 'absolute',
					left: b.x,
					top: b.y,
					width: b.w,
					height: b.h,
					border: `3px dashed ${b.color}`,
					color: b.color,
					fontFamily: 'sans-serif',
					fontSize: 22,
					padding: 6,
					boxSizing: 'border-box',
				}}
			>
				{b.label}
			</div>
		))}
	</AbsoluteFill>
);
