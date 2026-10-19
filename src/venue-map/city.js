// The static city: plywood slab, roads with pavements and lane marks, flyover piers,
// the Hà Nội – Hải Phòng railway, and every OSM building extruded with a styled facade.
import * as THREE from 'three';
import {
  MAP, SCALE, HALF, VENUE_ID, toWorld, metres, hash, rng, signedArea, centroid, pushUp, fillPolygon,
  meshFrom, std, instanced, box, bridgeLift, canvasTexture,
} from './geometry.js';

export const ROAD_WIDTH = { trunk: 18, primary: 14, secondary: 11, trunk_link: 8, primary_link: 8, secondary_link: 8, tertiary: 8, unclassified: 6, residential: 5, living_street: 4, service: 3.5 };
export const MAJOR = new Set(['trunk', 'primary', 'secondary', 'trunk_link', 'primary_link', 'secondary_link']);
const PAVED = new Set([...MAJOR, 'tertiary']);
const Y = { pavement: 0.003, minor: 0.004, major: 0.007, mark: 0.0076 };
const C = {
  ground: '#ebe1cd', soil: '#b9906b', plywood: '#d9b98c', green: '#bfcf98', water: '#93b7bd', pavement: '#dcd4c5',
  minor: '#c9c3b6', major: '#9fa09c', mark: '#f7f3ea', ballast: '#a39787', rail: '#5d544c', sleeper: '#6f5a46', pier: '#d6d1c7',
};

// Road centrelines in world units with per-point height (flyovers lifted), shared with traffic, lamps and trees
export const ROAD_LINES = MAP.roads.map((r) => {
  const pts = r.p.map(toWorld);
  let d = 0;
  const dist = pts.map((p, i) => (d += i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0));
  const total = dist[dist.length - 1];
  const base = MAJOR.has(r.k) ? Y.major : Y.minor;
  return { kind: r.k, aisle: !!r.a, bridge: r.b === 1, width: ROAD_WIDTH[r.k] ?? 4, pts: pts.map(([x, z], i) => [x, z, base + (r.b === 1 ? bridgeLift(dist[i], total) : 0)]) };
});

// Flat strip along a 3D polyline, offset sideways by `off` metres
function ribbon(buf, pts, widthM, { off = 0, dy = 0 } = {}) {
  const half = (widthM * SCALE) / 2, o = off * SCALE;
  const edges = pts.map(([x, z, y], i) => {
    const [px, pz] = pts[Math.max(0, i - 1)], [nx, nz] = pts[Math.min(pts.length - 1, i + 1)];
    const dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz) || 1;
    const sx = -dz / l, sz = dx / l;
    return [[x + sx * (o - half), y + dy, z + sz * (o - half)], [x + sx * (o + half), y + dy, z + sz * (o + half)]];
  });
  for (let i = 1; i < edges.length; i++) {
    const [a, b] = edges[i - 1], [c, d] = edges[i];
    pushUp(buf, a, b, c);
    pushUp(buf, b, d, c);
  }
}

// Points every `step` metres along a 3D polyline, with direction
export function samplesAlong(pts, step, start = step / 2) {
  const out = [];
  let acc = start * SCALE;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az, ay] = pts[i - 1], [bx, bz, by] = pts[i];
    const len = Math.hypot(bx - ax, bz - az);
    while (acc < len) {
      const t = acc / len;
      out.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, y: ay + (by - ay) * t, dx: (bx - ax) / len, dz: (bz - az) / len });
      acc += step * SCALE;
    }
    acc -= len;
  }
  return out;
}

function groundTexture() {
  const r = rng(11);
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${r() < 0.5 ? '120,100,70' : '255,250,240'},${0.04 + r() * 0.06})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 4);
    }
  }, [6, 6]);
}

