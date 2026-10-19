// Tasco Mall (ex-Savico Megamall) as the hero piece, modelled after aerial photos of the real building:
// a long three-storey block in silver aluminium cladding, glass bays alternating with tenant boards,
// a glazed centre entrance, red "TASCO MALL" letters on the roof edge and a car park on the roof.
// Out front: the ground car park, a paved plaza to the road lined with palms, a white fence along
// Nguyễn Văn Linh — plus the wedding touches at the doors: canopy, red carpet, flower arch, couple, guests.
import * as THREE from 'three';
import {
  MAP, SCALE, LIFT, PROP, VENUE_HEIGHT, VENUE_FOOTPRINT, ENTRANCE, PLAZA, entranceAhead, toWorld, metres,
  smooth, rng, hash, signedArea, centroid, insidePolygon, pushUp, fillPolygon, meshFrom, std, instanced,
  mergeColoured, box, walker, canvasTexture, onPlaza,
} from './geometry.js';
import { fleet, crowdParts, MODELS } from './life.js';
import { nearMajorRoad } from './city.js';

export { ENTRANCE, entranceAhead };

const ACCENT = '#bf594f';
const GUEST_SHIRTS = ['#c8321f', '#f2efe6', '#2b2d42', '#e8b4b8', '#b48749', '#3d5a80', '#ffffff', '#9e4039'];
const PARAPET_M = 1.3;
const TENANTS = [['SIÊU THỊ', '#c8321f'], ['NỘI THẤT', '#2f8a4a'], ['ĐIỆN MÁY', '#2f6db5'], ['CINEMA', '#7a3f98'], ['ẨM THỰC', '#e07a1f'], ['THỜI TRANG', '#d4a51c']];

// ---- Facade textures --------------------------------------------------------------------------

function cladding(g, x, y, w, h) {
  g.fillStyle = '#c9cdd1';
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(60,70,80,0.18)';
  for (let k = y; k < y + h; k += 22) g.fillRect(x, k, w, 1);
  for (let k = x; k < x + w; k += 44) g.fillRect(k, y, 1, h);
}

function glassBay(g, x, y, w, h, pxPerM, light = false) {
  const grd = g.createLinearGradient(x, y, x + w * 0.6, y + h);
  grd.addColorStop(0, light ? '#7ea2b2' : '#3f6676');
  grd.addColorStop(1, light ? '#4f7686' : '#22404c');
  g.fillStyle = grd;
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(230,236,238,0.75)';
  for (let k = x; k <= x + w; k += 1.6 * pxPerM) g.fillRect(k, y, 2, h);
  for (const f of [0.35, 0.68]) g.fillRect(x, y + h * f, w, 3);
}

