// Builds a fine lon/lat land-dot grid for one region, for zoomed-in map
// scenes. src/data/seasia-dots.json was made with:
//   node scripts/make-region-dots.mjs seasia 70 165 -45 30 0.25
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {geoBounds, geoContains} from 'd3-geo';
import {feature} from 'topojson-client';

const require = createRequire(import.meta.url);
const [name = 'seasia', lonMin = 70, lonMax = 165, latMin = -45, latMax = 30, step = 0.25] = process.argv
	.slice(2)
	.map((v, i) => (i === 0 ? v : Number(v)));

const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

// Only test polygons whose bounding box touches the region.
const polys = land.features.flatMap((f) =>
	f.geometry.type === 'MultiPolygon'
		? f.geometry.coordinates.map((c) => ({type: 'Polygon', coordinates: c}))
		: [f.geometry],
).filter((g) => {
	const [[x0, y0], [x1, y1]] = geoBounds(g);
	return x1 >= lonMin && x0 <= lonMax && y1 >= latMin && y0 <= latMax;
});

const dots = [];
for (let lat = latMax; lat >= latMin; lat -= step) {
	for (let lon = lonMin; lon <= lonMax; lon += step) {
		if (polys.some((g) => geoContains(g, [lon, lat]))) {
			dots.push([Math.round(lon * 100) / 100, Math.round(lat * 100) / 100]);
		}
	}
}
writeFileSync(new URL(`../src/data/${name}-dots.json`, import.meta.url), JSON.stringify(dots));
console.log(`${name}: ${dots.length} dots from ${polys.length} polygons`);
