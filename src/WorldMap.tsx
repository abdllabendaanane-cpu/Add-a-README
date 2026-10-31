import React, {useId, useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import landDots from './data/land-dots.json';
import {colors, fonts} from './theme';

const dots = landDots as [number, number][];

export type City = {
	name: string;
	lon: number;
	lat: number;
	label?: 'left' | 'right' | 'top' | 'bottom' | 'none';
};

// Centres of learning that shaped history and science.
export const CITIES: City[] = [
	{name: 'فاس', lon: -5.0, lat: 34.03, label: 'left'},
	{name: 'قرطبة', lon: -4.78, lat: 37.88, label: 'left'},
	{name: 'تمبكتو', lon: -3.0, lat: 16.77, label: 'bottom'},
	{name: 'روما', lon: 12.5, lat: 41.9, label: 'top'},
	{name: 'أثينا', lon: 23.73, lat: 37.98, label: 'none'},
	{name: 'إسطنبول', lon: 28.98, lat: 41.01, label: 'top'},
	{name: 'القاهرة', lon: 31.24, lat: 30.04, label: 'bottom'},
	{name: 'دمشق', lon: 36.29, lat: 33.51, label: 'none'},
	{name: 'بغداد', lon: 44.36, lat: 33.31, label: 'bottom'},
	{name: 'سمرقند', lon: 66.96, lat: 39.65, label: 'top'},
];

export const LINKS: [string, string][] = [
	['قرطبة', 'فاس'],
	['فاس', 'تمبكتو'],
	['فاس', 'القاهرة'],
	['قرطبة', 'روما'],
	['روما', 'أثينا'],
	['أثينا', 'القاهرة'],
	['إسطنبول', 'دمشق'],
	['القاهرة', 'بغداد'],
	['دمشق', 'بغداد'],
	['بغداد', 'سمرقند'],
	['تمبكتو', 'القاهرة'],
];

type Spot = {x: number; y: number; r: number; strength: number};

// Dotted world map (equirectangular) with glowing cities linked by arcs.
// x = x0 + (lon - lon0) * k, y = y0 - (lat - lat0) * k
export const WorldMap: React.FC<{
	width: number;
	height: number;
	k: number;
	lon0: number;
	lat0: number;
	x0: number;
	y0: number;
	dotRadius: number;
	scale: number;
	focus: Spot;
	dim?: Spot;
	cities?: City[];
	links?: [string, string][];
}> = ({width, height, k, lon0, lat0, x0, y0, dotRadius, scale, focus, dim, cities = CITIES, links = LINKS}) => {
	const id = useId().replace(/:/g, '');
	const project = (lon: number, lat: number) => ({x: x0 + (lon - lon0) * k, y: y0 - (lat - lat0) * k});

	const mapDots = useMemo(
		() =>
			dots
				.map(([lon, lat]) => project(lon, lat))
				.filter((p) => p.x > -10 && p.x < width + 10 && p.y > -10 && p.y < height + 10)
				.map((p) => {
					const df = Math.hypot(p.x - focus.x, p.y - focus.y) / focus.r;
					let o = 0.16 + focus.strength * Math.exp(-df * df);
					if (dim) {
						const dd = Math.hypot(p.x - dim.x, p.y - dim.y) / dim.r;
						o *= 1 - dim.strength * Math.exp(-dd * dd);
					}
					return {...p, o};
				}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[width, height, k, lon0, lat0, x0, y0],
	);

	const byName = Object.fromEntries(cities.map((c) => [c.name, {...c, ...project(c.lon, c.lat)}]));
	const s = scale;

	return (
		<AbsoluteFill>
			<svg width={width} height={height}>
				<defs>
					{links.map(([a, b], i) => (
						<linearGradient
							key={i}
							id={`l${id}${i}`}
							x1={byName[a].x}
							y1={byName[a].y}
							x2={byName[b].x}
							y2={byName[b].y}
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stopColor={colors.gold} stopOpacity="0.85" />
							<stop offset="0.5" stopColor={colors.goldLight} stopOpacity="1" />
							<stop offset="1" stopColor={colors.teal} stopOpacity="0.85" />
						</linearGradient>
					))}
				</defs>

				{mapDots.map((p, i) => (
					<circle key={i} cx={p.x} cy={p.y} r={dotRadius} fill={colors.cream} opacity={p.o} />
				))}

				{/* arcs between cities, bowed upwards */}
				<g fill="none" strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${4 * s}px rgba(246,213,142,0.55))`}}>
					{links.map(([a, b], i) => {
						const p = byName[a];
						const q = byName[b];
						const mx = (p.x + q.x) / 2;
						const my = (p.y + q.y) / 2;
						const len = Math.hypot(q.x - p.x, q.y - p.y);
						const nx = -(q.y - p.y) / len;
						const ny = (q.x - p.x) / len;
						const flip = ny > 0 ? -1 : 1; // always bow towards the top
						const lift = len * 0.22 * flip;
						return (
							<path
								key={i}
								d={`M${p.x} ${p.y} Q${mx + nx * lift} ${my + ny * lift} ${q.x} ${q.y}`}
								stroke={`url(#l${id}${i})`}
								strokeWidth={2.2 * s}
								strokeOpacity={0.9}
							/>
						);
					})}
				</g>

				{cities.map((c) => {
					const p = byName[c.name];
					const off = 16 * s;
					const label =
						c.label === 'left'
							? {x: p.x - off, y: p.y + 8 * s, anchor: 'end'}
							: c.label === 'right'
								? {x: p.x + off, y: p.y + 8 * s, anchor: 'start'}
								: c.label === 'top'
									? {x: p.x, y: p.y - off, anchor: 'middle'}
									: c.label === 'bottom'
										? {x: p.x, y: p.y + off + 18 * s, anchor: 'middle'}
										: null;
					return (
						<g key={c.name}>
							<circle cx={p.x} cy={p.y} r={14 * s} fill="none" stroke={colors.teal} strokeOpacity={0.28} strokeWidth={1.5 * s} />
							<circle cx={p.x} cy={p.y} r={8.5 * s} fill="none" stroke={colors.tealLight} strokeOpacity={0.55} strokeWidth={1.5 * s} />
							<circle
								cx={p.x}
								cy={p.y}
								r={4.2 * s}
								fill={colors.goldLight}
								style={{filter: `drop-shadow(0 0 ${6 * s}px rgba(246,213,142,1))`}}
							/>
							{label ? (
								<text
									x={label.x}
									y={label.y}
									textAnchor={label.anchor as 'start' | 'middle' | 'end'}
									fontFamily={fonts.arabic}
									fontWeight={600}
									fontSize={22 * s}
									fill={colors.cream}
									fillOpacity={0.82}
								>
									{c.name}
								</text>
							) : null}
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

// Night-navy background with soft gold/teal light, film grain and vignette.
export const Atmosphere: React.FC<{
	width: number;
	height: number;
	goldGlow: {x: string; y: string};
	tealGlow?: {x: string; y: string};
}> = ({width, height, goldGlow, tealGlow}) => {
	const id = useId().replace(/:/g, '');
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse 80% 75% at 50% 45%, ${colors.dusk} 0%, ${colors.navy} 50%, ${colors.night} 100%)`}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${goldGlow.x} ${goldGlow.y}, rgba(226,169,75,0.16) 0%, rgba(226,169,75,0) 32%)`,
				}}
			/>
			{tealGlow ? (
				<AbsoluteFill
					style={{
						background: `radial-gradient(circle at ${tealGlow.x} ${tealGlow.y}, rgba(76,201,208,0.10) 0%, rgba(76,201,208,0) 35%)`,
					}}
				/>
			) : null}
			<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
				<filter id={`n${id}`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width={width} height={height} filter={`url(#n${id})`} opacity={0.06} style={{mixBlendMode: 'overlay'}} />
			</svg>
		</AbsoluteFill>
	);
};

export const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background: 'radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
			pointerEvents: 'none',
		}}
	/>
);
