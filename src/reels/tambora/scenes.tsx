import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoDistance, geoOrthographic} from 'd3-geo';
import landDots from '../../data/land-dots.json';
import seasiaDots from '../../data/seasia-dots.json';
import {colors, fonts} from '../../theme';

// Animated backgrounds for the Tambora reel (1080x1920). Every scene reads
// its own local time, so it starts from 0 inside its <Sequence>.

const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const useTime = (time?: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return time ?? frame / fps;
};

const Vignette: React.FC<{strength?: number}> = ({strength = 0.7}) => (
	<AbsoluteFill
		style={{background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,${strength}) 100%)`}}
	/>
);

// Darkens the top (headline) and bottom (caption) bands for legibility.
const TextBands: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.7) 100%)',
		}}
	/>
);

type Puff = {x: number; y: number; r: number; o: number; c: number[]; p: number};

const PuffLayer: React.FC<{puffs: Puff[]}> = ({puffs}) => (
	<>
		{puffs.map((q, i) => (
			<div
				key={i}
				style={{
					position: 'absolute',
					left: q.x - q.r,
					top: q.y - q.r,
					width: q.r * 2,
					height: q.r * 2,
					borderRadius: '50%',
					background: `radial-gradient(circle at 50% 55%, rgba(${q.c.join(',')},${q.o}) 0%, rgba(${q.c.join(',')},${q.o * 0.55}) 42%, rgba(${q.c.join(',')},0) 70%)`,
				}}
			/>
		))}
	</>
);

// Falling ash/snow flakes.
const Flakes: React.FC<{t: number; count: number; seed: string; color: string; speed: number; size: [number, number]; opacity: [number, number]}> = ({
	t,
	count,
	seed,
	color,
	speed,
	size,
	opacity,
}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		{new Array(count).fill(0).map((_, i) => {
			const v = speed * (0.6 + random(`${seed}v${i}`) * 0.8);
			const y = ((random(`${seed}y${i}`) * (H + 80) + t * v) % (H + 80)) - 40;
			const x = random(`${seed}x${i}`) * W + Math.sin(t * 0.9 + i) * 26;
			const r = lerp(size[0], size[1], random(`${seed}r${i}`));
			return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={lerp(opacity[0], opacity[1], random(`${seed}o${i}`))} />;
		})}
	</svg>
);

/* ------------------------------------------------------------------ */
/* Eruption                                                             */
/* ------------------------------------------------------------------ */

const CRATER = {x: 540, y: 1150};

const VOLCANO =
	'M -140 1920 L -140 1640 L 120 1520 Q 330 1330 455 1165 L 495 1182 L 585 1180 L 628 1160 Q 760 1330 960 1520 L 1220 1640 L 1220 1920 Z';

const LAVA = [
	'M 498 1184 C 480 1262 450 1332 402 1420 S 300 1560 248 1662',
	'M 574 1182 C 602 1272 642 1342 700 1432 S 790 1582 860 1702',
	'M 538 1184 C 545 1262 530 1332 548 1424',
];

export const EruptionBg: React.FC<{time?: number; flash?: boolean; shake?: boolean}> = ({
	time,
	flash = true,
	shake = true,
}) => {
	const t = useTime(time);
	const amp = shake ? 18 * Math.exp(-t * 1.3) + 2.5 : 0;
	const tick = Math.floor(t * 30);
	const sx = (random(`sx${tick}`) - 0.5) * 2 * amp;
	const sy = (random(`sy${tick}`) - 0.5) * 2 * amp;
	const zoom = 1.05 + t * 0.012;

	const puffs: Puff[] = new Array(80)
		.fill(0)
		.map((_, i) => {
			const life = 4.5 + random(`pl${i}`) * 2.5;
			const age = (t + random(`po${i}`) * life) % life;
			const p = age / life;
			const rise = 1 - Math.pow(1 - p, 1.7);
			const spread = random(`pd${i}`) - 0.5;
			const r = (70 + 360 * Math.pow(p, 0.75)) * (0.7 + 0.6 * random(`pr${i}`));
			const mix = Math.min(1, p * 2.2);
			return {
				x: CRATER.x + spread * 60 + spread * 640 * p + Math.sin(t * 0.8 + i) * 25 * p,
				y: CRATER.y - 40 - rise * 1250,
				r,
				o: 0.9 * Math.min(1, age / 0.25) * Math.pow(1 - p, 0.6),
				c: [lerp(175, 78, mix), lerp(82, 70, mix), lerp(36, 66, mix)].map(Math.round),
				p,
			};
		})
		.sort((a, b) => b.p - a.p);

	const embers = new Array(150).fill(0).map((_, i) => {
		const life = 1.1 + random(`el${i}`) * 1.3;
		const age = (t + random(`eo${i}`) * life) % life;
		const vx = (random(`ex${i}`) - 0.5) * 820;
		const vy = -(700 + random(`ey${i}`) * 1100);
		return {
			x: CRATER.x + (random(`es${i}`) - 0.5) * 50 + vx * age,
			y: CRATER.y - 20 + vy * age + 0.5 * 1100 * age * age,
			r: 2.5 + random(`er${i}`) * 4.5,
			o: 1 - age / life,
			hot: age / life < 0.4,
		};
	});

	const bolts = new Array(12).fill(0).map((_, k) => {
		const tk = 0.6 + k * 0.9 + random(`lt${k}`) * 0.5;
		if (t < tk || t > tk + 0.12) return null;
		let x = 540 + (random(`lx${k}`) - 0.5) * 420;
		let y = 380 + random(`ly${k}`) * 260;
		let d = `M ${x} ${y}`;
		for (let s = 0; s < 8; s++) {
			x += (random(`lsx${k}${s}`) - 0.5) * 80;
			y += 40 + random(`lsy${k}${s}`) * 32;
			d += ` L ${x} ${y}`;
		}
		return d;
	});
	const bolt = bolts.some(Boolean);

	return (
		<AbsoluteFill style={{background: '#050303', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<AbsoluteFill
					style={{
						background:
							'linear-gradient(180deg, #070303 0%, #1a0805 42%, #4a1407 64%, #2a0b05 78%, #070404 100%)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: CRATER.x - 520,
						top: CRATER.y - 520,
						width: 1040,
						height: 1040,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(255,110,30,0.55) 0%, rgba(255,80,20,0.18) 40%, rgba(255,60,10,0) 70%)',
					}}
				/>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<defs>
						<linearGradient id="volc" x1="0" y1="1150" x2="0" y2="1920" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#2c1711" />
							<stop offset="1" stopColor="#060303" />
						</linearGradient>
						<filter id="lavaGlow" x="-20%" y="-20%" width="140%" height="140%">
							<feGaussianBlur stdDeviation="10" />
						</filter>
					</defs>
					<path d={VOLCANO} fill="url(#volc)" />
					<path
						d="M 120 1520 Q 330 1330 455 1165 M 628 1160 Q 760 1330 960 1520"
						fill="none"
						stroke="rgba(255,120,40,0.35)"
						strokeWidth={3}
					/>
					{LAVA.map((d, i) => (
						<g key={i}>
							<path d={d} fill="none" stroke="#ff6a1a" strokeWidth={26} strokeOpacity={0.35} filter="url(#lavaGlow)" />
							<path
								d={d}
								fill="none"
								stroke="#ff7a24"
								strokeWidth={9}
								strokeLinecap="round"
								strokeDasharray="60 36"
								strokeDashoffset={-t * 80 - i * 30}
							/>
						</g>
					))}
				</svg>
				<PuffLayer puffs={puffs} />
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<g style={{filter: 'drop-shadow(0 0 6px rgba(255,140,40,0.9))'}}>
						{embers.map((e, i) => (
							<circle key={i} cx={e.x} cy={e.y} r={e.r} fill={e.hot ? '#ffd27a' : '#ff5a1f'} opacity={e.o} />
						))}
					</g>
					<g style={{filter: 'drop-shadow(0 0 10px rgba(200,220,255,0.95))'}}>
						{bolts.map((d, i) =>
							d ? <path key={i} d={d} fill="none" stroke="#e8eeff" strokeWidth={4} strokeLinejoin="round" /> : null,
						)}
					</g>
				</svg>
			</AbsoluteFill>
			{bolt ? <AbsoluteFill style={{background: 'rgba(220,230,255,0.08)'}} /> : null}
			{flash ? <AbsoluteFill style={{background: '#fff2d8', opacity: 0.85 * clamp01(1 - t / 0.35)}} /> : null}
			<Vignette />
			<TextBands />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* Maps                                                                 */
/* ------------------------------------------------------------------ */

const SEASIA = seasiaDots as [number, number][];
const TAMBORA = {lon: 118.0, lat: -8.25};

type Camera = {clon: number; clat: number; k: number; cy: number};
const project = (cam: Camera, lon: number, lat: number) => ({
	x: W / 2 + (lon - cam.clon) * cam.k,
	y: cam.cy - (lat - cam.clat) * cam.k,
});

const DotMap: React.FC<{cam: Camera; focus: {x: number; y: number}}> = ({cam, focus}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const ctx = ref.current?.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, W, H);
		const r = Math.max(0.9, 0.25 * cam.k * 0.36);
		ctx.fillStyle = colors.cream;
		for (const [lon, lat] of SEASIA) {
			const p = project(cam, lon, lat);
			if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) continue;
			const d = Math.hypot(p.x - focus.x, p.y - focus.y) / 520;
			ctx.globalAlpha = 0.3 + 0.45 * Math.exp(-d * d);
			ctx.beginPath();
			ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	});
	return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

const MapLabel: React.FC<{x: number; y: number; text: string; size?: number; opacity?: number}> = ({
	x,
	y,
	text,
	size = 34,
	opacity = 0.75,
}) => (
	<div
		dir="rtl"
		style={{
			position: 'absolute',
			left: x - 200,
			top: y - size,
			width: 400,
			textAlign: 'center',
			fontFamily: fonts.arabic,
			fontWeight: 700,
			fontSize: size,
			color: colors.cream,
			opacity,
			textShadow: '0 2px 10px rgba(0,0,0,0.9)',
		}}
	>
		{text}
	</div>
);

const Pin: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
	const phase = (t * 1.1) % 1;
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<circle cx={x} cy={y} r={14 + phase * 70} fill="none" stroke="#ff7a24" strokeWidth={4} opacity={(1 - phase) * 0.9} />
			<circle cx={x} cy={y} r={30} fill="rgba(255,106,26,0.25)" />
			<circle cx={x} cy={y} r={13} fill="#ff6a1a" style={{filter: 'drop-shadow(0 0 14px rgba(255,120,40,1))'}} />
			<circle cx={x} cy={y} r={5} fill="#fff2d8" />
		</svg>
	);
};

const MapBase: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 47%, #16213f 0%, #0b1022 55%, #05070f 100%)', overflow: 'hidden'}}>
		{children}
		<Vignette strength={0.6} />
		<TextBands />
	</AbsoluteFill>
);

export const MapZoomBg: React.FC<{durationSec: number}> = ({durationSec}) => {
	const t = useTime();
	const e = easeInOut(clamp01(t / (durationSec * 0.85)));
	const cam: Camera = {
		clon: lerp(114, TAMBORA.lon, e),
		clat: lerp(-2, TAMBORA.lat, e),
		k: 16 * Math.pow(48 / 16, e),
		cy: 900,
	};
	const pin = project(cam, TAMBORA.lon, TAMBORA.lat);
	return (
		<MapBase>
			<DotMap cam={cam} focus={pin} />
			<Pin x={pin.x} y={pin.y} t={t} />
			<MapLabel x={pin.x} y={pin.y - 52} text="تامبورا" size={44} opacity={clamp01((t - 0.6) / 0.4)} />
		</MapBase>
	);
};

export const MapSoundBg: React.FC = () => {
	const t = useTime();
	const cam: Camera = {clon: 110.5, clat: -4.5, k: 20 + t * 0.25, cy: 900};
	const pin = project(cam, TAMBORA.lon, TAMBORA.lat);
	// 2000 km is about 18 degrees of arc near the equator.
	const R = 18 * cam.k;
	const ringIn = clamp01((t - 0.4) / 0.6);
	const labels = [
		{text: 'سومطرة', ...project(cam, 101.5, -0.3)},
		{text: 'جاوة', ...project(cam, 110.0, -7.6)},
		{text: 'بورنيو', ...project(cam, 114.0, 0.8)},
	];
	return (
		<MapBase>
			<DotMap cam={cam} focus={pin} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{new Array(5).fill(0).map((_, i) => {
					const ph = (t * 0.55 + i / 5) % 1;
					return (
						<circle
							key={i}
							cx={pin.x}
							cy={pin.y}
							r={ph * R}
							fill="none"
							stroke={colors.goldLight}
							strokeWidth={4}
							opacity={(1 - ph) * 0.75}
						/>
					);
				})}
				<circle
					cx={pin.x}
					cy={pin.y}
					r={R}
					fill="rgba(226,169,75,0.05)"
					stroke={colors.cream}
					strokeWidth={3}
					strokeDasharray="14 12"
					opacity={ringIn}
				/>
			</svg>
			{labels.map((l) => (
				<MapLabel key={l.text} x={l.x} y={l.y} text={l.text} opacity={0.8} />
			))}
			<Pin x={pin.x} y={pin.y} t={t} />
			<MapLabel x={pin.x - R * 0.72} y={pin.y - R * 0.72} text="2000 كم" size={46} opacity={ringIn} />
		</MapBase>
	);
};

/* ------------------------------------------------------------------ */
/* Mountain losing its top                                              */
/* ------------------------------------------------------------------ */

const GROUND = 1380;
const PX_PER_M = 0.17;
const yAt = (m: number) => GROUND - m * PX_PER_M;
const MOUNTAIN_FULL = `M 60 ${GROUND} L 250 1230 L 380 1020 L 470 800 L 540 ${yAt(4300)} L 610 800 L 700 1020 L 830 1230 L 1020 ${GROUND} Z`;
const MOUNTAIN_AFTER = `M 60 ${GROUND} L 250 1230 L 380 1020 L 431 ${yAt(2850)} L 470 945 L 610 945 L 649 ${yAt(2850)} L 700 1020 L 830 1230 L 1020 ${GROUND} Z`;
const MOUNTAIN_TOP = `M 431 ${yAt(2850)} L 470 800 L 540 ${yAt(4300)} L 610 800 L 649 ${yAt(2850)} Z`;

export const MountainBg: React.FC = () => {
	const t = useTime();
	const BLOW = 0.6;
	const tb = Math.max(0, t - BLOW);
	const topOpacity = t < BLOW ? 1 : clamp01(1 - tb / 0.5);
	const outlineIn = clamp01((t - BLOW - 0.3) / 0.5);

	const debris = new Array(40).fill(0).map((_, i) => {
		const vx = (random(`dx${i}`) - 0.5) * 900;
		const vy = -(500 + random(`dy${i}`) * 900);
		return {
			x: 540 + vx * tb,
			y: yAt(3400) + vy * tb + 0.5 * 1300 * tb * tb,
			s: 6 + random(`ds${i}`) * 12,
			o: t < BLOW ? 0 : clamp01(1 - tb / 1.6),
		};
	});

	const ash: Puff[] =
		t < BLOW
			? []
			: new Array(30)
					.fill(0)
					.map((_, i) => {
						const life = 3 + random(`al${i}`) * 2;
						const age = (tb + random(`ao${i}`) * life) % life;
						const p = age / life;
						const spread = random(`ad${i}`) - 0.5;
						return {
							x: 540 + spread * 80 + spread * 420 * p,
							y: yAt(2850) - 10 - (1 - Math.pow(1 - p, 1.6)) * 700,
							r: (50 + 220 * Math.pow(p, 0.8)) * (0.7 + 0.6 * random(`ar${i}`)),
							o: 0.7 * Math.min(1, age / 0.25) * Math.pow(1 - p, 0.7) * clamp01(tb / 0.4),
							c: [96, 84, 78],
							p,
						};
					})
					.sort((a, b) => b.p - a.p);

	const rulerMarks = [1000, 2000, 3000, 4000];

	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #0a0807 0%, #1c1410 55%, #2b1d16 72%, #0c0907 100%)', overflow: 'hidden'}}>
			<Flakes t={t} count={90} seed="mash" color="#bfb3a8" speed={60} size={[1.5, 4]} opacity={[0.15, 0.45]} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="mtn" x1="0" y1="650" x2="0" y2={GROUND} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#7a5a48" />
						<stop offset="0.55" stopColor="#4a3428" />
						<stop offset="1" stopColor="#1d130e" />
					</linearGradient>
				</defs>
				<rect x={0} y={GROUND} width={W} height={H - GROUND} fill="#0b0807" />
				<path d={MOUNTAIN_AFTER} fill="url(#mtn)" stroke="rgba(255,190,140,0.28)" strokeWidth={3} strokeLinejoin="round" />
				<path
					d={MOUNTAIN_TOP}
					fill="url(#mtn)"
					opacity={topOpacity}
					transform={`translate(0 ${-tb * tb * 900}) rotate(${tb * 25} 540 ${yAt(3500)})`}
				/>
				{/* caldera glow */}
				<ellipse cx={540} cy={yAt(2850) + 30} rx={90} ry={22} fill="#ff6a1a" opacity={0.55 * clamp01(tb / 0.3)} style={{filter: 'blur(8px)'}} />
				{/* original outline */}
				<path
					d={MOUNTAIN_FULL}
					fill="none"
					stroke={colors.cream}
					strokeWidth={3}
					strokeDasharray="14 12"
					opacity={0.7 * outlineIn}
				/>
				{/* height ruler */}
				<line x1={110} y1={GROUND} x2={110} y2={yAt(4500)} stroke={colors.cream} strokeOpacity={0.5} strokeWidth={3} />
				{rulerMarks.map((m) => (
					<g key={m}>
						<line x1={98} y1={yAt(m)} x2={122} y2={yAt(m)} stroke={colors.cream} strokeOpacity={0.6} strokeWidth={3} />
						<text x={132} y={yAt(m) + 9} fontFamily={fonts.latin} fontWeight={800} fontSize={26} fill={colors.cream} fillOpacity={0.55}>
							{m}
						</text>
					</g>
				))}
				<line x1={110} y1={yAt(4300)} x2={990} y2={yAt(4300)} stroke={colors.cream} strokeWidth={3} strokeDasharray="10 10" opacity={0.6 * outlineIn} />
				<line x1={110} y1={yAt(2850)} x2={990} y2={yAt(2850)} stroke={colors.gold} strokeWidth={4} strokeDasharray="10 10" opacity={clamp01(tb / 0.5)} />
				<g style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9))'}}>
					{debris.map((d, i) => (
						<rect key={i} x={d.x} y={d.y} width={d.s} height={d.s * 0.8} fill="#3a2a22" opacity={d.o} transform={`rotate(${i * 37 + tb * 200} ${d.x} ${d.y})`} />
					))}
				</g>
			</svg>
			<PuffLayer puffs={ash} />
			<MapLabel x={880} y={yAt(4300) - 8} text="4300 م" size={42} opacity={0.9 * outlineIn} />
			<MapLabel x={880} y={yAt(2850) - 8} text="2850 م" size={42} opacity={clamp01(tb / 0.5)} />
			<Vignette strength={0.6} />
			<TextBands />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* Victim counter                                                       */
/* ------------------------------------------------------------------ */

export const CounterBg: React.FC = () => {
	const t = useTime();
	const n = Math.round(71000 * easeOut(clamp01((t - 0.2) / 1.6)));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 48%, #3a0b08 0%, #140405 55%, #050203 100%)'}}>
			<Flakes t={t} count={140} seed="cash" color="#c9bdb2" speed={55} size={[1.5, 4.5]} opacity={[0.2, 0.55]} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: 140}}>
				<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 64, color: colors.cream, opacity: 0.85}}>
					أكثر من
				</div>
				<div
					style={{
						fontFamily: fonts.latin,
						fontWeight: 800,
						fontSize: 230,
						lineHeight: 1.05,
						backgroundImage: 'linear-gradient(180deg, #ff7a6a, #e5392f 60%, #a3160f)',
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
						filter: 'drop-shadow(0 0 40px rgba(229,57,47,0.45))',
					}}
				>
					{n.toLocaleString('en-US')}
				</div>
				<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: 84, color: colors.cream}}>
					شخص
				</div>
			</AbsoluteFill>
			<Vignette />
			<TextBands />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* "But..." transition                                                  */
/* ------------------------------------------------------------------ */

export const DarkBg: React.FC = () => {
	const t = useTime();
	const pulse = 0.5 + 0.5 * Math.sin(t * 3);
	return (
		<AbsoluteFill style={{background: '#040203', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 52%, rgba(255,90,30,${0.16 + 0.1 * pulse}) 0%, rgba(120,20,10,0.12) 25%, rgba(0,0,0,0) 55%)`,
					transform: `scale(${1 + t * 0.05})`,
				}}
			/>
			<Flakes t={t} count={110} seed="dash" color="#b8aca2" speed={40} size={[1.5, 4]} opacity={[0.15, 0.45]} />
			<Vignette strength={0.8} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* Globe under a sulfur veil                                            */
