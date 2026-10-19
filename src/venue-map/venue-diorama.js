// Tilt-shift 3D miniature of the venue's neighbourhood, built from OpenStreetMap data
// (`venue-map.json`, baked by `npm run venue-map`). Framework-free like `src/intro/`:
// `mountVenueDiorama(container, options)` builds everything inside `container` and returns a cleanup.
// Scene pieces live next door: city.js (ground, roads, buildings), life.js (trees, lamps, parking,
// traffic, people, train) and venue.js (Tasco Mall + the wedding entrance).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HALF, WIND, toWorld, metres, smooth } from './geometry.js';
import { buildGround, buildBuildings } from './city.js';
import { buildTrees, buildLamps, buildParking, buildTraffic, buildPedestrians, buildTrain } from './life.js';
import { buildVenue, entranceAhead, ENTRANCE } from './venue.js';

const INTRO_SECONDS = 2.6;
const GLIDE_SECONDS = 1.3;
const COLORS = { route: '#bf594f', motoRoute: '#b48749' };
// Camera presets: target in map metres, offset in world units (scaled up on portrait frames)
const VIEWS = {
  overview: { label: 'Toàn cảnh', target: [-250, -140], offset: [-2.2, 8.4, 9.8], rotate: true },
  parking: { label: 'Bãi gửi xe', target: [-85, 75], offset: [-3.9, 3.1, 1.0], rotate: false },
  // Look at the doors along the facade normal, from a little to the side and above
  entrance: { label: 'Sảnh cưới', target: entranceAhead(10), offset: [ENTRANCE.normal[0] * 0.8 + ENTRANCE.normal[1] * 0.35, 0.62, ENTRANCE.normal[1] * 0.8 - ENTRANCE.normal[0] * 0.35], rotate: false },
};

function buildRoute(points, color) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => { const [x, z] = toWorld(p); return new THREE.Vector3(x, 0.018, z); }));
  const uniforms = { uTime: { value: 0 }, uReveal: { value: 0 }, uColor: { value: new THREE.Color(color) } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform float uTime, uReveal; uniform vec3 uColor; varying vec2 vUv;
      void main(){
        if (vUv.x > uReveal) discard;
        float dash = step(0.55, fract(vUv.x * 36.0 - uTime * 0.9));
        gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.95, 0.88), dash * 0.7), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 320, 0.016, 8, false), material);
  return { mesh, uniforms };
}

