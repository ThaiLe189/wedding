// Everything that grows or moves: street trees swaying in the wind, lamps, the car parks,
// motorbike-heavy traffic on the main roads, people on the pavements and a train on the railway.
import * as THREE from 'three';
import {
  MAP, SCALE, PROP, toWorld, metres, smooth, hash, rng, centroid, insidePolygon, std, instanced,
  mergeColoured, box, walker, addWind, pushUp, fillPolygon, meshFrom, onPlaza,
} from './geometry.js';
import { ROAD_LINES, ROAD_WIDTH, MAJOR, samplesAlong } from './city.js';

const PAVED = new Set([...MAJOR, 'tertiary']);
const SHIRTS = ['#f2efe6', '#3d5a80', '#c8321f', '#f2c14e', '#6b8f71', '#ffffff', '#e07a5f', '#4a4e69', '#2b2d42'];
const HELMETS = ['#f2c14e', '#c8321f', '#ffffff', '#3d6fb5', '#2a2a2a', '#e88fb0'];
const PAINT = { bike: ['#c8321f', '#2f4858', '#e8e4da', '#1d1d1d', '#3d6fb5', '#8b8b8b', '#e2b33a'], car: ['#f4f2ee', '#2d3238', '#9aa3a8', '#7d2f2a', '#3d5a74', '#c9c3b6', '#f4f2ee'], bus: ['#f0b323', '#2f8a4a'] };

// ---- Models (built in metres, scaled into the world by PROP) ---------------------------------

const scaled = (geo) => geo.scale(PROP.x, PROP.y, PROP.z);
const wheel = (z, r = 0.3, w = 0.12, x = 0) => { const g = new THREE.CylinderGeometry(r, r, w, 10); g.rotateZ(Math.PI / 2); g.translate(x, r, z); return g; };
export const MODELS = {
  bike: () => scaled(mergeColoured([[box(0.32, 0.4, 1.4, 0, 0.3), '#ffffff'], [box(0.3, 0.12, 0.7, 0, 0.7, -0.15), '#2a2a2a'], [box(0.6, 0.05, 0.05, 0, 0.95, 0.6), '#555'], [wheel(-0.6), '#1a1a1a'], [wheel(0.62), '#1a1a1a']])),
  riderShirt: () => scaled(mergeColoured([[box(0.42, 0.55, 0.28, 0, 0.8, -0.15), '#ffffff']])),
  riderFixed: () => scaled(mergeColoured([[box(0.36, 0.2, 0.7, 0, 0.62, 0.05), '#2b2b33'], [box(0.24, 0.24, 0.24, 0, 1.36, -0.12), '#d7a77f']])),
  helmet: () => scaled(mergeColoured([[new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, 1.7).translate(0, 1.5, -0.12), '#ffffff']])),
  car: () => scaled(mergeColoured([[box(1.8, 0.75, 4.4, 0, 0.3), '#ffffff'], [box(1.6, 0.55, 2.3, 0, 1.05, -0.2), '#5b6c78'], [wheel(-1.4, 0.32, 1.85), '#1a1a1a'], [wheel(1.4, 0.32, 1.85), '#1a1a1a']])),
  bus: () => scaled(mergeColoured([[box(2.5, 2.9, 11, 0, 0.3), '#ffffff'], [box(2.54, 0.9, 10.2, 0, 1.75, 0.2), '#26313a'], [box(2.54, 0.35, 11.02, 0, 0.75), '#c8321f'], [wheel(-3.6, 0.45, 2.4), '#1a1a1a'], [wheel(3.4, 0.45, 2.4), '#1a1a1a']])),
  personBody: () => scaled(mergeColoured([[box(0.42, 0.62, 0.26, 0, 0.82), '#ffffff']])),
  personFixed: () => scaled(mergeColoured([[box(0.34, 0.82, 0.22, 0, 0), '#2b2b33'], [box(0.24, 0.25, 0.24, 0, 1.44), '#d7a77f'], [box(0.27, 0.12, 0.27, 0, 1.64), '#1d1714']])),
};

