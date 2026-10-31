import React, {useId, useMemo} from 'react';
import {geoDistance, geoGraticule, geoOrthographic, geoPath} from 'd3-geo';
import landDots from './data/land-dots.json';
import {colors} from './theme';

const dots = landDots as [number, number][];

// Globe facing Africa, Europe and the Middle East.
const FACING: [number, number] = [18, 20];

const CX = 120;
const CY = 104;
const R = 72;
const ORBIT_RX = 102;
const ORBIT_RY = 27;
const ORBIT_TILT = -18;

const star = (x: number, y: number, s: number) => {
	const k = s * 0.16;
	return `M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`;
};

// Logo: a dotted globe (world news) circled by an orbit (science), resting on
// an open book (history and culture, carried over from the old logo).
export const GlobeEmblem: React.FC<{size: number; style?: React.CSSProperties}> = ({
	size,
	style,
}) => {
	const id = useId().replace(/:/g, '');

	const {points, graticule} = useMemo(() => {
		const projection = geoOrthographic()
			.rotate([-FACING[0], -FACING[1]])
			.translate([CX, CY])
			.scale(R)
			.clipAngle(90);
		const pts = dots
			.map((d) => ({d, dist: geoDistance(d, FACING)}))
			.filter((p) => p.dist < Math.PI / 2 - 0.03)
			.map((p) => {
				const [x, y] = projection(p.d) as [number, number];
				return {x, y, z: Math.cos(p.dist)};
			});
		const grat = geoPath(projection)(geoGraticule().step([30, 30])()) ?? '';
		return {points: pts, graticule: grat};
	}, []);

	const rad = (ORBIT_TILT * Math.PI) / 180;
	const electron = (t: number) => {
		const lx = ORBIT_RX * Math.cos(t);
		const ly = ORBIT_RY * Math.sin(t);
		return [CX + lx * Math.cos(rad) - ly * Math.sin(rad), CY + lx * Math.sin(rad) + ly * Math.cos(rad)];
	};
	const [ex, ey] = electron((62 * Math.PI) / 180);
	const [bx, by] = electron((205 * Math.PI) / 180);

	const orbit = `translate(${CX} ${CY}) rotate(${ORBIT_TILT})`;
	const backHalf = `M${-ORBIT_RX} 0 A${ORBIT_RX} ${ORBIT_RY} 0 0 1 ${ORBIT_RX} 0`;
	const frontHalf = `M${ORBIT_RX} 0 A${ORBIT_RX} ${ORBIT_RY} 0 0 1 ${-ORBIT_RX} 0`;

	return (
		<svg width={size} height={size} viewBox="0 0 240 240" style={{overflow: 'visible', ...style}}>
			<defs>
				<radialGradient id={`sea${id}`} cx="0.38" cy="0.32" r="0.75">
					<stop offset="0" stopColor="#2a2757" />
					<stop offset="0.6" stopColor="#15142c" />
					<stop offset="1" stopColor="#0b0a18" />
				</radialGradient>
				<radialGradient id={`halo${id}`}>
					<stop offset="0.55" stopColor={colors.gold} stopOpacity="0.22" />
					<stop offset="1" stopColor={colors.gold} stopOpacity="0" />
				</radialGradient>
				<linearGradient id={`orb${id}`} x1={-ORBIT_RX} y1="0" x2={ORBIT_RX} y2="0" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={colors.teal} />
					<stop offset="0.5" stopColor={colors.tealLight} />
					<stop offset="1" stopColor={colors.teal} />
				</linearGradient>
				<clipPath id={`clip${id}`}>
					<circle cx={CX} cy={CY} r={R} />
				</clipPath>
			</defs>

			<circle cx={CX} cy={CY} r={R * 1.45} fill={`url(#halo${id})`} />

			{/* back half of the orbit, hidden behind the globe */}
			<g transform={orbit}>
				<path d={backHalf} fill="none" stroke={`url(#orb${id})`} strokeWidth={2.6} strokeOpacity={0.55} />
			</g>
			<circle cx={bx} cy={by} r={3} fill={colors.tealLight} opacity={0.6} />

			{/* globe */}
			<circle cx={CX} cy={CY} r={R} fill={`url(#sea${id})`} />
			<g clipPath={`url(#clip${id})`}>
				<path d={graticule} fill="none" stroke={colors.gold} strokeOpacity={0.16} strokeWidth={0.8} />
				{points.map((p, i) => (
					<circle
						key={i}
						cx={p.x}
						cy={p.y}
						r={R * 0.0145 * (0.55 + 0.45 * p.z)}
						fill={colors.goldLight}
						opacity={0.25 + 0.7 * p.z}
					/>
				))}
			</g>
			<circle
				cx={CX}
				cy={CY}
				r={R}
				fill="none"
				stroke={colors.gold}
				strokeWidth={3.4}
				style={{filter: 'drop-shadow(0 0 5px rgba(226,169,75,0.6))'}}
			/>

			{/* front half of the orbit and its electron */}
			<g transform={orbit} style={{filter: 'drop-shadow(0 0 4px rgba(76,201,208,0.6))'}}>
				<path d={frontHalf} fill="none" stroke={`url(#orb${id})`} strokeWidth={3.2} strokeLinecap="round" />
			</g>
			<circle
				cx={ex}
				cy={ey}
				r={5.2}
				fill={colors.tealLight}
				style={{filter: 'drop-shadow(0 0 6px rgba(166,238,241,0.95))'}}
			/>

			{/* open book */}
			<g fill="none" stroke={colors.cream} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
				<path d="M120 188 C100 179 64 175 34 179 L34 215 C64 211 100 214 120 223 Z" fill={colors.navy} />
				<path d="M120 188 C140 179 176 175 206 179 L206 215 C176 211 140 214 120 223 Z" fill={colors.navy} />
				<path d="M24 185 L24 223 C64 219 100 222 120 231 C140 222 176 219 216 223 L216 185" />
			</g>

			<g fill={colors.goldLight} style={{filter: 'drop-shadow(0 0 4px rgba(246,213,142,0.8))'}}>
				<path d={star(38, 46, 7)} />
				<path d={star(206, 30, 4.5)} opacity={0.8} />
			</g>
		</svg>
	);
};
