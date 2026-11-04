// Turns a reel script (seconds) into frame ranges.

export type Caption = {text: string; sec: number; pill?: string};
export type SceneScript = {
	bg: string;
	headline: string;
	headlineTone?: 'white' | 'gold';
	topPill?: string;
	captions: Caption[];
};
export type ReelScript = {
	series: string;
	coverSec: number;
	endCardSec: number;
	scenes: SceneScript[];
};

export type TimedCaption = Caption & {from: number; duration: number};
export type TimedScene = SceneScript & {from: number; duration: number; captions: TimedCaption[]};

export const buildTimeline = (script: ReelScript, fps: number) => {
	const f = (sec: number) => Math.round(sec * fps);
	let cursor = f(script.coverSec);
	const scenes: TimedScene[] = script.scenes.map((scene) => {
		const from = cursor;
		let local = 0;
		const captions = scene.captions.map((c) => {
			const tc = {...c, from: local, duration: f(c.sec)};
			local += tc.duration;
			return tc;
		});
		cursor += local;
		return {...scene, from, duration: local, captions};
	});
	const endCard = {from: cursor, duration: f(script.endCardSec)};
	return {cover: {from: 0, duration: f(script.coverSec)}, scenes, endCard, total: cursor + endCard.duration};
};