function buildRoads() {
  const pavement = [], minor = [], major = [], marks = [], pierItems = [];
  for (const road of ROAD_LINES) {
    const isMajor = MAJOR.has(road.kind);
    if (PAVED.has(road.kind) && !road.bridge) ribbon(pavement, road.pts.map(([x, z]) => [x, z, Y.pavement]), road.width + 7);
    ribbon(isMajor ? major : minor, road.pts, road.width);
    if (isMajor || road.kind === 'tertiary') {
      // Dashed lane lines: 3 m dash every 9 m
      const offsets = road.width >= 14 ? [-road.width / 4, road.width / 4] : [0];
      for (const off of offsets) {
        for (const p of samplesAlong(road.pts, 9)) {
          const a = [p.x - p.dx * 0.015, p.z - p.dz * 0.015], b = [p.x + p.dx * 0.015, p.z + p.dz * 0.015];
          ribbon(marks, [[...a, p.y + 0.0006], [...b, p.y + 0.0006]], 0.35, { off });
        }
      }
    }
    if (road.bridge) {
      for (const p of samplesAlong(road.pts, 28)) {
        if (p.y > metres(2)) pierItems.push({ at: [p.x, p.z], s: [0.022, p.y, 0.022], yaw: Math.atan2(p.dx, p.dz) });
      }
    }
  }
  const flat = (color) => std(color, { roughness: 1 });
  const group = new THREE.Group();
  group.add(
    meshFrom(pavement, flat(C.pavement)),
    meshFrom(minor, flat(C.minor)),
    meshFrom(major, std(C.major, { roughness: 1, side: THREE.DoubleSide }), { cast: true }),
    meshFrom(marks, flat(C.mark)),
    instanced(box(1, 1, 1), std(C.pier), pierItems),
  );
  return group;
}

function buildRailway() {
  const ballast = [], rails = [], sleepers = [];
  for (const line of MAP.rail) {
    const pts = line.map((p) => [...toWorld(p), 0.004]);
    ribbon(ballast, pts, 5);
    for (const off of [-0.75, 0.75]) ribbon(rails, pts, 0.35, { off, dy: 0.0025 });
    for (const p of samplesAlong(pts, 2.2)) sleepers.push({ at: [p.x, p.z], y: 0.0045, yaw: Math.atan2(p.dx, p.dz), s: [0.026, 0.0015, 0.004] });
  }
  const group = new THREE.Group();
  group.add(meshFrom(ballast, std(C.ballast, { roughness: 1 })), meshFrom(rails, std(C.rail, { metalness: 0.4, roughness: 0.5 })));
  group.add(instanced(box(1, 1, 1), std(C.sleeper), sleepers, { cast: false }));
  return group;
}

export function buildGround() {
  const group = new THREE.Group();
  const size = HALF * 2, depth = 0.22;
  const side = std(C.soil, { roughness: 1 });
  const top = std(C.ground, { roughness: 1, map: groundTexture() });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(size, depth, size), [side, side, top, side, side, side]);
  slab.position.y = -depth / 2;
  slab.receiveShadow = true;
  const ply = new THREE.Mesh(new THREE.BoxGeometry(size + 0.06, 0.05, size + 0.06), std(C.plywood));
  ply.position.y = -depth - 0.025;
  group.add(slab, ply);

  const green = [], water = [];
  MAP.green.forEach((p) => fillPolygon(green, p.map(toWorld), 0.002));
  MAP.water.forEach((p) => fillPolygon(water, p.map(toWorld), 0.0025));
  group.add(
    meshFrom(green, std(C.green, { roughness: 1 })),
    meshFrom(water, std(C.water, { roughness: 0.15, metalness: 0.15 })),
    buildRoads(),
    buildRailway(),
  );
  return group;
}

// ---- Buildings ----------------------------------------------------------------------------