// One canvas for the whole entrance facade; u runs left → right as seen from the car park
function frontTexture(widthM, heightM) {
  const W = 2048, H = 320, px = W / widthM, py = H / heightM;
  return canvasTexture(W, H, (g) => {
    cladding(g, 0, 0, W, H);
    const centre = 26, side = (widthM - centre) / 2;
    const segments = [];
    for (let acc = 0, k = 0; acc < side - 0.1; k++) {
      const w = Math.min(k % 2 ? 9 : 11, side - acc);
      segments.push({ x: acc, w, kind: k % 2 ? 'panel' : 'glass' });
      acc += w;
    }
    const mirrored = segments.map((s) => ({ ...s, x: widthM - s.x - s.w }));
    const top = 1.6 * py, bottom = H - 0.7 * py;
    [...segments, ...mirrored].forEach((s, i) => {
      if (s.kind === 'glass') glassBay(g, s.x * px + 4, top, s.w * px - 8, bottom - top, px);
      else {
        const [label, colour] = TENANTS[i % TENANTS.length];
        g.fillStyle = colour;
        g.fillRect((s.x + 1.2) * px, 3.2 * py, (s.w - 2.4) * px, 3.6 * py);
        g.fillStyle = '#ffffff';
        g.font = `bold ${Math.round(1.6 * py)}px sans-serif`;
        g.textAlign = 'center';
        g.fillText(label, (s.x + s.w / 2) * px, 5.6 * py);
        glassBay(g, (s.x + 1) * px, H - 4.6 * py, (s.w - 2) * px, 3.9 * py, px, true); // shop window
      }
    });
    // Glazed centre entrance between white columns, with the Trống Đồng Palace banner on floor 2–3
    const cx = side * px, cw = centre * px;
    glassBay(g, cx, top, cw, bottom - top, px, true);
    g.fillStyle = '#eef0f0';
    for (let k = 0; k <= centre; k += centre / 6) g.fillRect(cx + k * px - 4, top, 8, bottom - top);
    g.fillStyle = '#8f2d26';
    g.fillRect(cx + 2 * px, 2.4 * py, cw - 4 * px, 3.4 * py);
    g.strokeStyle = '#e8c79a';
    g.lineWidth = 3;
    g.strokeRect(cx + 2.3 * px, 2.7 * py, cw - 4.6 * px, 2.8 * py);
    g.fillStyle = '#f6dcae';
    g.textAlign = 'center';
    g.font = `600 ${Math.round(1.5 * py)}px Georgia, serif`;
    g.fillText('TRỐNG ĐỒNG PALACE', cx + cw / 2, 4.3 * py);
    g.font = `500 ${Math.round(0.75 * py)}px sans-serif`;
    g.fillText('TIỆC CƯỚI · TẦNG 2', cx + cw / 2, 5.4 * py);
    g.fillStyle = '#3a3f44';
    g.fillRect(0, bottom, W, H - bottom);
  });
}

function sideTexture() {
  return canvasTexture(256, 320, (g, w, h) => {
    cladding(g, 0, 0, w, h);
    glassBay(g, w * 0.36, 30, w * 0.28, h - 60, 30);
    g.fillStyle = '#3a3f44';
    g.fillRect(0, h - 12, w, 12);
  }, [1, 1]);
}

function lettersTexture() {
  return canvasTexture(1024, 160, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#d42a1e';
    g.textAlign = 'center';
    g.font = 'bold 128px sans-serif';
    g.fillText('TASCO MALL', w / 2, h - 22);
  });
}

// ---- The building -----------------------------------------------------------------------------

function buildMall() {
  const map = signedArea(VENUE_FOOTPRINT) > 0 ? [...VENUE_FOOTPRINT].reverse() : VENUE_FOOTPRINT;
  const poly = map.map(toWorld);
  const top = metres(VENUE_HEIGHT), cap = top + metres(PARAPET_M);
  const front = { pos: [], uv: [] }, sides = { pos: [], uv: [] }, parapet = [];
  poly.forEach(([ax, az], i) => {
    const [bx, bz] = poly[(i + 1) % poly.length];
    const [ma, mb] = [map[i], map[(i + 1) % map.length]];
    const isFront = Math.hypot((ma[0] + mb[0]) / 2 - ENTRANCE.at[0], (ma[1] + mb[1]) / 2 - ENTRANCE.at[1]) < 0.5;
    const u = isFront ? 1 : Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / SCALE / 8));
    const buf = isFront ? front : sides;
    buf.pos.push(ax, 0, az, bx, 0, bz, bx, top, bz, ax, 0, az, bx, top, bz, ax, top, az);
    buf.uv.push(0, 0, u, 0, u, 1, 0, 0, u, 1, 0, 1);
    parapet.push(ax, top, az, bx, top, bz, bx, cap, bz, ax, top, az, bx, cap, bz, ax, cap, az);
  });
  const roof = [];
  fillPolygon(roof, poly, top + 0.0006);
  const group = new THREE.Group();
  group.add(
    meshFrom(front.pos, std('#ffffff', { map: frontTexture(ENTRANCE.width, VENUE_HEIGHT), roughness: 0.4, metalness: 0.15 }), { uvs: front.uv, cast: true }),
    meshFrom(sides.pos, std('#ffffff', { map: sideTexture(), roughness: 0.5, metalness: 0.15 }), { uvs: sides.uv, cast: true }),
    meshFrom(parapet, std('#bfc3c6', { side: THREE.DoubleSide, metalness: 0.2 }), { cast: true }),
    meshFrom(roof, std('#8e908e', { roughness: 1 })),
    buildRoofParking(map, top),
  );

  // Red "TASCO MALL" letters standing on the roof edge above the entrance
  const letters = new THREE.Mesh(new THREE.PlaneGeometry(34 * SCALE, metres(4.8)), new THREE.MeshStandardMaterial({ map: lettersTexture(), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, emissive: '#ff3b2a', emissiveIntensity: 0.15 }));
  const [lx, lz] = toWorld(entranceAhead(0.3));
  letters.position.set(lx, cap + metres(2.4), lz);
  letters.rotation.y = Math.atan2(ENTRANCE.normal[0], ENTRANCE.normal[1]);
  group.add(letters);
  return group;
}

