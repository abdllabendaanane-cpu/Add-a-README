import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Wordmark} from '../../Brand';
import {GlobeEmblem} from '../../GlobeEmblem';
import {colors, fonts, goldGradient} from '../../theme';
import {Atmosphere} from '../../WorldMap';
import {ReelScript, TimedScene, buildTimeline} from '../timeline';
import {CaptionBox, Headline, Pill, RED, TopBar} from '../ui';
import {City, CounterBg, DarkBg, EndBg, EruptionBg, GlobeBg, MapSoundBg, MapZoomBg, MountainBg, SnowBg} from './scenes';
import scriptJson from './script.json';

export const FPS = 30;
const script = scriptJson as ReelScript;
export const TIMELINE = buildTimeline(script, FPS);

const sec = (frames: number) => frames / FPS;

// Where the red tag sits in each scene, so it does not cover the key visual.
const RED_PILL_TOP: Record<string, number> = {globe: 1290, snow: 1150};

const Background: React.FC<{scene: TimedScene}> = ({scene}) => {
	switch (scene.bg) {
		case 'mapZoom':
			return <MapZoomBg durationSec={sec(scene.duration)} />;
		case 'eruption':
			return <EruptionBg />;
		case 'mapSound':
			return <MapSoundBg />;
		case 'mountain':
			return <MountainBg />;
		case 'counter':
			return <CounterBg />;
		case 'dark':
			return <DarkBg />;
		case 'globe':
			return <GlobeBg thermoAt={sec(scene.captions[2]?.from ?? 0)} />;
		case 'snow':
			return <SnowBg witherAt={sec(scene.captions[2]?.from ?? 0)} />;
		case 'end':
			return <EndBg />;
		default:
			return null;
	}
};

// First frames: title card in the style of the solar-storm reel.
export const TamboraCover: React.FC = () => (
	<AbsoluteFill style={{background: colors.night}}>
		<div style={{position: 'absolute', inset: 0, height: 1080, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: -560, width: 1080, height: 1920}}>
				<EruptionBg time={2.4} flash={false} shake={false} />
			</div>
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,7,13,0) 55%, ${colors.night} 100%)`}} />
		</div>
		<AbsoluteFill
			style={{background: 'radial-gradient(ellipse 90% 22% at 50% 92%, rgba(255,90,30,0.32) 0%, rgba(120,30,20,0.18) 45%, rgba(0,0,0,0) 75%)'}}
		/>
		<City top={1560} t={0} />
		<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,7,13,0) 75%, rgba(7,7,13,0.6) 100%)`}} />
		<div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div
				dir="rtl"
				style={{
					fontFamily: fonts.arabic,
					fontWeight: 800,
					fontSize: 44,
					padding: '4px 30px',
					borderRadius: 40,
					backgroundImage: goldGradient,
					color: colors.navy,
				}}
			>
				الجزء 1
			</div>
			<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 900, fontSize: 104, color: '#fff', marginTop: 22, lineHeight: 1.2}}>
				بركان تامبورا
			</div>
			<div
				dir="rtl"
				style={{
					fontFamily: fonts.arabic,
					fontWeight: 900,
					fontSize: 150,
					lineHeight: 1.15,
					color: RED,
					textShadow: '0 8px 40px rgba(229,57,47,0.45)',
				}}
			>
				سنة بلا صيف!
			</div>
			<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: 84, color: colors.goldLight, marginTop: 10}}>
				ماذا لو... الليلة؟
			</div>
		</div>
		<div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.latin, fontWeight: 800, fontSize: 36, color: colors.cream}}>
			Al<span style={{color: colors.gold}}>.</span>Asr<span style={{color: colors.gold}}>_</span>Doc
		</div>
	</AbsoluteFill>
);

const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
	const rise = interpolate(frame, [0, 14], [40, 0], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<Atmosphere width={1080} height={1920} goldGlow={{x: '50%', y: '38%'}} tealGlow={{x: '50%', y: '60%'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `translateY(${rise}px)`}}>
				<GlobeEmblem size={460} />
				<Wordmark fontSize={96} variant="asrdoc" />
				<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 900, fontSize: 76, color: colors.goldLight, marginTop: 60}}>
					الجزء 2 قريباً
				</div>
				<div dir="rtl" style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 46, color: colors.cream, marginTop: 14, opacity: 0.9}}>
					تابع القناة حتى لا يفوتك
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const TamboraReel: React.FC<{audio?: boolean}> = ({audio = true}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<Sequence from={TIMELINE.cover.from} durationInFrames={TIMELINE.cover.duration}>
			<TamboraCover />
		</Sequence>
		{TIMELINE.scenes.map((scene, i) => (
			<Sequence key={i} from={scene.from} durationInFrames={scene.duration}>
				<Background scene={scene} />
				<TopBar series={script.series} />
				<Headline text={scene.headline} tone={scene.headlineTone} />
				{scene.topPill ? <Pill text={scene.topPill} tone="gold" top={355} delay={4} /> : null}
				{scene.captions.map((c, j) => (
					<Sequence key={j} from={c.from} durationInFrames={c.duration}>
						<CaptionBox text={c.text} />
					</Sequence>
				))}
				{scene.captions.map((c, j) =>
					c.pill ? (
						<Sequence key={`p${j}`} from={c.from}>
							<Pill text={c.pill} tone="red" top={RED_PILL_TOP[scene.bg] ?? 1210} />
						</Sequence>
					) : null,
				)}
			</Sequence>
		))}
		<Sequence from={TIMELINE.endCard.from} durationInFrames={TIMELINE.endCard.duration}>
			<EndCard />
		</Sequence>
		{audio ? <Audio src={staticFile('audio/tambora-part1-sfx.wav')} /> : null}
	</AbsoluteFill>
);