// Facade atlas: 8 bays × 8 floors per texture, v = 0 is the ground floor
function facadeTexture(style) {
  const r = rng(style.length * 31 + 7), cell = 64;
  return canvasTexture(512, 512, (g) => {
    g.fillStyle = '#f5f2ea';
    g.fillRect(0, 0, 512, 512);
    for (let cy = 0; cy < 8; cy++) for (let cx = 0; cx < 8; cx++) {
      const x = cx * cell, y = cy * cell, ground = cy === 7;
      if (style === 'glass') {
        g.fillStyle = ground ? '#3f5f6e' : '#5a8296';
        g.fillRect(x, y, cell, 54);
        const grd = g.createLinearGradient(x, y, x + cell, y + 54);
        grd.addColorStop(0, 'rgba(255,255,255,0.3)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(x, y, cell, 54);
        g.fillStyle = '#e8ebea';
        g.fillRect(x, y, 3, cell);
        g.fillRect(x, y + 54, cell, 10);
      } else if (style === 'shed') {
        g.fillStyle = '#d9d6cf';
        g.fillRect(x, y, cell, cell);
        g.fillStyle = 'rgba(0,0,0,0.07)';
        for (let k = 0; k < cell; k += 6) g.fillRect(x + k, y, 2, cell);
        if (ground && cx % 3 === 0) { g.fillStyle = '#8f9290'; g.fillRect(x + 6, y + 8, 52, 56); }
        if (cy === 1) { g.fillStyle = '#6d8c9c'; g.fillRect(x + 4, y + 20, 56, 12); }
      } else if (style === 'win') {
        g.fillStyle = 'rgba(0,0,0,0.05)';
        g.fillRect(x, y + 60, cell, 4);
        g.fillStyle = '#34424f';
        g.fillRect(x + 15, y + 14, 34, 32);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(x + 15, y + 14, 34, 9);
        g.fillStyle = '#d9d4c8';
        g.fillRect(x + 31, y + 14, 2, 32);
        g.fillStyle = '#ffffff';
        g.fillRect(x + 12, y + 46, 40, 4);
        if (r() < 0.3) { g.fillStyle = '#8a9a7a'; g.fillRect(x + 14, y + 40, 36, 6); }
      } else if (ground) {
        // Hà Nội tube houses: a shop front with a coloured signboard on the ground floor…
        const open = r() < 0.6;
        g.fillStyle = open ? '#3a302a' : '#9a9a96';
        g.fillRect(x + 6, y + 14, 52, 50);
        if (!open) for (let k = 16; k < 64; k += 4) { g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x + 6, y + k, 52, 1); }
        g.fillStyle = ['#c8321f', '#2f6db5', '#e2b33a', '#2f8a4a', '#d0551c'][Math.floor(r() * 5)];
        g.fillRect(x + 4, y + 4, 56, 9);
      } else if (r() < 0.45) {
        // …balconies with shutters, railings and potted plants above
        g.fillStyle = '#4a4440';
        g.fillRect(x + 8, y + 10, 48, 40);
        g.fillStyle = ['#5f8a6a', '#7a5a3a', '#f5f2ea', '#3f6d8a'][Math.floor(r() * 4)];
        g.fillRect(x + 10, y + 12, 20, 36);
        g.fillRect(x + 34, y + 12, 20, 36);
        g.fillStyle = '#222';
        for (let k = 8; k < 58; k += 5) g.fillRect(x + k, y + 40, 1, 14);
        g.fillRect(x + 6, y + 40, 52, 2);
        if (r() < 0.45) { g.fillStyle = '#4f8a3a'; g.fillRect(x + 8, y + 46, 48, 6); }
      } else {
        g.fillStyle = '#35414b';
        g.fillRect(x + 14, y + 14, 36, 30);
        g.fillStyle = 'rgba(255,255,255,0.2)';
        g.fillRect(x + 14, y + 14, 36, 8);
        g.fillStyle = '#ffffff';
        g.fillRect(x + 12, y + 44, 40, 3);
      }
    }
  });
}

const HOUSE_TINTS = ['#f3cf6e', '#efb2a0', '#c8dcbc', '#f7f5ef', '#b6cfe6', '#f2a466', '#e3bcd8', '#f8dc96', '#ffffff', '#9fd0c8'];
const STYLE_TINT = { win: '#efeae0', glass: '#f2f3f2', shed: '#e8e4dc' };
const FLOOR_M = { house: 3.4, win: 3.3, glass: 4.6, shed: 4.6 };
const MAJOR_POINTS = ROAD_LINES.filter((r) => MAJOR.has(r.kind)).flatMap((r) => samplesAlong(r.pts, 20));

export function nearMajorRoad(c, reachM) {
  const [x, z] = toWorld(c);
  return MAJOR_POINTS.some((p) => Math.hypot(p.x - x, p.z - z) < reachM * SCALE);
}

function classify(b, area, c) {
  const r = hash(b.id);
  if (b.l >= 7) return { style: 'win', floors: b.l };
  if (area < 220) return { style: 'house', floors: b.l || 3 + Math.floor(r * 3) + (r > 0.9 ? 1 : 0) };
  if (nearMajorRoad(c, 40 + Math.sqrt(area) / 2)) return { style: 'glass', floors: b.l || 2 };
  if (area > 1500) return { style: 'shed', floors: 2 + (r < 0.4 ? 1 : 0) };
  return { style: 'win', floors: b.l || 2 + Math.floor(r * 4) };
}