// Rooftop car park: bays in rows parallel to the facade, ~70% taken, two stair/lift towers
function buildRoofParking(map, top) {
  const { along, normal } = ENTRANCE;
  const local = map.map(([x, z]) => [(x - ENTRANCE.at[0]) * along[0] + (z - ENTRANCE.at[1]) * along[1], (x - ENTRANCE.at[0]) * normal[0] + (z - ENTRANCE.at[1]) * normal[1]]);
  const sMin = Math.min(...local.map((p) => p[0])), sMax = Math.max(...local.map((p) => p[0]));
  const qMin = Math.min(...local.map((p) => p[1]));
  const pointAt = (s, q) => [ENTRANCE.at[0] + along[0] * s + normal[0] * q, ENTRANCE.at[1] + along[1] * s + normal[1] * q];
  const insideRoof = (s, q) => [[-3, -3], [3, -3], [-3, 3], [3, 3]].every(([a, b]) => insidePolygon(pointAt(s + a, q + b), map));
  const lines = [], cars = [];
  const y = top + 0.0012;
  let n = 0;
  for (let q = -8; q > qMin + 6; q -= 17) {
    for (const side of [-1, 1]) {
      const qc = q + side * 5.6;
      for (let s = sMin + 4; s < sMax - 4; s += 2.6) {
        if (!insideRoof(s, qc)) continue;
        const a = pointAt(s - 1.3, qc - side * 2.6), b = pointAt(s - 1.3, qc + side * 2.6);
        const w = [along[0] * 0.12, along[1] * 0.12];
        const quad = [[a[0] - w[0], a[1] - w[1]], [a[0] + w[0], a[1] + w[1]], [b[0] + w[0], b[1] + w[1]], [b[0] - w[0], b[1] - w[1]]].map((p) => { const [wx, wz] = toWorld(p); return [wx, y, wz]; });
        pushUp(lines, quad[0], quad[1], quad[2]);
        pushUp(lines, quad[0], quad[2], quad[3]);
        n += 1;
        if (hash(n * 17 + 3) < 0.7) cars.push({ at: toWorld(pointAt(s, qc)), y: top, yaw: Math.atan2(normal[0] * side, normal[1] * side), c: ['#f4f2ee', '#2d3238', '#9aa3a8', '#7d2f2a', '#3d5a74', '#c9c3b6'][Math.floor(hash(n) * 6)] });
      }
    }
  }
  const group = new THREE.Group();
  group.add(meshFrom(lines, std('#f4f1ea', { roughness: 1 })));
  if (cars.length) group.add(instanced(MODELS.car(), std('#ffffff', { vertexColors: true, roughness: 0.45 }), cars));
  const towers = [sMin + 12, sMax - 12].map((s) => ({ at: toWorld(pointAt(s, -6)), y: top, yaw: Math.atan2(along[0], along[1]), s: [7 * SCALE, metres(4), 5 * SCALE] }));
  group.add(instanced(box(1, 1, 1), std('#d7dadc', { metalness: 0.2 }), towers));
  return group;
}

// ---- Forecourt: plaza, palms, fence ------------------------------------------------------------