/* ------------------------------------------------------------------ */

const LAND = landDots as [number, number][];
const GLOBE = {x: 540, y: 900, r: 330};

const GlobeCanvas: React.FC<{t: number; haze: number}> = ({t, haze}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const ctx = ref.current?.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, W, H);
		const center: [number, number] = [118 - 5 * t, 8];
		const proj = geoOrthographic().rotate([-center[0], -center[1]]).translate([GLOBE.x, GLOBE.y]).scale(GLOBE.r);

		// ocean
		const sea = ctx.createRadialGradient(GLOBE.x - 110, GLOBE.y - 120, 40, GLOBE.x, GLOBE.y, GLOBE.r);
		sea.addColorStop(0, '#243a78');
		sea.addColorStop(0.65, '#101a3c');
		sea.addColorStop(1, '#070b1c');
		ctx.fillStyle = sea;
		ctx.beginPath();
		ctx.arc(GLOBE.x, GLOBE.y, GLOBE.r, 0, Math.PI * 2);
		ctx.fill();

		// land
		ctx.fillStyle = colors.goldLight;
		for (const d of LAND) {
			const dist = geoDistance(d, center);
			if (dist > Math.PI / 2 - 0.02) continue;
			const p = proj(d);
			if (!p) continue;
			const z = Math.cos(dist);
			ctx.globalAlpha = 0.25 + 0.7 * z;
			ctx.beginPath();
			ctx.arc(p[0], p[1], 2.4 * (0.55 + 0.45 * z), 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;

		// sulfur haze spreading from Tambora, then covering the whole globe
		ctx.save();
		ctx.beginPath();
		ctx.arc(GLOBE.x, GLOBE.y, GLOBE.r, 0, Math.PI * 2);
		ctx.clip();
		const tp = proj([118, -8.25]) ?? [GLOBE.x, GLOBE.y];
		const hr = GLOBE.r * (0.25 + 2.4 * haze);
		const g = ctx.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], hr);
		g.addColorStop(0, `rgba(214,190,140,${0.6 * Math.min(1, haze * 2)})`);
		g.addColorStop(0.7, `rgba(200,178,130,${0.45 * Math.min(1, haze * 2)})`);
		g.addColorStop(1, 'rgba(200,178,130,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
		ctx.fillStyle = `rgba(190,170,125,${0.32 * clamp01((haze - 0.4) / 0.6)})`;
		ctx.fillRect(0, 0, W, H);
		ctx.restore();
	});
	return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