function pushWalls(buf, poly, y0, y1, tint, floorM) {
  for (let i = 0; i < poly.length; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length];
    const u = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / SCALE / 4)) / 8;
    const v0 = 0, v1 = (y1 - y0) / metres(floorM) / 8;
    buf.pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az);
    if (buf.uv) buf.uv.push(0, v0, u, v0, u, v1, 0, v0, u, v1, 0, v1);
    for (let k = 0; k < 6; k++) buf.col.push(tint.r, tint.g, tint.b);
  }
}

export function buildBuildings() {
  const walls = {}, roof = { pos: [], col: [] }, parapet = { pos: [], col: [] };
  const tanks = [], huts = [], acs = [];
  const tint = new THREE.Color(), shade = new THREE.Color();
  for (const b of MAP.buildings) {
    if (b.id === VENUE_ID) continue;
    const area = Math.abs(signedArea(b.p));
    if (area < 12) continue;
    const c = centroid(b.p);
    const { style, floors } = classify(b, area, c);
    let poly = b.p.map(toWorld);
    if (signedArea(poly) > 0) poly = poly.reverse();
    const top = metres(floors * FLOOR_M[style]);
    const r = hash(b.id + 13);
    tint.set(style === 'house' ? HOUSE_TINTS[Math.floor(r * HOUSE_TINTS.length)] : STYLE_TINT[style]);
    const buf = walls[style] ?? (walls[style] = { pos: [], uv: [], col: [] });
    pushWalls(buf, poly, 0, top, tint, FLOOR_M[style]);
    pushWalls(parapet, poly, top, top + metres(0.9), shade.copy(tint).multiplyScalar(0.93), 1);
    const roofStart = roof.pos.length;
    fillPolygon(roof.pos, poly, top + 0.0008);
    shade.set(style === 'house' && r < 0.3 ? '#b0684a' : '#bdb6a9').offsetHSL(0, 0, (hash(b.id + 3) - 0.5) * 0.08);
    for (let k = roofStart; k < roof.pos.length; k += 3) roof.col.push(shade.r, shade.g, shade.b);

    // Rooftop clutter: inox / blue water tanks and stair huts on houses, AC units elsewhere
    const at = toWorld(c);
    if (style === 'house') {
      if (r < 0.72) tanks.push({ at, y: top + metres(0.5), yaw: r * 6, c: hash(b.id + 5) < 0.55 ? '#dfe3e6' : '#3f78b5' });
      if (hash(b.id + 9) < 0.3) huts.push({ at: [at[0] + 0.012, at[1] - 0.008], y: top, s: [0.025, metres(2.4), 0.025], c: tint.getHex() });
    } else {
      const n = 1 + Math.floor(hash(b.id + 2) * 4);
      for (let k = 0; k < n; k++) {
        const [px, pz] = poly[Math.floor(hash(b.id + k * 7) * poly.length)];
        acs.push({ at: [at[0] + (px - at[0]) * 0.55, at[1] + (pz - at[1]) * 0.55], y: top, s: [0.012, metres(0.9), 0.009], yaw: r * 3 });
      }
    }
  }

  const group = new THREE.Group();
  for (const [style, buf] of Object.entries(walls)) {
    const mat = std('#ffffff', { map: facadeTexture(style), vertexColors: true, roughness: style === 'glass' ? 0.3 : 0.85, metalness: style === 'glass' ? 0.1 : 0 });
    group.add(meshFrom(buf.pos, mat, { uvs: buf.uv, colors: buf.col, cast: true }));
  }
  group.add(
    meshFrom(roof.pos, std('#ffffff', { vertexColors: true, roughness: 0.95 }), { colors: roof.col, cast: true }),
    meshFrom(parapet.pos, std('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), { colors: parapet.col }),
  );
  const tank = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 12);
  tank.rotateZ(Math.PI / 2);
  tank.scale(SCALE * 1.4, SCALE * 2.2, SCALE * 1.4);
  group.add(
    instanced(tank, std('#ffffff', { metalness: 0.5, roughness: 0.35 }), tanks),
    instanced(box(1, 1, 1), std('#ffffff'), huts),
    instanced(box(1, 1, 1), std('#dad7d0'), acs),
  );
  return group;
}
