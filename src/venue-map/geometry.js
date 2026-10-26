// Shared frame + geometry helpers for the venue diorama.
// Map data is in metres from Tasco Mall (x = east, z = south); the world is 1 unit = 100 m.
import * as THREE from 'three';
import MAP from './venue-map.json';

export { MAP };
export const SCALE = 0.01;
export const LIFT = 2; // vertical exaggeration for buildings so a 1 km block still reads as a city
// Props (people, vehicles, lamps) are enlarged a little more so they read at this scale
export const PROP = new THREE.Vector3(SCALE * 1.5, SCALE * 1.9, SCALE * 1.5);
export const VENUE_ID = 1092144098;
export const VENUE_HEIGHT = 17; // three retail floors with a car park on the roof
const CX = (MAP.box.x0 + MAP.box.x1) / 2, CZ = (MAP.box.z0 + MAP.box.z1) / 2;
export const HALF = ((MAP.box.x1 - MAP.box.x0) * SCALE) / 2;

export const toWorld = ([x, z]) => [(x - CX) * SCALE, (z - CZ) * SCALE];
export const metres = (m) => m * SCALE * LIFT;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
export const hash = (n) => (Math.imul(Math.round(n), 2654435761) >>> 0) / 4294967296;

export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function signedArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, z0] = poly[i], [x1, z1] = poly[(i + 1) % poly.length];
    a += x0 * z1 - x1 * z0;
  }
  return a / 2;
}

export const centroid = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];

export const VENUE_FOOTPRINT = MAP.buildings.find((b) => b.id === VENUE_ID).p;
// The facade facing the main car park and Nguyễn Văn Linh, with its outward normal (map metres)
export const ENTRANCE = (() => {
  const c = centroid(VENUE_FOOTPRINT);
  let best = null;
  VENUE_FOOTPRINT.forEach((a, i) => {
    const b = VENUE_FOOTPRINT[(i + 1) % VENUE_FOOTPRINT.length];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const score = Math.hypot(mid[0] + 60, mid[1] - 25); // nearest the main car park
    if (!best || score < best.score) best = { a, b, mid, score };
  });
  const len = Math.hypot(best.b[0] - best.a[0], best.b[1] - best.a[1]);
  const along = [(best.b[0] - best.a[0]) / len, (best.b[1] - best.a[1]) / len];
  let n = [-along[1], along[0]];
  if (n[0] * (best.mid[0] - c[0]) + n[1] * (best.mid[1] - c[1]) < 0) n = [-n[0], -n[1]];
  return { at: best.mid, normal: n, along, width: len };
})();
export const entranceAhead = (m, side = 0) => [ENTRANCE.at[0] + ENTRANCE.normal[0] * m + ENTRANCE.along[0] * side, ENTRANCE.at[1] + ENTRANCE.normal[1] * m + ENTRANCE.along[1] * side];
// Pedestrian plaza from the doors straight out towards the road
export const PLAZA = { width: 14, length: 95 };
// Sliding car gate in the road fence, just right of the plaza as seen from the road
export const CAR_GATE = entranceAhead(91, 14);
export function onPlaza([x, z]) {
  const dx = x - ENTRANCE.at[0], dz = z - ENTRANCE.at[1];
  const ahead = dx * ENTRANCE.normal[0] + dz * ENTRANCE.normal[1], side = dx * ENTRANCE.along[0] + dz * ENTRANCE.along[1];
  return ahead > -1 && ahead < PLAZA.length && Math.abs(side) < PLAZA.width / 2;
}

export function insidePolygon([x, z], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// Push a horizontal-ish triangle so its face normal points up, whatever the source winding
export function pushUp(buf, a, b, c) {
  const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
  buf.push(...a, ...(ny >= 0 ? b : c), ...(ny >= 0 ? c : b));
}

export function fillPolygon(buf, poly, y) {
  const tris = THREE.ShapeUtils.triangulateShape(poly.map(([x, z]) => new THREE.Vector2(x, z)), []);
  for (const [i, j, k] of tris) pushUp(buf, [poly[i][0], y, poly[i][1]], [poly[j][0], y, poly[j][1]], [poly[k][0], y, poly[k][1]]);
}

export function meshFrom(positions, material, { uvs, colors, cast = false } = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (uvs) geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (colors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

export const std = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });

const tmp = { o: new THREE.Object3D(), c: new THREE.Color() };
/**
 * Static instanced mesh. Items: { at: [wx, wz], y?, yaw?, s?: number | [x, y, z], c?: color }
 */
export function instanced(geo, mat, items, { cast = true } = {}) {
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(items.length, 1));
  mesh.count = items.length;
  items.forEach((it, i) => {
    tmp.o.position.set(it.at[0], it.y ?? 0, it.at[1]);
    tmp.o.rotation.set(0, it.yaw ?? 0, 0);
    if (Array.isArray(it.s)) tmp.o.scale.set(...it.s); else tmp.o.scale.setScalar(it.s ?? 1);
    tmp.o.updateMatrix();
    mesh.setMatrixAt(i, tmp.o.matrix);
    if (it.c) mesh.setColorAt(i, tmp.c.set(it.c));
  });
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

/** Merge parts (each [geometry, hexColour]) into one geometry with vertex colours. */
export function mergeColoured(parts) {
  const pos = [], nor = [], col = [];
  const c = new THREE.Color();
  for (const [g0, hex] of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    c.set(hex);
    pos.push(...g.attributes.position.array);
    nor.push(...g.attributes.normal.array);
    for (let i = 0; i < g.attributes.position.count; i++) col.push(c.r, c.g, c.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}

/** Axis-aligned box in metres: centre x/z, bottom y, size w (x) × h × d (z). */
export function box(w, h, d, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

// A flyover (b = 1) rises to ~7 m with 80 m ramps at both ends
export const bridgeLift = (d, total) => metres(7) * smooth(0, 0.8, d) * smooth(0, 0.8, total - d);

/** Polyline in world units with optional per-point y, sampled by arc length. */
export function walker(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const length = cum[cum.length - 1];
  const at = (s, out) => {
    const d = clamp(s, 0, length);
    let k = 1;
    while (k < cum.length - 1 && cum[k] < d) k++;
    const a = pts[k - 1], b = pts[k], seg = Math.max(cum[k] - cum[k - 1], 1e-6), t = (d - cum[k - 1]) / seg;
    out.x = a[0] + (b[0] - a[0]) * t;
    out.z = a[1] + (b[1] - a[1]) * t;
    out.y = (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t;
    out.dx = (b[0] - a[0]) / seg;
    out.dz = (b[1] - a[1]) / seg;
    return out;
  };
  return { length, at };
}

export function canvasTexture(w, h, draw, repeat = [1, 1]) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 8;
  return tex;
}

// Uniforms shared by every swaying material (trees)
export const WIND = { uTime: { value: 0 } };
export function addWind(mat, amp, freq) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = WIND.uTime;
    shader.vertexShader = `uniform float uTime;\n${shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec2 ip = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
      float sw = sin(uTime * ${freq.toFixed(2)} + ip.x * 37.0 + ip.y * 23.0) + 0.5 * sin(uTime * ${(freq * 1.9).toFixed(2)} + ip.x * 61.0);
      transformed.x += sw * ${amp.toFixed(3)} * max(position.y + 0.5, 0.0);
      transformed.z += sw * ${(amp * 0.6).toFixed(3)} * max(position.y + 0.5, 0.0);`)}`;
  };
  return mat;
}
