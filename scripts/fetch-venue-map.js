// Bakes the OpenStreetMap neighbourhood around the venue into src/venue-map/venue-map.json.
// Run once (needs network): `npm run venue-map`. The JSON is committed so builds stay offline.
// Output frame: metres from the venue, x = east, z = south, clipped to a 1 km square.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../src/venue-map/venue-map.json');
const ORIGIN = { lat: 21.05083, lon: 105.8934877 }; // TASCO Mall, OSM way 1092144098
const BOX = { x0: -700, x1: 300, z0: -650, z1: 350 };
const M_LAT = 110574;
const M_LON = 111320 * Math.cos((ORIGIN.lat * Math.PI) / 180);
const ROADS = 'motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street|trunk_link|primary_link|secondary_link';

const toXZ = ({ lat, lon }) => [Math.round((lon - ORIGIN.lon) * M_LON), Math.round(-(lat - ORIGIN.lat) * M_LAT)];
const inside = ([x, z]) => x >= BOX.x0 && x <= BOX.x1 && z >= BOX.z0 && z <= BOX.z1;

function bbox() {
  const pad = 60;
  const s = ORIGIN.lat - (BOX.z1 + pad) / M_LAT, n = ORIGIN.lat - (BOX.z0 - pad) / M_LAT;
  const w = ORIGIN.lon + (BOX.x0 - pad) / M_LON, e = ORIGIN.lon + (BOX.x1 + pad) / M_LON;
  return `${s.toFixed(5)},${w.toFixed(5)},${n.toFixed(5)},${e.toFixed(5)}`;
}

// Sutherland–Hodgman against the four box edges
function clipPolygon(points) {
  const edges = [
    [(p) => p[0] >= BOX.x0, (a, b) => cross(a, b, 0, BOX.x0)],
    [(p) => p[0] <= BOX.x1, (a, b) => cross(a, b, 0, BOX.x1)],
    [(p) => p[1] >= BOX.z0, (a, b) => cross(a, b, 1, BOX.z0)],
    [(p) => p[1] <= BOX.z1, (a, b) => cross(a, b, 1, BOX.z1)],
  ];
  return edges.reduce((poly, [isIn, cut]) => poly.flatMap((cur, i) => {
    const prev = poly[(i + poly.length - 1) % poly.length];
    if (isIn(cur)) return isIn(prev) ? [cur] : [cut(prev, cur), cur];
    return isIn(prev) ? [cut(prev, cur)] : [];
  }), points);
}

function cross(a, b, axis, v) {
  const t = (v - a[axis]) / (b[axis] - a[axis]);
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)];
}

// Liang–Barsky per segment; a line leaving and re-entering the box becomes several pieces
function clipLine(points) {
  const pieces = [];
  let cur = null;
  for (let i = 1; i < points.length; i++) {
    const seg = clipSegment(points[i - 1], points[i]);
    if (!seg) { cur = null; continue; }
    if (!cur) { cur = [seg[0]]; pieces.push(cur); }
    cur.push(seg[1]);
    if (seg[1] !== points[i]) cur = null;
  }
  return pieces.filter((p) => p.length > 1);
}

function clipSegment(a, b) {
  const d = [b[0] - a[0], b[1] - a[1]];
  let t0 = 0, t1 = 1;
  const checks = [[-d[0], a[0] - BOX.x0], [d[0], BOX.x1 - a[0]], [-d[1], a[1] - BOX.z0], [d[1], BOX.z1 - a[1]]];
  for (const [p, q] of checks) {
    if (p === 0) { if (q < 0) return null; continue; }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  const at = (t) => [Math.round(a[0] + d[0] * t), Math.round(a[1] + d[1] * t)];
  return [t0 === 0 ? a : at(t0), t1 === 1 ? b : at(t1)];
}

const query = `[out:json][timeout:90];(
  way["building"](${bbox()});
  way["highway"~"^(${ROADS})$"](${bbox()});
  way["natural"="water"](${bbox()});
  way["leisure"~"^(park|garden|pitch)$"](${bbox()});
  way["landuse"~"^(grass|park|recreation_ground)$"](${bbox()});
  way["railway"="rail"](${bbox()});
  way["amenity"~"^(parking|motorcycle_parking)$"](${bbox()});
  node["natural"="tree"](${bbox()});
);out geom tags;`;

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'User-Agent': 'wedding-site-venue-map' },
  body: new URLSearchParams({ data: query }),
});
if (!res.ok) throw new Error(`Overpass ${res.status}: ${await res.text()}`);
const { elements } = await res.json();

const out = { box: BOX, buildings: [], roads: [], water: [], green: [], rail: [], parking: [], trees: [] };
for (const el of elements) {
  const t = el.tags ?? {};
  if (el.type === 'node') {
    const p = toXZ(el);
    if (inside(p)) out.trees.push(p);
    continue;
  }
  const pts = el.geometry.map(toXZ);
  if (t.building) {
    if (!pts.some(inside)) continue;
    const poly = clipPolygon(pts.slice(0, -1));
    if (poly.length < 3) continue;
    const levels = Number.parseInt(t['building:levels'], 10);
    out.buildings.push({ id: el.id, l: Number.isFinite(levels) ? levels : 0, p: poly });
  } else if (t.highway) {
    const layer = Number.parseInt(t.layer, 10) || 0;
    const aisle = t.service === 'parking_aisle' ? { a: 1 } : {};
    for (const p of clipLine(pts)) out.roads.push({ k: t.highway, b: layer > 0 ? 1 : 0, ...aisle, p });
  } else if (t.amenity) {
    const poly = clipPolygon(pts.slice(0, -1));
    if (poly.length >= 3) out.parking.push({ k: t.amenity === 'motorcycle_parking' ? 'moto' : 'car', p: poly });
  } else if (t.railway) {
    out.rail.push(...clipLine(pts));
  } else {
    const poly = clipPolygon(pts.slice(0, -1));
    if (poly.length >= 3) (t.natural === 'water' ? out.water : out.green).push(poly);
  }
}

await writeFile(OUT, JSON.stringify(out));
console.log(`venue-map: ${out.buildings.length} buildings, ${out.roads.length} roads → ${path.relative(process.cwd(), OUT)}`);