/** Several instanced meshes moved together (e.g. bike + rider + helmet). */
export function fleet(parts, count) {
  const meshes = parts.map(([geo, mat]) => {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(count, 1));
    m.count = count;
    m.castShadow = true;
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return m;
  });
  const o = new THREE.Object3D(), c = new THREE.Color();
  return {
    meshes,
    paint(i, part, hex) { meshes[part].setColorAt(i, c.set(hex)); },
    place(i, x, y, z, yaw, s = 1) {
      o.position.set(x, y, z);
      o.rotation.set(0, yaw, 0);
      o.scale.setScalar(Math.max(s, 1e-4));
      o.updateMatrix();
      for (const m of meshes) m.setMatrixAt(i, o.matrix);
    },
    commit() { for (const m of meshes) m.instanceMatrix.needsUpdate = true; },
  };
}

export const crowdParts = () => [[MODELS.personBody(), std('#ffffff')], [MODELS.personFixed(), std('#ffffff', { vertexColors: true })]];

// ---- Occupancy grid (1.5 m cells) so trees avoid buildings, car parks and every road surface ------

const CELL = 1.5;
const GRID = (() => {
  const { x0, z0, x1, z1 } = MAP.box, w = Math.ceil((x1 - x0) / CELL), h = Math.ceil((z1 - z0) / CELL);
  const cells = new Uint8Array(w * h);
  const mark = (poly) => {
    const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
    for (let z = Math.min(...zs); z <= Math.max(...zs) + CELL; z += CELL) {
      for (let x = Math.min(...xs); x <= Math.max(...xs) + CELL; x += CELL) {
        const i = Math.floor((x - x0) / CELL), j = Math.floor((z - z0) / CELL);
        if (i >= 0 && j >= 0 && i < w && j < h && insidePolygon([x, z], poly)) cells[j * w + i] = 1;
      }
    }
  };
  // A road is stamped as discs every metre along its centreline, radius = half its width + a kerb
  const markRoad = (line, radius) => {
    const reach = Math.ceil(radius / CELL);
    for (let k = 1; k < line.length; k++) {
      const [ax, az] = line[k - 1], [bx, bz] = line[k];
      const len = Math.hypot(bx - ax, bz - az);
      for (let d = 0; d <= len; d += 1) {
        const x = ax + ((bx - ax) * d) / (len || 1), z = az + ((bz - az) * d) / (len || 1);
        const ci = Math.floor((x - x0) / CELL), cj = Math.floor((z - z0) / CELL);
        for (let j = cj - reach; j <= cj + reach; j++) for (let i = ci - reach; i <= ci + reach; i++) {
          if (i < 0 || j < 0 || i >= w || j >= h) continue;
          if (Math.hypot(x0 + (i + 0.5) * CELL - x, z0 + (j + 0.5) * CELL - z) <= radius) cells[j * w + i] = 1;
        }
      }
    }
  };
  MAP.buildings.forEach((b) => mark(b.p));
  MAP.parking.forEach((l) => mark(l.p));
  MAP.roads.forEach((r) => markRoad(r.p, (ROAD_WIDTH[r.k] ?? 4) / 2 + 1.2));
  MAP.rail.forEach((line) => markRoad(line, 4));
  return { taken: ([x, z]) => cells[Math.floor((z - z0) / CELL) * w + Math.floor((x - x0) / CELL)] === 1 };
})();

const toMap = (wx, wz) => [wx / SCALE + (MAP.box.x0 + MAP.box.x1) / 2, wz / SCALE + (MAP.box.z0 + MAP.box.z1) / 2];
const inBox = ([x, z]) => x > MAP.box.x0 + 4 && x < MAP.box.x1 - 4 && z > MAP.box.z0 + 4 && z < MAP.box.z1 - 4;

// ---- Trees -----------------------------------------------------------------------------------

// Shade trees planted between back-to-back rows of bays, every fourth bay (as in the real car park)
function lotTreeSpots() {
  const carLots = MAP.parking.filter((l) => l.k === 'car').map((l) => l.p);
  const out = [];
  for (const road of MAP.roads.filter((rd) => rd.a)) {
    for (let i = 1; i < road.p.length; i++) {
      const [ax, az] = road.p[i - 1], [bx, bz] = road.p[i];
      const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
      for (let d = 2.6 * 2; d < len; d += 2.6 * 4) {
        const p = [ax + ux * d - uz * 8.6, az + uz * d + ux * 8.6];
        if (carLots.some((lot) => insidePolygon(p, lot)) && !onPlaza(p)) out.push(p);
      }
    }
  }
  return out;
}

