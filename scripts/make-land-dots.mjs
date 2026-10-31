// Builds src/data/land-dots.json: a regular lon/lat grid of points that fall
// on land, used to draw the dotted globe and world map.
// Run with: node scripts/make-land-dots.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {geoContains} from 'd3-geo';
import {feature} from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const STEP = 1.25;
const dots = [];
for (let lat = 84; lat >= -58; lat -= STEP) {
	for (let lon = -180 + STEP / 2; lon < 180; lon += STEP) {
		if (geoContains(land, [lon, lat])) {
			dots.push([Math.round(lon * 100) / 100, Math.round(lat * 100) / 100]);
		}
	}
}

writeFileSync(new URL('../src/data/land-dots.json', import.meta.url), JSON.stringify(dots));
console.log(`${dots.length} land dots`);