function plazaTexture() {
  return canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = '#e4ddcf';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,100,80,0.18)';
    for (let k = 0; k < w; k += 16) { g.fillRect(k, 0, 1, h); g.fillRect(0, k, w, 1); }
    g.fillStyle = '#c9b8a0';
    g.fillRect(0, 56, w, 16);
  });
}

const palmGeometry = () => {
  const fronds = Array.from({ length: 8 }, (_, i) => {
    const f = new THREE.BoxGeometry(0.55, 0.08, 3.4);
    f.translate(0, 0, 1.7);
    f.rotateX(0.35);
    f.rotateY((i / 8) * Math.PI * 2);
    f.translate(0, 8, 0);
    return [f, i % 2 ? '#4f8a3a' : '#5f9a40'];
  });
  return mergeColoured([[new THREE.CylinderGeometry(0.16, 0.24, 8, 6).translate(0, 4, 0), '#9a8a70'], ...fronds]).scale(SCALE * 1.1, SCALE * 1.3, SCALE * 1.1);
};

function buildForecourt() {
  const group = new THREE.Group();
  // Plaza strip
  const corners = [entranceAhead(0, -PLAZA.width / 2), entranceAhead(0, PLAZA.width / 2), entranceAhead(PLAZA.length, PLAZA.width / 2), entranceAhead(PLAZA.length, -PLAZA.width / 2)]
    .map((p) => { const [x, z] = toWorld(p); return [x, 0.0042, z]; });
  const pos = [], uv = [];
  const tri = (a, b, c, ua, ub, uc) => { pushUp(pos, a, b, c); uv.push(...ua, ...ub, ...uc); };
  const [u0, u1, v1] = [[0, 0], [PLAZA.width / 4, 0], PLAZA.length / 4];
  tri(corners[0], corners[1], corners[2], u0, u1, [u1[0], v1]);
  tri(corners[0], corners[2], corners[3], u0, [u1[0], v1], [0, v1]);
  group.add(meshFrom(pos, std('#ffffff', { map: plazaTexture(), roughness: 1 }), { uvs: uv }));

  // Palms down both sides of the plaza and along the road edge of the car park; white fence on that edge
  const palms = [];
  for (let m = 14; m < PLAZA.length; m += 11) for (const side of [-1, 1]) palms.push(entranceAhead(m, side * (PLAZA.width / 2 + 1.6)));
  const fence = [];
  const lot = MAP.parking.filter((l) => l.k === 'car').reduce((a, b) => (b.p.length > a.p.length ? b : a));
  const [lcx, lcz] = centroid(lot.p);
  lot.p.forEach((a, i) => {
    const b = lot.p[(i + 1) % lot.p.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 8 || !nearMajorRoad([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 35)) return;
    const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    let inx = -uz, inz = ux;
    if (inx * (lcx - a[0]) + inz * (lcz - a[1]) < 0) { inx = -inx; inz = -inz; }
    for (let d = 1.5; d < len; d += 3) {
      const p = [a[0] + ux * d, a[1] + uz * d];
      if (onPlaza([p[0] + inx * 2, p[1] + inz * 2])) continue;
      fence.push({ at: toWorld(p), yaw: Math.atan2(ux, uz), s: [0.14 * SCALE, metres(1.1), 3 * SCALE] });
      if (Math.round(d / 3) % 3 === 0) palms.push([p[0] + inx * 2.5, p[1] + inz * 2.5]);
    }
  });
  const r = rng(77);
  group.add(
    instanced(palmGeometry(), std('#ffffff', { vertexColors: true, roughness: 0.8 }), palms.map((p) => ({ at: toWorld(p), yaw: r() * 6, s: 0.9 + r() * 0.25 }))),
    instanced(box(1, 1, 1), std('#f4f4f0'), fence),
  );
  return group;
}

// ---- Wedding entrance --------------------------------------------------------------------------

function welcomeTexture(welcome) {
  return canvasTexture(256, 360, (g, w, h) => {
    g.fillStyle = '#fbf6ec';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b48749';
    g.lineWidth = 8;
    g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#c8321f';
    g.textAlign = 'center';
    g.font = 'bold 120px serif';
    g.fillText('囍', w / 2, 160);
    g.fillStyle = '#3b2b22';
    g.font = 'italic 30px Georgia, serif';
    welcome.split(' & ').forEach((line, i) => g.fillText(i ? `& ${line}` : line, w / 2, 230 + i * 44));
  });
}

// Local frame: +z points away from the facade, units = metres (enlarged like the cars and people)
function buildEntrance(welcome) {
  const anchor = new THREE.Group();
  const [ex, ez] = toWorld(ENTRANCE.at);
  anchor.position.set(ex, 0, ez);
  anchor.rotation.y = Math.atan2(ENTRANCE.normal[0], ENTRANCE.normal[1]);
  const deco = new THREE.Group();
  deco.scale.set(PROP.x, SCALE * LIFT, PROP.z);
  anchor.add(deco);

  const add = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; deco.add(m); return m; };
  // Canopy on posts, red carpet
  add(box(18, 0.6, 8, 0, 5.4, 4), std('#f4f1ea'));
  add(box(18.2, 0.5, 0.2, 0, 5.5, 8), std(ACCENT));
  for (const x of [-8, 8]) add(box(0.4, 5.4, 0.4, x, 0, 7.6), std('#e8e4da'));
  add(box(3.4, 0.08, 16, 0, 0.35, 8), std('#b3261e', { roughness: 1 }), false);
  // Flower arch over the carpet
  const arch = add(new THREE.TorusGeometry(2.6, 0.32, 8, 24, Math.PI), std('#f3ece2'));
  arch.position.set(0, 0.4, 11);
  const r = rng(22), flowers = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 25) * Math.PI;
    flowers.push({ at: [Math.cos(a) * 2.6 + (r() - 0.5) * 0.5, 11 + (r() - 0.5) * 0.5], y: 0.4 + Math.sin(a) * 2.6 + (r() - 0.5) * 0.4, s: 0.45 + r() * 0.35, c: ['#f2b8c6', '#ffffff', '#e8798f', '#f7d6dd', '#d94f6b'][Math.floor(r() * 5)] });
  }
  deco.add(instanced(new THREE.IcosahedronGeometry(1, 0), std('#ffffff', { roughness: 0.7, flatShading: true }), flowers));
  // Balloon clusters at the canopy corners
  const balloons = [];
  for (const x of [-8.6, 8.6]) for (let i = 0; i < 6; i++) balloons.push({ at: [x + (r() - 0.5) * 1.4, 8 + (r() - 0.5) * 1.2], y: 5.6 + r() * 1.6, s: 0.55, c: i % 2 ? '#c8321f' : '#e8c79a' });
  deco.add(instanced(new THREE.SphereGeometry(1, 10, 8), std('#ffffff', { roughness: 0.3 }), balloons));
  // Welcome easel with the couple's names
  const board = add(new THREE.PlaneGeometry(1.6, 2.2), new THREE.MeshStandardMaterial({ map: welcomeTexture(welcome), roughness: 0.8, side: THREE.DoubleSide }), false);
  board.position.set(3.6, 1.9, 6.5);
  board.rotation.y = -0.5;
  add(box(0.1, 1.2, 0.1, 3.6, 0, 6.5), std('#6b4a2f'));

  // The couple under the arch, and guests standing about (world-unit instanced figures)
  const couple = mergeColoured([
    [new THREE.ConeGeometry(0.55, 1.35, 12).translate(-0.45, 0.68, 0), '#ffffff'],
    [box(0.36, 0.42, 0.24, -0.45, 1.25), '#ffffff'],
    [box(0.24, 0.25, 0.24, -0.45, 1.52), '#e0b38f'],
    [box(0.3, 0.3, 0.3, -0.45, 1.72), '#1d1714'],
    [box(0.36, 0.86, 0.24, 0.45, 0), '#22252b'],
    [box(0.46, 0.66, 0.28, 0.45, 0.84), '#22252b'],
    [box(0.1, 0.4, 0.05, 0.45, 1.05, 0.15), '#f4f1ea'],
    [box(0.24, 0.25, 0.24, 0.45, 1.5), '#d7a77f'],
    [box(0.27, 0.12, 0.27, 0.45, 1.72), '#1d1714'],
  ]).scale(PROP.x, PROP.y, PROP.z);
  const coupleMesh = new THREE.Mesh(couple, std('#ffffff', { vertexColors: true, roughness: 0.6 }));
  coupleMesh.position.set(0, 0.0008, 11 * PROP.z);
  coupleMesh.castShadow = true;
  anchor.add(coupleMesh);

  const standing = fleet(crowdParts(), 12);
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1;
    standing.place(i, side * (2.8 + r() * 3) * PROP.x, 0.0008, (4 + r() * 9) * PROP.z, side * -1.2 + (r() - 0.5));
    standing.paint(i, 0, GUEST_SHIRTS[i % GUEST_SHIRTS.length]);
  }
  standing.commit();
  anchor.add(...standing.meshes);
  return anchor;
}