export function buildTrees() {
  const r = rng(2026);
  const spots = [...MAP.trees];
  const lotRows = lotTreeSpots();
  for (const road of ROAD_LINES) {
    if (!PAVED.has(road.kind) || road.bridge) continue;
    for (const p of samplesAlong(road.pts, 14)) {
      for (const side of [-1, 1]) {
        const off = ((road.width / 2 + 2.8) * SCALE) * side;
        spots.push(toMap(p.x - p.dz * off + (r() - 0.5) * 0.01, p.z + p.dx * off + (r() - 0.5) * 0.01));
      }
    }
  }
  for (const poly of MAP.green) {
    const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
    for (let x = Math.min(...xs); x < Math.max(...xs); x += 9) for (let z = Math.min(...zs); z < Math.max(...zs); z += 9) {
      const p = [x + (r() - 0.5) * 6, z + (r() - 0.5) * 6];
      if (insidePolygon(p, poly) && r() < 0.7) spots.push(p);
    }
  }

  const GREENS = ['#3f6a2b', '#4a7a2e', '#577f30', '#62903a', '#6f9a3a', '#7ea444'];
  const blobs = [], trunks = [];
  for (const p of [...spots, ...lotRows]) {
    if (!inBox(p) || (GRID.taken(p) && !lotRows.includes(p))) continue;
    const at = toWorld(p), k = r();
    const palette = k < 0.03 ? ['#8a63b5', '#a07ccc', '#4a7a2e'] : k < 0.06 ? ['#e3381c', '#ef4f22', '#577f30'] : GREENS;
    const size = (2 + r() * 1.3) * SCALE, trunkH = (2.4 + r() * 1.6) * SCALE * 1.7;
    trunks.push({ at, s: [1, trunkH, 1] });
    const n = 4 + Math.floor(r() * 3);
    for (let b = 0; b < n; b++) {
      const rr = size * (0.55 + r() * 0.35);
      blobs.push({ at: [at[0] + (r() - 0.5) * size, at[1] + (r() - 0.5) * size], y: trunkH + size * 0.5 + (r() - 0.4) * size * 0.6, yaw: r() * 6, s: [rr, rr * 1.05, rr], c: palette[Math.floor(r() * palette.length)] });
    }
  }
  const trunk = new THREE.CylinderGeometry(0.0022, 0.0034, 1, 5).translate(0, 0.5, 0);
  const group = new THREE.Group();
  group.add(
    instanced(new THREE.IcosahedronGeometry(1, 1), addWind(std('#ffffff', { roughness: 0.9, flatShading: true }), 0.06, 1.3), blobs),
    instanced(trunk, std('#5a4532'), trunks),
  );
  return group;
}

// ---- Street lamps -----------------------------------------------------------------------------

export function buildLamps() {
  const posts = [], heads = [];
  for (const road of ROAD_LINES) {
    if (!MAJOR.has(road.kind) || road.bridge) continue;
    for (const p of samplesAlong(road.pts, 32)) {
      const off = (road.width / 2 + 0.8) * SCALE;
      const at = [p.x - p.dz * off, p.z + p.dx * off];
      if (!inBox(toMap(...at))) continue;
      const yaw = Math.atan2(-p.dz, p.dx);
      posts.push({ at, yaw });
      heads.push({ at, yaw });
    }
  }
  const post = scaled(mergeColoured([[new THREE.CylinderGeometry(0.09, 0.14, 8, 6).translate(0, 4, 0), '#3d4a45'], [box(1.6, 0.08, 0.08, 0.8, 7.9), '#3d4a45']]));
  const head = scaled(mergeColoured([[box(0.7, 0.18, 0.32, 1.5, 7.75), '#f6efd8']]));
  const group = new THREE.Group();
  group.add(instanced(post, std('#ffffff', { vertexColors: true, metalness: 0.4, roughness: 0.5 }), posts), instanced(head, std('#ffffff', { vertexColors: true, emissive: '#ffcf7a', emissiveIntensity: 0.35 }), heads, { cast: false }));
  return group;
}