// Tilt-shift + ACES + sRGB in one pass, adapted from the reference diorama
function buildPost(renderer) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    uniforms: { tScene: { value: target.texture }, uTexel: { value: new THREE.Vector2(1 / size.x, 1 / size.y) }, uBlur: { value: 6 * renderer.getPixelRatio() } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tScene; uniform vec2 uTexel; uniform float uBlur; varying vec2 vUv;
      vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      void main(){
        float dy = vUv.y - 0.48;
        float amt = smoothstep(0.17, 0.55, abs(dy)) * uBlur * (dy > 0.0 ? 0.6 : 1.0);
        vec4 acc = texture2D(tScene, vUv);
        if (amt > 0.05) {
          acc = vec4(0.0);
          for (int i = 0; i < 20; i++) {
            float fi = float(i), r = sqrt((fi + 0.5) / 20.0), a = fi * 2.39996323;
            acc += texture2D(tScene, vUv + vec2(cos(a), sin(a)) * r * amt * uTexel);
          }
          acc /= 20.0;
        }
        float al = clamp(acc.a, 0.0, 1.0);
        vec3 col = al > 0.001 ? acc.rgb / max(acc.a, 0.001) : vec3(0.0);
        col = aces(col * 0.95);
        gl_FragColor = vec4(toSRGB(col) * al, al);
      }`,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const resize = () => {
    renderer.getDrawingBufferSize(size);
    target.setSize(size.x, size.y);
    material.uniforms.uTexel.value.set(1 / size.x, 1 / size.y);
  };
  const render = (scene3d, camera3d) => {
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene3d, camera3d);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  };
  return { render, resize, dispose: () => { target.dispose(); material.dispose(); } };
}

function buildTags(container, labels) {
  const layer = document.createElement('div');
  layer.className = 'venue-diorama-tags';
  layer.setAttribute('aria-hidden', 'true');
  const tags = labels.map(({ text, at, h = 0, tone = 'place', view = 'overview' }) => {
    const el = document.createElement('span');
    el.className = `venue-diorama-tag venue-diorama-tag--${tone}`;
    el.dataset.view = view;
    el.textContent = text;
    layer.append(el);
    const [x, z] = toWorld(at);
    return { el, views: [view].flat(), tone, pos: new THREE.Vector3(x, metres(h), z) };
  });
  container.append(layer);
  const setView = (name) => { for (const t of tags) t.el.hidden = !t.views.includes(name) && t.tone !== 'venue'; };
  setView('overview');
  const v = new THREE.Vector3();
  const update = (camera, w, h) => {
    for (const t of tags) {
      v.copy(t.pos).project(camera);
      const hidden = v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05;
      t.el.style.opacity = hidden ? '0' : '';
      const half = t.el.offsetWidth / 2 + 4; // keep the pill inside the frame on narrow screens
      const x = Math.min(w - half, Math.max(half, ((v.x + 1) / 2) * w));
      t.el.style.transform = `translate(${x}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -100%)`;
    }
  };
  return { layer, update, setView };
}

function buildViewSwitch(container, onPick) {
  const bar = document.createElement('div');
  bar.className = 'venue-diorama-views';
  const buttons = Object.entries(VIEWS).map(([name, { label: text }]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.setAttribute('aria-pressed', String(name === 'overview'));
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      onPick(name);
    });
    bar.append(btn);
    return btn;
  });
  container.append(bar);
  return bar;
}

/**
 * @param {HTMLElement} container
 * @param {{ route: number[][], motoRoute: number[][], welcome?: string, labels: { text: string, at: number[], h?: number, tone?: string, view?: string }[], reducedMotion?: boolean }} options
 * @returns {() => void} cleanup
 */
export function mountVenueDiorama(container, { route, motoRoute, labels, welcome = '', reducedMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#fff1dc', '#8a8f6a', 1.3));
  const sun = new THREE.DirectionalLight('#ffe2b8', 2.6);
  sun.position.set(-4, 8, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -HALF - 1, right: HALF + 1, top: HALF + 1, bottom: -HALF - 1, near: 0.5, far: 25 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const venue = buildVenue({ welcome, reducedMotion });
  const movers = [buildTraffic(reducedMotion), buildPedestrians(reducedMotion), buildTrain(reducedMotion), venue];
  scene.add(sun, buildGround(), buildBuildings(), buildParking(), buildTrees(), buildLamps(), ...movers.map((m) => m.group));

  const paths = [buildRoute(route, COLORS.route), buildRoute(motoRoute, COLORS.motoRoute)];
  scene.add(...paths.map((p) => p.mesh));

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.07, enablePan: false, minDistance: 0.8, maxDistance: 19,
    minPolarAngle: 0.25, maxPolarAngle: 1.2, autoRotate: !reducedMotion, autoRotateSpeed: 0.35,
  });
  // Keep the page scrollable: one finger scrolls, two fingers orbit/zoom; wheel zooms only with Ctrl/⌘
  controls.touches = { ONE: -1, TWO: THREE.TOUCH.DOLLY_ROTATE };
  renderer.domElement.style.touchAction = 'pan-y';
  const passWheel = (e) => { if (!e.ctrlKey && !e.metaKey) e.stopImmediatePropagation(); };
  renderer.domElement.addEventListener('wheel', passWheel, { capture: true });
  const viewTarget = (name) => { const [x, z] = toWorld(VIEWS[name].target); return new THREE.Vector3(x, 0, z); };
  const TARGET = viewTarget('overview');
  controls.target.copy(TARGET);

  const post = buildPost(renderer);
  const tags = buildTags(container, labels);
  let width = 1, height = 1, homeScale = 1;
  const viewCamera = (name) => viewTarget(name).addScaledVector(new THREE.Vector3(...VIEWS[name].offset), homeScale);
  const home = () => viewCamera('overview');
  const resize = () => {
    width = container.clientWidth || 1;
    height = container.clientHeight || 1;
    const aspect = width / height;
    homeScale = aspect < 1.2 ? Math.min(2.4, 1.5 / aspect) : 1;
    renderer.setSize(width, height);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    post.resize();
  };
  resize();
  const introFrom = TARGET.clone().add(new THREE.Vector3(3, 13, 3).multiplyScalar(homeScale));
  camera.position.copy(reducedMotion ? home() : introFrom);
  controls.enabled = reducedMotion;
  container.classList.toggle('is-ready', reducedMotion);

  let glide = null;
  const views = buildViewSwitch(container, (name) => {
    tags.setView(name);
    controls.autoRotate = VIEWS[name].rotate && !reducedMotion;
    glide = { t: reducedMotion ? 1 : 0, fromT: controls.target.clone(), toT: viewTarget(name), fromP: camera.position.clone(), toP: viewCamera(name) };
    controls.enabled = false;
  });

  const clock = new THREE.Clock(false);
  let introT = reducedMotion ? 1 : 0, frameId = 0, t = 0;
  const frame = () => {
    frameId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt; // own clock: Clock#start() would reset it each time the map scrolls back in
    if (introT < 1) {
      introT = Math.min(1, introT + dt / INTRO_SECONDS);
      const e = 1 - (1 - introT) ** 3;
      camera.position.lerpVectors(introFrom, home(), e);
      camera.lookAt(TARGET);
      if (introT === 1) { controls.enabled = true; container.classList.add('is-ready'); }
    } else if (glide) {
      glide.t = Math.min(1, glide.t + dt / GLIDE_SECONDS);
      const e = glide.t * glide.t * (3 - 2 * glide.t);
      controls.target.lerpVectors(glide.fromT, glide.toT, e);
      camera.position.lerpVectors(glide.fromP, glide.toP, e);
      camera.lookAt(controls.target);
      if (glide.t === 1) { glide = null; controls.enabled = true; }
    } else {
      controls.update();
    }
    for (const { uniforms } of paths) {
      uniforms.uReveal.value = reducedMotion ? 1 : smooth(0.15, 0.95, t / INTRO_SECONDS);
      uniforms.uTime.value = reducedMotion ? 0 : t;
    }
    WIND.uTime.value = reducedMotion ? 0 : t;
    for (const m of movers) m.update(dt, t);
    post.render(scene, camera);
    tags.update(camera, width, height);
  };

  // Only spend frames while the map is on screen
  const start = () => { if (!frameId) { clock.start(); frame(); } };
  const stop = () => { cancelAnimationFrame(frameId); frameId = 0; clock.stop(); };
  const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
  visibility.observe(container);
  const sizing = new ResizeObserver(resize);
  sizing.observe(container);

  return () => {
    stop();
    visibility.disconnect();
    sizing.disconnect();
    renderer.domElement.removeEventListener('wheel', passWheel, { capture: true });
    controls.dispose();
    post.dispose();
    scene.traverse((o) => {
      o.geometry?.dispose();
      [o.material].flat().forEach((m) => { m?.map?.dispose(); m?.dispose(); });
    });
    renderer.dispose();
    renderer.domElement.remove();
    tags.layer.remove();
    views.remove();
  };
}