// Guests walking from the car park onto the plaza, then up to the door
function buildArrivals(reducedMotion) {
  const r = rng(31);
  const guests = Array.from({ length: 18 }, (_, i) => {
    const side = (r() < 0.5 ? -1 : 1) * (PLAZA.width / 2 + 6 + r() * 30);
    const ahead = 20 + r() * 60;
    const path = walker([entranceAhead(ahead, side), entranceAhead(ahead, side * 0.1), entranceAhead(3, (r() - 0.5) * 3)].map((p) => [...toWorld(p), 0.0045]));
    return { path, s: r() * path.length, speed: (1.1 + r() * 0.4) * SCALE * 1.4, ph: r() * 6, shirt: GUEST_SHIRTS[i % GUEST_SHIRTS.length] };
  });
  const f = fleet(crowdParts(), guests.length);
  guests.forEach((g, i) => f.paint(i, 0, g.shirt));
  const p = {};
  const update = (dt, t) => {
    guests.forEach((g, i) => {
      if (!reducedMotion) g.s = (g.s + g.speed * dt) % g.path.length;
      g.path.at(g.s, p);
      const fade = smooth(0, 0.02, g.s) * smooth(0, 0.02, g.path.length - g.s);
      f.place(i, p.x, p.y + (reducedMotion ? 0 : Math.abs(Math.sin(t * 7 + g.ph)) * 0.0008), p.z, Math.atan2(p.dx, p.dz), fade);
    });
    f.commit();
  };
  update(0, 0);
  const group = new THREE.Group();
  group.add(...f.meshes);
  return { group, update };
}