// ---- Car parks (OSM amenity=parking / motorcycle_parking) -----------------------------------

export function buildParking() {
  const group = new THREE.Group();
  const carLots = MAP.parking.filter((l) => l.k === 'car').map((l) => l.p);
  const surfaces = { car: [], moto: [] };
  MAP.parking.forEach((l) => fillPolygon(surfaces[l.k], l.p.map(toWorld), 0.0035));

  const lines = [], cars = [];
  const BAY = 2.6, AISLE = 3.2, DEPTH = 5;
  let n = 0;
  for (const road of MAP.roads.filter((rd) => rd.a)) {
    for (let i = 1; i < road.p.length; i++) {
      const [ax, az] = road.p[i - 1], [bx, bz] = road.p[i];
      const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
      for (let d = BAY / 2; d < len; d += BAY) {
        for (const side of [1, -1]) {
          const nx = -uz * side, nz = ux * side;
          const cx = ax + ux * d + nx * (AISLE + DEPTH / 2), cz = az + uz * d + nz * (AISLE + DEPTH / 2);
          if (!carLots.some((lot) => insidePolygon([cx, cz], lot)) || onPlaza([cx, cz])) continue;
          const ex = ax + ux * (d - BAY / 2) + nx * AISLE, ez = az + uz * (d - BAY / 2) + nz * AISLE, w = 0.15;
          const quad = [[ex - ux * w, ez - uz * w], [ex + ux * w, ez + uz * w], [ex + ux * w + nx * DEPTH, ez + uz * w + nz * DEPTH], [ex - ux * w + nx * DEPTH, ez - uz * w + nz * DEPTH]]
            .map((q) => { const [x, z] = toWorld(q); return [x, 0.0045, z]; });
          pushUp(lines, quad[0], quad[1], quad[2]);
          pushUp(lines, quad[0], quad[2], quad[3]);
          n += 1;
          if (hash(n * 31 + 7) < 0.62) cars.push({ at: toWorld([cx, cz]), y: 0.004, yaw: Math.atan2(nx, nz), c: PAINT.car[Math.floor(hash(n) * PAINT.car.length)] });
        }
      }
    }
  }

  const bikes = [];
  for (const lot of MAP.parking.filter((l) => l.k === 'moto')) {
    const xs = lot.p.map((p) => p[0]), zs = lot.p.map((p) => p[1]);
    for (let x = Math.min(...xs) + 1; x < Math.max(...xs); x += 0.9) {
      for (let z = Math.min(...zs) + 1.5; z < Math.max(...zs); z += 2.6) {
        const k = Math.round(x * 13 + z * 7);
        if (!insidePolygon([x, z], lot.p) || hash(k) > 0.75) continue;
        bikes.push({ at: toWorld([x, z]), y: 0.004, yaw: (hash(k + 1) - 0.5) * 0.3, c: PAINT.bike[Math.floor(hash(k + 2) * PAINT.bike.length)] });
      }
    }
  }

  const flat = (color) => std(color, { roughness: 1 });
  group.add(meshFrom(surfaces.car, flat('#b9b6ae')), meshFrom(surfaces.moto, flat('#d3bf98')), meshFrom(lines, flat('#fbf8f1')));
  const painted = () => std('#ffffff', { vertexColors: true, roughness: 0.45 });
  if (cars.length) group.add(instanced(MODELS.car(), painted(), cars));
  if (bikes.length) group.add(instanced(MODELS.bike(), painted(), bikes));
  // Parking-lot sign posts: blue "P" board on a pole at each lot
  const signTex = new THREE.CanvasTexture(Object.assign(document.createElement('canvas'), { width: 64, height: 64 }));
  const g = signTex.image.getContext('2d');
  g.fillStyle = '#2f5f9e';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#fff';
  g.font = 'bold 48px sans-serif';
  g.textAlign = 'center';
  g.fillText('P', 32, 50);
  signTex.colorSpace = THREE.SRGBColorSpace;
  for (const lot of MAP.parking) {
    const [x, z] = toWorld(lot.p.reduce((best, p) => (p[0] < best[0] ? p : best)));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.0008, 0.0008, metres(3.2), 5), std('#555'));
    pole.position.set(x, metres(1.6), z);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.018), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    board.position.set(x, metres(3.2) + 0.009, z);
    board.rotation.y = -Math.PI / 4;
    group.add(pole, board);
  }
  return group;
}

