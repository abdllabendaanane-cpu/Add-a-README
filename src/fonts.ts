import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {fonts} from './theme';

// loadFont holds the render until each font file has loaded.
export const fontsReady = Promise.all([
	loadFont({
		family: fonts.latin,
		url: staticFile('fonts/montserrat-latin-800-normal.woff2'),
		weight: '800',
	}),
	loadFont({
		family: fonts.kufi,
		url: staticFile('fonts/reem-kufi-arabic-700-normal.woff2'),
		weight: '700',
	}),
	loadFont({
		family: fonts.arabic,
		url: staticFile('fonts/cairo-arabic-600-normal.woff2'),
		weight: '600',
	}),
	loadFont({
		family: fonts.arabic,
		url: staticFile('fonts/cairo-arabic-700-normal.woff2'),
		weight: '700',
	}),
]);