function buildPin() {
  const group = new THREE.Group();
  const red = std(ACCENT, { roughness: 0.45, emissive: ACCENT, emissiveIntensity: 0.25 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), red);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.17, 24), red);
  head.position.y = 0.17;
  tip.position.y = 0.07;
  tip.rotation.x = Math.PI;
  head.castShadow = tip.castShadow = true;
  const float = new THREE.Group();
  float.add(head, tip);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.17, 48), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  group.add(float, ring);
  const [x, z] = toWorld(centroid(VENUE_FOOTPRINT));
  group.position.set(x, metres(VENUE_HEIGHT + PARAPET_M) + 0.002, z);
  float.position.y = 0.05;
  return { group, float, ring };
}

export function buildVenue({ welcome, reducedMotion }) {
  const group = new THREE.Group();
  const pin = buildPin();
  const arrivals = buildArrivals(reducedMotion);
  group.add(buildMall(), buildForecourt(), buildEntrance(welcome), arrivals.group, pin.group);
  const update = (dt, t) => {
    arrivals.update(dt, t);
    if (reducedMotion) return;
    pin.float.position.y = 0.05 + Math.sin(t * 2.2) * 0.025;
    const pulse = (t * 0.6) % 1;
    pin.ring.scale.setScalar(1 + pulse * 1.6);
    pin.ring.material.opacity = 1 - pulse;
  };
  return { group, update };
}