// ---- Traffic ----------------------------------------------------------------------------------

// Join OSM ways end-to-start so vehicles drive the whole of Nguyễn Văn Linh rather than one segment
function chainRoads(lines) {
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const byStart = new Map();
  lines.forEach((l) => byStart.set(key(l.pts[0]), [...(byStart.get(key(l.pts[0])) ?? []), l]));
  const ends = new Set(lines.map((l) => key(l.pts[l.pts.length - 1])));
  const used = new Set(), out = [];
  const ordered = [...lines.filter((l) => !ends.has(key(l.pts[0]))), ...lines];
  for (const first of ordered) {
    if (used.has(first)) continue;
    used.add(first);
    const pts = [...first.pts];
    for (;;) {
      const next = byStart.get(key(pts[pts.length - 1]))?.find((l) => !used.has(l));
      if (!next) break;
      used.add(next);
      pts.push(...next.pts.slice(1));
    }
    out.push({ pts, width: first.width, twoWay: first.kind === 'tertiary', kind: first.kind });
  }
  return out;
}

export function buildTraffic(reducedMotion) {
  const r = rng(7);
  const chains = chainRoads(ROAD_LINES.filter((l) => PAVED.has(l.kind) && !l.aisle));
  const vehicles = [];
  for (const ch of chains) {
    const path = walker(ch.pts);
    const metresLong = path.length / SCALE;
    const n = Math.round(metresLong / (MAJOR.has(ch.kind) ? 22 : 45));
    for (let i = 0; i < n; i++) {
      const k = r(), dir = ch.twoWay && i % 2 ? -1 : 1;
      const type = k < 0.68 ? 'bike' : k < 0.95 ? 'car' : 'bus';
      // lateral offset to the right of the direction of travel (Việt Nam drives on the right)
      const lane = ch.twoWay ? ch.width / 4 : (r() - 0.5) * (ch.width - 3);
      const speed = (type === 'bike' ? 8 + r() * 4 : type === 'car' ? 10 + r() * 4 : 8) * SCALE;
      vehicles.push({ type, path, dir, lane: lane * SCALE, speed, s: r() * path.length, c: r() });
    }
  }
  const byType = (t) => vehicles.filter((v) => v.type === t);
  const painted = () => std('#ffffff', { vertexColors: true, roughness: 0.45 });
  const plain = () => std('#ffffff', { roughness: 0.6 });
  const groups = {
    bike: { list: byType('bike'), f: null, parts: [[MODELS.bike(), painted()], [MODELS.riderShirt(), plain()], [MODELS.riderFixed(), std('#ffffff', { vertexColors: true })], [MODELS.helmet(), plain()]] },
    car: { list: byType('car'), f: null, parts: [[MODELS.car(), painted()]] },
    bus: { list: byType('bus'), f: null, parts: [[MODELS.bus(), painted()]] },
  };
  const group = new THREE.Group();
  for (const [type, g] of Object.entries(groups)) {
    g.f = fleet(g.parts, g.list.length);
    g.list.forEach((v, i) => {
      g.f.paint(i, 0, PAINT[type][Math.floor(v.c * PAINT[type].length)]);
      if (type === 'bike') { g.f.paint(i, 1, SHIRTS[Math.floor(v.c * 97) % SHIRTS.length]); g.f.paint(i, 3, HELMETS[Math.floor(v.c * 53) % HELMETS.length]); }
    });
    group.add(...g.f.meshes);
  }

  const p = {};
  const update = (dt) => {
    for (const g of Object.values(groups)) {
      g.list.forEach((v, i) => {
        if (!reducedMotion) v.s = (v.s + v.speed * dt) % v.path.length;
        const s = v.dir === 1 ? v.s : v.path.length - v.s;
        v.path.at(s, p);
        const dx = p.dx * v.dir, dz = p.dz * v.dir;
        const fade = smooth(0, 0.08, s) * smooth(0, 0.08, v.path.length - s);
        g.f.place(i, p.x - dz * v.lane, p.y + 0.0005, p.z + dx * v.lane, Math.atan2(dx, dz), fade);
      });
      g.f.commit();
    }
  };
  update(0);
  return { group, update };
}

