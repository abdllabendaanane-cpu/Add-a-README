import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CategoryLine, Variant, Wordmark} from './Brand';
import {GlobeEmblem} from './GlobeEmblem';
import {Guides} from './Scenery';
import {Atmosphere, CITIES, LINKS, Vignette, WorldMap} from './WorldMap';

// Logo stacked over the wordmark and the category line.
const Lockup: React.FC<{centerX: number; scale: number; offsetY?: number; variant: Variant}> = ({
	centerX,
	scale,
	offsetY = 0,
	variant,
}) => (
	<AbsoluteFill>
		<div
			style={{
				position: 'absolute',
				left: centerX,
				top: offsetY,
				bottom: -offsetY,
				transform: 'translateX(-50%)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<GlobeEmblem size={250 * scale} />
			<div style={{height: 2 * scale}} />
			<Wordmark fontSize={104 * scale} variant={variant} />
			<div style={{height: 20 * scale}} />
			<CategoryLine fontSize={38 * scale} variant={variant} />
		</div>
	</AbsoluteFill>
);

// YouTube shows only the central 1546x423 area on phones, so the logo,
// name, categories and city network all sit inside it, laid out in a row.
const SAFE = {x: 507, y: 508, w: 1546, h: 423};

const bannerCities = CITIES.filter((c) => c.name !== 'سمرقند').map((c) =>
	c.name === 'قرطبة' ? {...c, label: 'top' as const} : c,
);
const bannerLinks = LINKS.filter(([a, b]) => a !== 'سمرقند' && b !== 'سمرقند');

export const YouTubeBanner: React.FC<{guides?: boolean; variant?: Variant}> = ({guides, variant = 'tv'}) => {
	const W = 2560;
	const H = 1440;
	// "Doc" and "وثائقيات" are wider than "TV" and "أخبار", so that set is a
	// little smaller to keep the same gap before the city network.
	const size = variant === 'doc' ? {emblem: 300, word: 104, cat: 35} : {emblem: 320, word: 114, cat: 38};
	return (
		<AbsoluteFill>
			<Atmosphere width={W} height={H} goldGlow={{x: '70%', y: '50%'}} tealGlow={{x: '40%', y: '50%'}} />
			<WorldMap
				width={W}
				height={H}
				k={7.6}
				lon0={22}
				lat0={31}
				x0={1828}
				y0={720}
				dotRadius={1.9}
				scale={1.2}
				focus={{x: 1800, y: 720, r: 420, strength: 0.45}}
				dim={{x: 1030, y: 720, r: 580, strength: 0.82}}
				cities={bannerCities}
				links={bannerLinks}
			/>
			<Vignette />
			<div
				style={{
					position: 'absolute',
					left: SAFE.x + 14,
					top: SAFE.y,
					height: SAFE.h,
					display: 'flex',
					alignItems: 'center',
					gap: 18,
				}}
			>
				<GlobeEmblem size={size.emblem} />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
					<Wordmark fontSize={size.word} variant={variant} />
					<CategoryLine fontSize={size.cat} variant={variant} />
				</div>
			</div>
			{guides ? (
				<Guides
					boxes={[
						{x: 0, y: SAFE.y, w: W, h: SAFE.h, label: 'Desktop', color: '#f55'},
						{x: 352, y: SAFE.y, w: 1855, h: SAFE.h, label: 'Tablet', color: '#fc3'},
						{...SAFE, label: 'Safe (all devices)', color: '#3cf'},
					]}
				/>
			) : null}
		</AbsoluteFill>
	);
};

export const FacebookCover: React.FC<{guides?: boolean; variant?: Variant}> = ({guides, variant = 'tv'}) => {
	const W = 1640;
	const H = 624;
	const logoX = 610;
	return (
		<AbsoluteFill>
			<Atmosphere width={W} height={H} goldGlow={{x: '68%', y: '48%'}} tealGlow={{x: '34%', y: '50%'}} />
			<WorldMap
				width={W}
				height={H}
				k={9.2}
				lon0={22}
				lat0={32}
				x0={1128}
				y0={300}
				dotRadius={1.8}
				scale={0.8}
				focus={{x: 1110, y: 300, r: 420, strength: 0.42}}
				dim={{x: logoX, y: 300, r: 380, strength: 0.8}}
			/>
			<Vignette />
			<Lockup centerX={logoX} scale={0.68} offsetY={-36} variant={variant} />
			{guides ? (
				<Guides
					boxes={[
						{x: 265, y: 0, w: 1110, h: 624, label: 'Mobile', color: '#3cf'},
						{x: 30, y: 420, w: 340, h: 204, label: 'Profile photo (desktop)', color: '#f55'},
					]}
				/>
			) : null}
		</AbsoluteFill>
	);
};