export const GlobeBg: React.FC<{thermoAt: number}> = ({thermoAt}) => {
	const t = useTime();
	const haze = clamp01((t - 0.4) / 4.8);
	const sunDim = 1 - 0.6 * haze;
	const halo = haze < 0.5 ? 'rgba(76,201,208,0.35)' : 'rgba(210,180,120,0.45)';
	const tt = t - thermoAt;
	const level = tt < 0 ? 0.72 : lerp(0.72, 0.56, easeOut(clamp01(tt / 1.2)));

	return (
		<AbsoluteFill style={{background: '#03040a', overflow: 'hidden'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{new Array(170).fill(0).map((_, i) => (
					<circle
						key={i}
						cx={random(`gsx${i}`) * W}
						cy={random(`gsy${i}`) * H}
						r={0.6 + random(`gsr${i}`) * 1.6}
						fill={colors.cream}
						opacity={0.15 + random(`gso${i}`) * 0.5}
					/>
				))}
				{/* sun and its rays */}
				<g opacity={sunDim}>
					<circle cx={880} cy={330} r={260} fill="url(#sunHalo)" />
					{new Array(12).fill(0).map((_, i) => {
						const a = (i / 12) * Math.PI * 2 + t * 0.15;
						return (
							<line
								key={i}
								x1={880 + Math.cos(a) * 95}
								y1={330 + Math.sin(a) * 95}
								x2={880 + Math.cos(a) * 150}
								y2={330 + Math.sin(a) * 150}
								stroke="#ffd27a"
								strokeWidth={6}
								strokeLinecap="round"
								opacity={0.7}
							/>
						);
					})}
					<circle cx={880} cy={330} r={72} fill="#ffd56b" style={{filter: 'drop-shadow(0 0 40px rgba(255,210,107,0.9))'}} />
				</g>
				<defs>
					<radialGradient id="sunHalo">
						<stop offset="0" stopColor="#ffd27a" stopOpacity="0.35" />
						<stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
					</radialGradient>
				</defs>
				<circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r + 14} fill="none" stroke={halo} strokeWidth={24} style={{filter: 'blur(10px)'}} />
			</svg>
			<GlobeCanvas t={t} haze={haze} />
			{/* thermometer */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: clamp01(tt / 0.3)}}>
				<rect x={935} y={1010} width={56} height={300} rx={28} fill="rgba(255,255,255,0.1)" stroke={colors.cream} strokeWidth={4} />
				<rect x={949} y={1010 + 300 * (1 - level)} width={28} height={300 * level} rx={14} fill="#e5392f" />
				<circle cx={963} cy={1340} r={44} fill="#e5392f" stroke={colors.cream} strokeWidth={4} />
				{[0.3, 0.5, 0.7, 0.9].map((v) => (
					<line key={v} x1={995} y1={1010 + 300 * (1 - v)} x2={1015} y2={1010 + 300 * (1 - v)} stroke={colors.cream} strokeWidth={3} opacity={0.7} />
				))}
			</svg>
			<Vignette strength={0.6} />
			<TextBands />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 1816: snow in June                                                   */
/* ------------------------------------------------------------------ */

const Snowflake: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="-50 -50 100 100">
		<g stroke={color} strokeWidth={6} strokeLinecap="round" fill="none">
			{[0, 60, 120].map((a) => (
				<g key={a} transform={`rotate(${a})`}>
					<line x1={0} y1={-44} x2={0} y2={44} />
					<path d="M -12 -32 L 0 -20 L 12 -32 M -12 32 L 0 20 L 12 32" />
				</g>
			))}
		</g>
	</svg>
);

const Wheat: React.FC<{x: number; wither: number; flip: boolean}> = ({x, wither, flip}) => {
	const color = `rgb(${Math.round(lerp(226, 110, wither))},${Math.round(lerp(169, 84, wither))},${Math.round(lerp(75, 50, wither))})`;
	return (
		<g transform={`translate(${x} 1660) rotate(${(flip ? -1 : 1) * 38 * wither})`}>
			<line x1={0} y1={0} x2={0} y2={-170} stroke={color} strokeWidth={6} strokeLinecap="round" />
			{new Array(5).fill(0).map((_, i) => (
				<g key={i}>
					<ellipse cx={-11} cy={-110 - i * 15} rx={8} ry={14} fill={color} transform={`rotate(-30 -11 ${-110 - i * 15})`} />
					<ellipse cx={11} cy={-118 - i * 15} rx={8} ry={14} fill={color} transform={`rotate(30 11 ${-118 - i * 15})`} />
				</g>
			))}
		</g>
	);
};

export const SnowBg: React.FC<{witherAt: number}> = ({witherAt}) => {
	const t = useTime();
	const float = Math.sin(t * 1.4) * 8;
	const wither = easeOut(clamp01((t - witherAt) / 0.9));
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #0a1422 0%, #16294a 55%, #26476b 100%)', overflow: 'hidden'}}>
			{/* calendar */}
			<div
				style={{
					position: 'absolute',
					left: 540 - 220,
					top: 590 + float,
					width: 440,
					height: 470,
					borderRadius: 30,
					background: '#f6f1e7',
					boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
					transform: 'rotate(-3deg)',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<div
					dir="rtl"
					style={{
						width: '100%',
						height: 124,
						background: '#c8352c',
						color: '#fff',
						fontFamily: fonts.arabic,
						fontWeight: 800,
						fontSize: 70,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					يونيو
				</div>
				<div style={{marginTop: 36}}>
					<Snowflake size={190} color="#2a4a6b" />
				</div>
				<div style={{fontFamily: fonts.latin, fontWeight: 800, fontSize: 64, color: '#2a4a6b', marginTop: 4}}>1816</div>
			</div>
			<Flakes t={t} count={170} seed="snow" color="#ffffff" speed={130} size={[2, 7]} opacity={[0.35, 0.9]} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{new Array(7).fill(0).map((_, i) => (
					<Wheat key={i} x={150 + i * 130} wither={wither} flip={i % 2 === 0} />
				))}
				<path d="M 0 1640 Q 200 1590 420 1630 T 820 1620 T 1080 1610 L 1080 1920 L 0 1920 Z" fill="#e9f1f8" />
				<path d="M 0 1700 Q 260 1660 540 1700 T 1080 1690 L 1080 1920 L 0 1920 Z" fill="#cfdeeb" />
			</svg>
			<Vignette strength={0.55} />
			<TextBands />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* City at night under an ash cloud                                     */
/* ------------------------------------------------------------------ */

export const City: React.FC<{top: number; t: number}> = ({top, t}) => {
	const buildings: {x: number; w: number; h: number}[] = [];
	let x = -20;
	let i = 0;
	while (x < W + 20) {
		const w = 60 + random(`bw${i}`) * 90;
		const h = 150 + random(`bh${i}`) * 380;
		buildings.push({x, w, h});
		x += w + 6;
		i++;
	}
	const base = H;
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			{buildings.map((b, j) => {
				const y = Math.max(top, base - b.h);
				const windows = [];
				for (let wy = y + 20; wy < base - 20; wy += 34) {
					for (let wx = b.x + 12; wx < b.x + b.w - 16; wx += 24) {
						const k = `${j}-${wx}-${wy}`;
						if (random(`win${k}`) < 0.33) {
							const flick = random(`wf${k}`) < 0.06 && Math.floor(t * 4 + random(`wp${k}`) * 10) % 3 === 0;
							windows.push(<rect key={k} x={wx} y={wy} width={10} height={14} fill="#ffd27a" opacity={flick ? 0.2 : 0.85} />);
						}
					}
				}
				return (
					<g key={j}>
						<rect x={b.x} y={y} width={b.w} height={base - y} fill="#06060a" />
						{windows}
					</g>
				);
			})}
		</svg>
	);
};

export const EndBg: React.FC = () => {
	const t = useTime();
	const cloud: Puff[] = new Array(60)
		.fill(0)
		.map((_, i) => {
			const life = 5 + random(`cl${i}`) * 3;
			const age = (t + random(`co${i}`) * life) % life;
			const p = age / life;
			return {
				x: random(`cx${i}`) * W + Math.sin(t * 0.5 + i) * 40,
				y: -200 + p * 900 + random(`cy${i}`) * 200,
				r: (180 + 260 * random(`cr${i}`)) * (0.8 + 0.4 * p),
				o: 0.75 * Math.sin(Math.PI * p),
				c: [58, 48, 46],
				p,
			};
		})
		.sort((a, b) => a.p - b.p);
	const flicker = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #050307 0%, #12060a 40%, #3a0a07 78%, #120404 100%)', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{background: `radial-gradient(ellipse 80% 30% at 50% 80%, rgba(255,80,30,${0.3 * flicker}) 0%, rgba(255,60,20,0) 70%)`}}
			/>
			<PuffLayer puffs={cloud} />
			<Flakes t={t} count={120} seed="eash" color="#c4b8ae" speed={70} size={[1.5, 4.5]} opacity={[0.2, 0.55]} />
			<City top={1380} t={t} />
			<Vignette />
			<TextBands />
		</AbsoluteFill>
	);
};