// ---- Pedestrians on the pavements near the venue ---------------------------------------------

export function buildPedestrians(reducedMotion) {
  const r = rng(99);
  const lines = ROAD_LINES.filter((l) => PAVED.has(l.kind) && !l.bridge && l.pts.some(([x, z]) => Math.hypot(...toMap(x, z)) < 320));
  const people = [];
  for (let i = 0; i < 70 && lines.length; i++) {
    const line = lines[Math.floor(r() * lines.length)];
    const path = walker(line.pts.map(([x, z]) => [x, z, 0.003]));
    people.push({ path, side: (r() < 0.5 ? -1 : 1) * (line.width / 2 + 1.5 + r() * 2) * SCALE, dir: r() < 0.5 ? 1 : -1, s: r() * path.length, speed: (1 + r() * 0.5) * SCALE * 1.4, ph: r() * 6, shirt: SHIRTS[i % SHIRTS.length] });
  }
  const f = fleet(crowdParts(), people.length);
  people.forEach((pp, i) => f.paint(i, 0, pp.shirt));
  const p = {};
  const update = (dt, t) => {
    people.forEach((pp, i) => {
      if (!reducedMotion) pp.s = (pp.s + pp.speed * dt) % pp.path.length;
      const s = pp.dir === 1 ? pp.s : pp.path.length - pp.s;
      pp.path.at(s, p);
      const fade = smooth(0, 0.03, s) * smooth(0, 0.03, pp.path.length - s);
      const bob = reducedMotion ? 0 : Math.abs(Math.sin(t * 7 + pp.ph)) * 0.0008;
      f.place(i, p.x - p.dz * pp.side, p.y + bob, p.z + p.dx * pp.side, Math.atan2(p.dx * pp.dir, p.dz * pp.dir), fade);
    });
    f.commit();
  };
  update(0, 0);
  const group = new THREE.Group();
  group.add(...f.meshes);
  return { group, update };
}

// ---- A train shuttling along the Hà Nội – Hải Phòng line -------------------------------------

export function buildTrain(reducedMotion) {
  const longest = MAP.rail.reduce((a, b) => (b.length > a.length ? b : a), []);
  const path = walker(longest.map((p) => [...toWorld(p), 0.0065]));
  const CARS = 7, CAR_M = 19, GAP_M = 1.2;
  const car = scaled(mergeColoured([[box(3, 2.4, CAR_M, 0, 0.6), '#e9eef2'], [box(3.02, 0.7, CAR_M - 1, 0, 1.6), '#2b3640'], [box(3.04, 0.35, CAR_M + 0.02, 0, 1.0), '#2e5d9a'], [box(2.6, 0.4, CAR_M - 0.4, 0, 3.0), '#9aa3a8']]));
  const f = fleet([[car, std('#ffffff', { vertexColors: true, roughness: 0.5 })]], CARS);
  const spacing = (CAR_M + GAP_M) * PROP.z;
  const span = path.length + CARS * spacing;
  let head = span * 0.35;
  const p = {};
  const update = (dt) => {
    if (!reducedMotion) head = (head + 14 * SCALE * dt) % span; // runs off one edge, re-enters at the other
    for (let i = 0; i < CARS; i++) {
      const d = head - i * spacing;
      const inside = d > 0 && d < path.length;
      path.at(d, p);
      f.place(i, p.x, p.y, p.z, Math.atan2(p.dx, p.dz), inside ? 1 : 0);
    }
    f.commit();
  };
  update(0);
  const group = new THREE.Group();
  group.add(...f.meshes);
  return { group, update };
}
