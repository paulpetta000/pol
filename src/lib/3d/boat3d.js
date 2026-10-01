import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { classe, WIND, V3, clamp, lerp, rad, geom, faceTo, rod, limb, tube, loft, wingStations, dRing, sailGrid } from './b3/model.js';
import { carbonTex, noiseTex, hullTexture, sailTexture, waterNormals } from './b3/textures.js';
import { NOISE, waterVS, waterFS, cloudVS, cloudFS, landVS, landFS, sprayVS, sprayFS, CSS } from './b3/shaders.js';

/* AC75 e AC40 ricostruiti sulle misure di classe (vedi b3/model.js). Tre modi: "ac75", "ac40" e "confronto",
   con le due barche in fila alla stessa scala. Assi: X verso prua, Y verso l'alto, acqua a y = 0, vento da +Z. */

// Inquadrature per ogni tappa (metri; t = punto guardato, d = distanza, az/el = angoli in gradi)
const VIEWS = {
  ac40: [
    { t: [0, 7, 0], d: 25, az: 35, el: 10 },
    { t: [0.1, 18.9, -0.5], d: 7.5, az: 60, el: 4 },
    { t: [-1.2, 9.5, -0.6], d: 19, az: 115, el: 6 },
    { t: [3.2, 7, -0.4], d: 14, az: 60, el: 8 },
    { t: [-1.3, 2.6, -0.4], d: 7.5, az: 150, el: 30 },
    { t: [-2.1, 2.5, 0.9], d: 4.8, az: 120, el: 24 },
    { t: [0, 1.6, 0], d: 16, az: 90, el: 4 },
    { t: [-0.5, 1.7, 0], d: 5.6, az: -115, el: 30 },
    { t: [0.4, 3.8, 3.3], d: 8.5, az: 40, el: 12 },
    { t: [-1, 0.4, -1.2], d: 12, az: -60, el: 3 },
    { t: [0.3, -0.6, -2.1], d: 6.5, az: -70, el: -4 },
    { t: [0.2, -1.35, -2.3], d: 3.9, az: -40, el: 12 },
    { t: [-6.1, -1.0, 0], d: 3.7, az: -140, el: 2 },
    { t: [0, 7, 0], d: 25, az: 215, el: 10 }
  ],
  ac75: [
    { t: [0, 11, 0], d: 42, az: 35, el: 10 },
    { t: [-3.3, 29.2, -0.7], d: 11, az: 60, el: 4 },
    { t: [-3.6, 14.5, -0.9], d: 32, az: 115, el: 6 },
    { t: [3.4, 11.5, -0.6], d: 24, az: 60, el: 8 },
    { t: [-5.4, 4.3, 1.4], d: 9.5, az: 118, el: 28 },
    { t: [-1.6, 3.1, 0], d: 9.5, az: -115, el: 30 },
    { t: [0, 2.8, 0], d: 28, az: 90, el: 4 },
    { t: [0.7, 6.4, 4.6], d: 14, az: 40, el: 12 },
    { t: [-1.5, 0.5, -1.8], d: 20, az: -60, el: 3 },
    { t: [0.9, 1.3, -2.8], d: 10, az: -65, el: 4 },
    { t: [0.7, -1.4, -3.6], d: 7.5, az: -40, el: 7 },
    { t: [-10.3, -1.1, -0.1], d: 5, az: -140, el: 5 },
    { t: [0, 11, 0], d: 42, az: 215, el: 10 }
  ],
  confronto: [
    { t: [-7.5, 12.5, 0], d: 61, az: -90, el: 4 },
    { t: [-7.5, 11, 0], d: 64, az: -42, el: 14 },
    { t: [-7.5, 9, 0], d: 68, az: 90, el: 30 }
  ]
};

const LABELS = {
  top: 'Testa della vela', main: 'Randa a doppia pelle', jib: 'Fiocco', deck: 'Base della vela',
  crew: 'Equipaggio', hull: 'Scafo in carbonio', batt: 'Batterie', wfoil: 'Foil alzato',
  water: 'Pelo dell\'acqua', arm: 'Braccio del foil', wing: 'Ala del foil', rudder: 'Timone a T'
};

// Colori delle squadre (vernice, grafiche, sigla velica, divise)
const LIVERY = {
  lr: { hull: '#c4c8cd', metal: 0.55, rough: 0.3, a1: '#b8121f', a2: '#17191c', code: 'ITA', deck: '#2b2e33', vest: '#b8121f', helm: '#f2f2f2', suit: '#1b1e22', sail: '#1f2226', sa: '#c4141f', st: '#f4f4f4' },
  nz: { hull: '#0f1114', metal: 0.25, rough: 0.28, a1: '#e9ecef', a2: '#c8102e', code: 'NZL', deck: '#1f2226', vest: '#16191d', helm: '#ffffff', suit: '#0f1114', sail: '#1a1d21', sa: '#c8102e', st: '#f4f4f4' },
  gb: { hull: '#15253f', metal: 0.35, rough: 0.3, a1: '#c8a24a', a2: '#f2f2f2', code: 'GBR', deck: '#23272d', vest: '#15253f', helm: '#c8a24a', suit: '#10182a', sail: '#1c2026', sa: '#c8a24a', st: '#f4f4f4' },
  al: { hull: '#c61f2a', metal: 0.3, rough: 0.3, a1: '#f4f4f4', a2: '#14171b', code: 'SUI', deck: '#2a2c30', vest: '#c61f2a', helm: '#ffffff', suit: '#14171b', sail: '#1e2125', sa: '#c61f2a', st: '#f4f4f4' },
  fr: { hull: '#eceff2', metal: 0.1, rough: 0.28, a1: '#3d7be0', a2: '#0d2a66', code: 'FRA', deck: '#2a2e35', vest: '#3d7be0', helm: '#ffffff', suit: '#0d2a66', sail: '#1d2127', sa: '#3d7be0', st: '#f4f4f4' },
  us: { hull: '#eef0f3', metal: 0.1, rough: 0.28, a1: '#1c2f5a', a2: '#c8102e', code: 'USA', deck: '#2a2e35', vest: '#1c2f5a', helm: '#ffffff', suit: '#1c2f5a', sail: '#1d2127', sa: '#8fa8c8', st: '#f4f4f4' },
  au: { hull: '#0b5d3b', metal: 0.3, rough: 0.3, a1: '#ffcd00', a2: '#f4f4f4', code: 'AUS', deck: '#23272d', vest: '#0b5d3b', helm: '#ffcd00', suit: '#10261c', sail: '#1c2026', sa: '#ffcd00', st: '#f4f4f4' }
};

// Posizioni delle barche nel modo "confronto": in fila, alla stessa distanza dalla camera laterale
const FILA = { ac75: 0, ac40: -19.5 };

/* ---------- montaggio ---------- */
export function mount(stage, opts = {}) {
  const qp = new URLSearchParams(location.search);
  const forced = qp.get('b3q');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let tier = ['high', 'mid', 'low'].includes(forced) ? forced : (coarse || Math.min(screen.width, screen.height) < 600 ? 'mid' : 'high');
  const dprFor = t => Math.min(window.devicePixelRatio || 1, t === 'high' ? 2 : t === 'mid' ? 1.5 : 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: qp.has('b3shot') });
  renderer.setPixelRatio(dprFor(tier));
  renderer.toneMapping = qp.get('b3tm') === 'aces' ? THREE.ACESFilmicToneMapping : qp.get('b3tm') === 'agx' ? THREE.AgXToneMapping : THREE.NeutralToneMapping;
  renderer.toneMappingExposure = +(qp.get('b3exp') || 0.62);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  if (!document.getElementById('b3-css')) { const st = document.createElement('style'); st.id = 'b3-css'; st.textContent = CSS; document.head.appendChild(st); }
  const cv = renderer.domElement;
  cv.className = 'b3-canvas';
  cv.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '';
  stage.appendChild(cv);
  const ui = document.createElement('div');
  ui.className = 'b3-ui';
  ui.innerHTML = `<div class="b3-vig"></div><div class="b3-label" hidden><i></i><span></span></div>
    <div class="b3-hint">Trascina in ogni direzione per girare · due dita per ingrandire</div>
    <div class="b3-ctrl"><button type="button" data-b3="l" aria-label="Ruota a sinistra">⟲</button><button type="button" data-b3="r" aria-label="Ruota a destra">⟳</button><button type="button" data-b3="su" aria-label="Guarda più dall'alto">↑</button><button type="button" data-b3="giu" aria-label="Guarda più dal basso">↓</button><button type="button" data-b3="in" aria-label="Avvicina">+</button><button type="button" data-b3="out" aria-label="Allontana">−</button><button type="button" data-b3="spin" aria-label="Giro completo">360°</button></div>`;
  stage.appendChild(ui);
  const label = ui.querySelector('.b3-label');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 9000);

  /* ----- cielo, nuvole, costa: primo pomeriggio sul golfo ----- */
  const sunDir = new THREE.Vector3().setFromSphericalCoords(1, rad(60), rad(-20));
  const sky = new Sky(); sky.scale.setScalar(7000);
  const su = sky.material.uniforms;
  su.turbidity.value = 2.4; su.rayleigh.value = 1.5; su.mieCoefficient.value = 0.003; su.mieDirectionalG.value = 0.82;
  su.sunPosition.value.copy(sunDir);
  scene.add(sky);
  const cloudMat = new THREE.ShaderMaterial({ vertexShader: cloudVS, fragmentShader: cloudFS, transparent: true, depthWrite: false, side: THREE.BackSide,
    uniforms: { uSun: { value: sunDir }, uTime: { value: 0 }, uBright: { value: 0.9 } } });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(3200, 48, 24), cloudMat);
  clouds.renderOrder = -1; scene.add(clouds);

  // ambiente per i riflessi: stesso cielo, nuvole e un emisfero di mare sotto l'orizzonte
  const envScene = new THREE.Scene();
  const sky2 = new Sky(); sky2.scale.setScalar(7000);
  Object.keys(su).forEach(k => { if (sky2.material.uniforms[k]) sky2.material.uniforms[k].value = su[k].value; });
  envScene.add(sky2, new THREE.Mesh(clouds.geometry, cloudMat));
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16, 0, Math.PI * 2, Math.PI / 2 + 0.01, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0b3346, side: THREE.BackSide })));
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  new THREE.CubeCamera(1, 9000, cubeRT).update(renderer, envScene);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = 0.9;

  const land = new THREE.Mesh(new THREE.CylinderGeometry(2600, 2600, 320, 256, 1, true).translate(0, 155, 0), new THREE.ShaderMaterial({
    vertexShader: landVS, fragmentShader: landFS, side: THREE.BackSide, uniforms: { uEnv: { value: cubeRT.texture }, uSun: { value: sunDir } } }));
  scene.add(land);

  const sunLight = new THREE.DirectionalLight(0xfff0dc, 3.1);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.bias = -0.0002; sunLight.shadow.normalBias = 0.025;
  scene.add(sunLight, sunLight.target);
  scene.add(new THREE.HemisphereLight(0xcfe3f2, 0x0d3a4a, 0.25));
  // la luce e l'ombra seguono la grandezza della scena
  function luce(cx, cy, r) {
    Object.assign(sunLight.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: r * 10 });
    sunLight.shadow.camera.updateProjectionMatrix();
    sunLight.position.copy(sunDir).multiplyScalar(r * 4.7).add(V3(cx, cy, 0));
    sunLight.target.position.set(cx, cy, 0);
    sunLight.target.updateMatrixWorld();
  }

  /* ----- mare ----- */
  const UW_H = new THREE.Color().setRGB(0.012, 0.1, 0.14, THREE.LinearSRGBColorSpace);
  const wPos = [0, 0, 0], wIdx = [], SEG = 220, RINGS = 135;
  for (let r = 1; r <= RINGS; r++) { const R = 3.2 * (Math.exp(0.0555 * r) - 1); for (let s = 0; s < SEG; s++) { const a = s / SEG * Math.PI * 2; wPos.push(Math.cos(a) * R, 0, Math.sin(a) * R); } }
  for (let s = 0; s < SEG; s++) wIdx.push(0, 1 + (s + 1) % SEG, 1 + s);
  for (let r = 1; r < RINGS; r++) for (let s = 0; s < SEG; s++) { const a = 1 + (r - 1) * SEG + s, b = 1 + (r - 1) * SEG + (s + 1) % SEG; wIdx.push(a, b, a + SEG, b, b + SEG, a + SEG); }
  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
  wGeo.setAttribute('normal', new THREE.Float32BufferAttribute(wPos.map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  wGeo.setIndex(wIdx);
  const waves = [[0.2, -0.98, 15, 0.13], [-0.55, -0.83, 9.5, 0.075], [0.7, -0.71, 6.2, 0.05], [-0.2, -0.98, 3.9, 0.028], [0.45, -0.89, 2.6, 0.016]]
    .map(([x, z, l, a]) => { const d = new THREE.Vector2(x, z).normalize(); return new THREE.Vector4(d.x, d.y, l, a); });
  const reflRT = new THREE.WebGLRenderTarget(512, 512, { type: THREE.HalfFloatType });
  const WU = THREE.UniformsUtils.merge([THREE.UniformsLib.lights, {
    uTime: { value: 0 }, uFlow: { value: new THREE.Vector2(11, 0) }, uReflMat: { value: new THREE.Matrix4() }, uWaves: { value: waves },
    uSun: { value: sunDir.clone() }, uSunCol: { value: new THREE.Color(1, 0.93, 0.82) }, uEnv: { value: null }, uRefl: { value: null }, uUseRefl: { value: 0 },
    uNrm: { value: null }, uDeep: { value: new THREE.Color(0x05304c) }, uShallow: { value: new THREE.Color(0x12708c) },
    uFoamP: { value: new THREE.Vector4() }, uFoamK: { value: new THREE.Vector2(1, 1) }, uUwH: { value: new THREE.Color() }
  }]);
  const water = new THREE.Mesh(wGeo, new THREE.ShaderMaterial({ uniforms: WU, vertexShader: waterVS, fragmentShader: waterFS, lights: true, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  WU.uUwH.value = UW_H; WU.uEnv.value = cubeRT.texture; WU.uRefl.value = reflRT.texture; WU.uNrm.value = waterNormals(); WU.uWaves.value = waves;
  water.receiveShadow = true; water.renderOrder = 2; water.frustumCulled = false;
  scene.add(water);
  const abyss = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshBasicMaterial({ color: 0x031a28 }));
  abyss.rotation.x = -Math.PI / 2; abyss.position.y = -30; scene.add(abyss);
  const deep = new THREE.Mesh(new THREE.SphereGeometry(420, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uH: { value: UW_H }, uTime: { value: 0 }, uSun: { value: sunDir } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uH; uniform float uTime; uniform vec3 uSun; varying vec3 vP;
${NOISE}
void main(){ float y = vP.y;
  vec3 c = y > 0.0 ? mix(uH, vec3(0.05, 0.36, 0.44), smoothstep(0.0, 0.9, y)) : mix(uH, vec3(0.001, 0.012, 0.02), smoothstep(0.0, -0.8, y));
  float az = atan(vP.z, vP.x);
  float shafts = smoothstep(0.35, 0.95, fbm(vec2(az * 9.0 + uTime * 0.04, 1.3))) * smoothstep(-0.35, 0.25, y) * (1.0 - smoothstep(0.55, 0.95, y));
  c += vec3(0.06, 0.2, 0.22) * shafts * (0.6 + 0.4 * max(uSun.y, 0.0));
  c += vec3(0.25, 0.4, 0.4) * pow(max(dot(vP, normalize(vec3(uSun.x * 0.6, 1.0, uSun.z * 0.6))), 0.0), 24.0);
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}` }));
  deep.visible = false; deep.renderOrder = -1; scene.add(deep);

  /* ----- materiali ----- */
  const carbon = carbonTex(); carbon.repeat.set(3, 3);
  const grit = noiseTex(5, 90, 170); grit.repeat.set(6, 6);
  const mk = {
    paint: () => new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.05 }),
    deck: () => new THREE.MeshStandardMaterial({ roughness: 0.92, bumpMap: grit, bumpScale: 1.2, roughnessMap: grit }),
    pit: () => new THREE.MeshStandardMaterial({ color: 0x3a4048, map: carbon, roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide }),
    trim: () => new THREE.MeshStandardMaterial({ color: 0x101215, roughness: 0.45 }),
    carbon: () => new THREE.MeshPhysicalMaterial({ color: 0xc8ccd2, map: carbon, roughness: 0.36, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 }),
    foil: () => new THREE.MeshPhysicalMaterial({ color: 0x14171b, roughness: 0.22, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }),
    flap: () => new THREE.MeshPhysicalMaterial({ color: 0x2c333b, roughness: 0.28, metalness: 0.25, clearcoat: 0.8 }),
    steel: () => new THREE.MeshStandardMaterial({ color: 0xc3c9d0, roughness: 0.22, metalness: 1 }),
    rig: () => new THREE.MeshStandardMaterial({ color: 0x0b0d0f, roughness: 0.4 }),
    sail: () => new THREE.MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(0x9aa3ad), side: THREE.DoubleSide }),
    jib: () => new THREE.MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(0x9aa3ad) }),
    batten: () => new THREE.MeshStandardMaterial({ color: 0x4a525c, roughness: 0.45 }),
    vest: () => new THREE.MeshPhysicalMaterial({ roughness: 0.72, sheen: 0.12, sheenColor: new THREE.Color(0xffffff) }),
    guest: () => new THREE.MeshPhysicalMaterial({ color: 0xd9dee3, roughness: 0.7, sheen: 0.12, sheenColor: new THREE.Color(0xffffff) }),
    suit: () => new THREE.MeshStandardMaterial({ roughness: 0.8 }),
    helm: () => new THREE.MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    visor: () => new THREE.MeshPhysicalMaterial({ color: 0x07090c, roughness: 0.04, metalness: 0.9 }),
    skin: () => new THREE.MeshStandardMaterial({ color: 0xb98465, roughness: 0.6 }),
    glove: () => new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.75 }),
    screen: () => new THREE.MeshStandardMaterial({ color: 0x050709, emissive: 0x2a6f8a, emissiveIntensity: 0.9, roughness: 0.2 }),
    batt: () => new THREE.MeshStandardMaterial({ color: 0x1d3a48, roughness: 0.4, metalness: 0.5, emissive: 0x0a2530 }),
    hv: () => new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.45, emissive: 0x3a1500 })
  };

  /* ----- patch dei materiali: tinta sott'acqua e luce che attraversa le vele ----- */
  const U_TIME = { value: 0 }, U_ABOVE = { value: 1 }, U_WATER = { value: new THREE.Color(0x0b4a60) }, U_SUNV = { value: V3() }, U_SUNC = { value: new THREE.Color(1, 0.94, 0.85).multiplyScalar(1.4) };
  const U_FLOW = { value: 11 };
  function patch(mat, trans) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uAbove: U_ABOVE, uWaterC: U_WATER, uSunV: U_SUNV, uSunC: U_SUNC, uT: U_TIME, uFl: U_FLOW });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; uniform float uAbove; uniform vec3 uWaterC; uniform vec3 uSunV; uniform vec3 uSunC; uniform float uT; uniform float uFl;')
        .replace('#include <opaque_fragment>', (trans ? `outgoingLight += diffuseColor.rgb * uSunC * max(dot(-normal, uSunV), 0.0) * ${trans.toFixed(2)};\n` : '') +
          'if (vWp.y < 0.0) { vec2 cp = vWp.xz * 2.2 + vec2(uT * uFl * 2.2, 0.0); float c1 = sin(cp.x + sin(cp.y * 1.3 + uT * 1.7)) + sin(cp.y * 1.1 + sin(cp.x * 0.9 - uT * 1.3)); float ca = pow(max(0.0, 1.0 - abs(c1) * 0.6), 5.0) * exp(vWp.y * 0.6); outgoingLight += diffuseColor.rgb * uSunC * ca * 0.9 + vec3(0.0, 0.03, 0.04) * ca; }\n' +
          '#include <opaque_fragment>\nif (uAbove > 0.5 && vWp.y < 0.0) { gl_FragColor.rgb = mix(gl_FragColor.rgb * vec3(0.5, 0.78, 0.85), uWaterC, 1.0 - exp(vWp.y * 0.8)); }');
    };
    mat.customProgramCacheKey = () => 'b3' + trans;
  }

  const HEEL = WIND * rad(2.5), PITCH = rad(0.5);

  /* ----- costruzione di una barca ----- */
  function costruisci(nome, dx = 0) {
    const M = classe(nome), C = M.C, HW = C.HW, FO = C.FOIL, RU = C.RUD;
    const { L, MAST_H, DECK, HB, xu, deckY, PITS, PW, PIT_D, MX, MBASE, MDIR, MLEE, mChord, mThick, mastAt, MAIN_CMAX, mainChord, mainPoint, STAY_TOP, JCLEW, JIB_CMAX, jibChord, jibPoint, ARM, PIV_X, PIV_Y, PIV_Z, CANT, RAISE, RX, RUD_BOT } = M;
    const k75 = L / 11.8; // scala delle parti che crescono con la barca (non le persone)
    const US = M.hullStations(), rings = US.map(M.sectionRing);
    const girthAt = u => M.girth(M.sectionRing(u));
    const boat = new THREE.Group(); scene.add(boat);
    const add = (id, geo, key, parent = boat) => {
      const m = new THREE.Mesh(geo, mk[key]()); m.userData.mk = key; m.userData.part = id;
      m.castShadow = true; m.receiveShadow = true; parent.add(m);
      return m;
    };

    // scafo, specchio di poppa, coperta, pozzetti
    const glass = (m, shell) => { m.userData.glassy = shell ? 2 : 1; return m; };
    glass(add('hull', M.hullGeometry(US, rings), 'paint'), true);
    glass(add('hull', M.capGeometry(US[0], rings[0], [0.003, 0.997], V3(-1, 0, 0)), 'paint'), true);
    glass(add('hull', M.capGeometry(US[US.length - 1], rings[rings.length - 1], [0.003, 0.997], V3(1, 0, 0)), 'paint'), true);
    glass(add('deck', M.deckGeometry(US), 'deck'));
    glass(add('deck', M.pitGeometry(US), 'pit'));
    for (const s of [1, -1]) for (const [x0, x1] of PITS) glass(add('deck', M.coamingGeometry(s, x0, x1), 'trim'));
    // dorsale centrale che porta i rinvii dei comandi
    {
      const sh = new THREE.Shape(); const w = 0.17 * Math.sqrt(k75), h = 0.11 * Math.sqrt(k75), r = 0.05;
      sh.moveTo(-w, 0); sh.lineTo(-w, h - r); sh.quadraticCurveTo(-w, h, -w + r, h); sh.lineTo(w - r, h); sh.quadraticCurveTo(w, h, w, h - r); sh.lineTo(w, 0); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: HW.spine[0], bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.02, bevelSegments: 4, curveSegments: 6 });
      g.rotateY(-Math.PI / 2); g.translate(MX - 0.4, deckY(xu(HW.spine[1]), 0) - 0.03, 0);
      glass(add('deck', g, 'trim'));
    }
    // prese di coperta e boccaporti
    for (const [x, z] of HW.hatches) {
      const g = new THREE.CylinderGeometry(0.17 * k75 ** 0.5, 0.18 * k75 ** 0.5, 0.03, 28); g.translate(x, deckY(xu(x), 0) + 0.01, z);
      glass(add('deck', g, 'trim'));
    }
    // cupola della telecamera di prua
    { const g = new THREE.SphereGeometry(0.11 * k75 ** 0.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2); g.translate(HW.dome, deckY(xu(HW.dome), 0), 0); glass(add('hull', g, 'visor')); }
    // binario del fiocco autovirante
    {
      const [tx, tz] = HW.track, pts = [];
      for (let i = 0; i <= 12; i++) { const z = lerp(-tz, tz, i / 12), x = tx + 0.06 * k75 * (1 - (z / tz) ** 2); pts.push(V3(x, deckY(xu(x), Math.abs(z) / HB(xu(x))) + 0.02, z)); }
      add('jib', tube(pts, 0.022, false, 40, 6), 'steel');
      const car = new THREE.BoxGeometry(0.16, 0.06, 0.1); car.translate(JCLEW.x, deckY(xu(JCLEW.x), 0.18) + 0.05, JCLEW.z);
      add('jib', car, 'rig');
    }

    // pacco batterie e linee idrauliche (visibili solo in trasparenza)
    const battGroup = new THREE.Group(); boat.add(battGroup);
    {
      const [bx, by, lx, ly, lz] = HW.batt;
      const g = new THREE.BoxGeometry(lx, ly, lz); g.translate(bx, by, 0); add('batt', g, 'batt', battGroup);
      const n = Math.round(lx / 0.25);
      for (let i = 0; i < n; i++) for (const z of [-lz / 4, lz / 4]) { const c = new THREE.BoxGeometry(0.2, 0.05, 0.3); c.translate(bx - lx / 2 + 0.13 + i * 0.25, by + ly / 2 + 0.02, z); add('batt', c, 'screen', battGroup); }
      for (const s of [1, -1]) add('batt', tube([V3(bx + 0.05, by + 0.1, s * lz / 2), V3(bx + 0.35, by + 0.12, s * (lz / 2 + 0.44)), V3(PIV_X, PIV_Y, s * (PIV_Z - 0.25))], 0.025, false, 24, 6), 'hv', battGroup);
      add('batt', tube([V3(bx - lx / 2 + 0.05, by + 0.1, 0), V3(lerp(bx, HW.aft, 0.5), by + 0.22, 0), V3(HW.aft, by + 0.42, 0)], 0.022, false, 24, 6), 'hv', battGroup);
    }
    battGroup.visible = false;

    // albero alare a sezione D, con leggera flessione in testa
    {
      const st = [];
      for (let i = 0; i <= 44; i++) { const h = MAST_H * i / 44; st.push({ p: mastAt(h), c: MDIR.clone().negate(), t: MLEE, chord: mChord(h), thick: mThick(h), x0: 0.36 }); }
      add('main', loft(st, 0, s => dRing(s)), 'carbon');
      const km = C.MC[0] / 0.46;
      const base = new THREE.CylinderGeometry(0.2 * km, 0.26 * km, 0.12, 28); base.translate(MX, MBASE.y + 0.05, 0);
      add('main', base, 'rig');
      // testa d'albero: cappello, luce e antenna del vento
      const top = mastAt(MAST_H);
      const cap = new THREE.SphereGeometry(0.07 * km, 14, 10); cap.translate(top.x, top.y, top.z); add('top', cap, 'rig');
      add('top', rod(top, top.clone().add(V3(0.95, 0.12, 0)), 0.008), 'rig');
      const vane = new THREE.BoxGeometry(0.16, 0.12, 0.004); vane.translate(top.x + 0.95, top.y + 0.16, 0); add('top', vane, 'rig');
      add('top', rod(top, top.clone().add(V3(0, 0.7, 0)), 0.006), 'rig');
      // telecamera sull'albero, rivolta verso poppa
      const camG = new THREE.BoxGeometry(0.14, 0.1, 0.1); const cp = mastAt(HW.mastCam).addScaledVector(MDIR, -0.26 * km); camG.translate(cp.x, cp.y, cp.z); add('main', camG, 'rig');
    }
    // sartie e strallo
    add('jib', rod(V3(C.STAY_X, deckY(xu(C.STAY_X), 0) + 0.02, 0), STAY_TOP.clone(), 0.011 * k75 ** 0.5), 'rig');
    for (const s of [1, -1]) {
      const hi = mastAt(C.SHROUD_H).addScaledVector(MLEE, -s * WIND * 0.07);
      const x = MX - C.SHROUD_X, lo = V3(x, deckY(xu(x), 0.86) + 0.02, s * 0.86 * HB(xu(x)));
      add('main', rod(hi, lo, 0.008 * k75 ** 0.5), 'rig');
      const cp = new THREE.CylinderGeometry(0.03, 0.04, 0.05, 12); cp.translate(lo.x, lo.y, lo.z); add('main', cp, 'steel');
    }

    // randa a doppia pelle: due teli che avvolgono l'albero e si chiudono sulla balumina
    {
      const rows = nome === 'ac75' ? 56 : 48, cols = 26, p = V3();
      for (const skin of [-1, 1]) {
        const luffLeft = skin > 0; // la faccia sottovento si guarda da −Z: l'inferitura (verso prua) è a sinistra
        const g = sailGrid(rows, cols, (s, t, o) => mainPoint(s, t, skin, o), (s, t) => { const u = s * mainChord(t) / MAIN_CMAX; return [luffLeft ? u : 1 - u, t]; });
        faceTo(g, V3(0, 0, -skin * WIND));
        add('main', g, 'sail').userData.luffLeft = luffLeft;
      }
      // chiusure di base e di testa tra i due teli
      for (const t of [0, 1]) {
        const pos = [], idx = [];
        for (let c = 0; c <= cols; c++) { const s = Math.pow(c / cols, 1.2); mainPoint(s, t, -1, p); pos.push(p.x, p.y, p.z); mainPoint(s, t, 1, p); pos.push(p.x, p.y, p.z); }
        for (let c = 0; c < cols; c++) { const a = c * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        const m = add(t ? 'top' : 'deck', geom(pos, idx), 'rig'); m.material.side = THREE.DoubleSide;
      }
      // stecche visibili sotto la membrana
      const nl = V3(), nb = nome === 'ac75' ? 10 : 8;
      for (let k = 1; k < nb; k++) for (const skin of [-1, 1]) {
        const t = k / nb, pts = [];
        for (let i = 0; i <= 14; i++) { const s = 0.03 + 0.94 * i / 14; mainPoint(s, t, skin, p, nl); pts.push(p.clone().addScaledVector(nl, skin * 0.007)); }
        add('main', tube(pts, 0.011 * k75 ** 0.5, false, 40, 5), 'batten');
      }
      // tavoletta di penna in carbonio
      const hp = [];
      for (let i = 0; i <= 10; i++) { mainPoint(0.02 + 0.93 * i / 10, 1, 0, p); hp.push(p.clone().add(V3(0, 0.04, 0))); }
      add('top', tube(hp, 0.045 * k75 ** 0.5, false, 30, 8), 'carbon');
    }
    // fiocco: due facce (una per lato) perché grafiche e scritte si leggano bene da entrambe le parti
    for (const face of [-1, 1]) {
      const luffLeft = face < 0;
      const g = sailGrid(36, 18, jibPoint, (s, t) => { const u = s * jibChord(t) / JIB_CMAX; return [luffLeft ? u : 1 - u, t]; });
      faceTo(g, V3(0, 0, face * WIND));
      add('jib', g, 'jib').userData.luffLeft = luffLeft;
    }
    { const pts = []; const p = V3(); for (let i = 0; i <= 20; i++) { jibPoint(0, i / 20, p); pts.push(p.clone()); } add('jib', tube(pts, 0.02 * k75 ** 0.5, false, 30, 6), 'rig'); }

    // equipaggio: timonieri a poppa, regolatori davanti; sull'AC75 anche l'ospite
    const sailors = [];
    function sailor(x, z, s, ruolo) {
      const g = new THREE.Group(); boat.add(g);
      const u = xu(x), floor = deckY(u, 0.62) - PIT_D;
      g.position.set(x, floor + 0.12 + (PIT_D - 0.62), z); g.rotation.y = -s * 0.12;
      const P = (a, b, c) => V3(a, b, c * s);
      const helm = ruolo === 'helm', ospite = ruolo === 'guest', vest = ospite ? 'guest' : 'vest';
      add('crew', limb(P(-0.08, 0.05, -0.1), P(0.15, 0.36, -0.1), 0.085), 'suit', g);
      add('crew', limb(P(-0.08, 0.05, 0.1), P(0.15, 0.36, 0.1), 0.085), 'suit', g);
      add('crew', limb(P(0.02, 0.34, 0), P(0.1, 0.72, 0), 0.155), vest, g).scale.set(1, 1, 1.12);
      add('crew', limb(P(0.1, 0.8, 0), P(0.12, 0.88, 0), 0.05), 'skin', g);
      const head = new THREE.SphereGeometry(0.1, 20, 14); head.scale(1.05, 1.12, 0.95); head.translate(0.14, 0.95, 0); add('crew', head, 'skin', g);
      const hel = new THREE.SphereGeometry(0.122, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5); hel.scale(1.08, 1, 1); hel.translate(0.125, 0.985, 0); add('crew', hel, 'helm', g);
      const rim = new THREE.TorusGeometry(0.122, 0.012, 6, 30); rim.rotateX(Math.PI / 2); rim.scale(1.08, 1, 1); rim.translate(0.125, 0.985, 0); add('crew', rim, 'helm', g);
      const vis = new THREE.SphereGeometry(0.106, 20, 8, -0.95, 1.9, 1.3, 0.3); vis.rotateY(Math.PI); vis.scale(1.05, 1.12, 0.95); vis.translate(0.14, 0.95, 0); add('crew', vis, 'visor', g);
      const hands = helm ? [P(0.5, 0.66, -0.16), P(0.5, 0.66, 0.16)] : ospite ? [P(0.28, 0.4, -0.14), P(0.28, 0.4, 0.14)] : [P(0.42, 0.5, -0.13), P(0.42, 0.5, 0.13)];
      for (const [k, hnd] of hands.entries()) {
        const sh = P(0.1, 0.74, k ? 0.2 : -0.2), el = sh.clone().lerp(hnd, 0.5).add(V3(-0.02, -0.12, 0));
        add('crew', limb(sh, el, 0.052), vest, g);
        add('crew', limb(el, hnd, 0.045), 'suit', g);
        const gl = new THREE.SphereGeometry(0.045, 10, 8); gl.translate(hnd.x, hnd.y, hnd.z); add('crew', gl, 'glove', g);
      }
      if (helm) {
        const wh = new THREE.TorusGeometry(0.2, 0.016, 8, 36); wh.rotateY(Math.PI / 2); wh.translate(0.52, 0.64, 0); add('crew', wh, 'rig', g);
        for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, e = V3(0.52, 0.64 + Math.sin(a) * 0.19, Math.cos(a) * 0.19); add('crew', rod(V3(0.52, 0.64, 0), e, 0.008), 'rig', g); }
        const hub = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16); hub.rotateZ(Math.PI / 2); hub.translate(0.5, 0.64, 0); add('crew', hub, 'screen', g);
        add('crew', rod(V3(0.54, 0.64, 0), V3(0.62, 0.3, 0), 0.03), 'rig', g);
      } else if (ospite) {
        // sedile monotipo con poggiatesta: l'ospite non tocca comandi
        const back = new THREE.BoxGeometry(0.08, 0.62, 0.42); back.translate(-0.16, 0.5, 0); add('crew', back, 'rig', g);
        const rest = new THREE.BoxGeometry(0.1, 0.22, 0.26); rest.translate(-0.08, 1.02, 0); add('crew', rest, 'rig', g);
      } else {
        const con = new THREE.BoxGeometry(0.14, 0.34, 0.36); con.translate(0.58, 0.36, 0); add('crew', con, 'rig', g);
        const scr = new THREE.BoxGeometry(0.01, 0.12, 0.2); scr.translate(0.505, 0.44, 0); add('crew', scr, 'screen', g);
        for (const k of [-1, 1]) { const j = new THREE.CylinderGeometry(0.018, 0.022, 0.1, 10); j.translate(0.48, 0.52, 0.13 * k * s); add('crew', j, 'rig', g); }
      }
      sailors.push(g);
    }
    for (const [s, lista] of [[1, C.CREW], [-1, C.CREW_LEE]]) for (const [i, f, ruolo] of lista) {
      const x = lerp(PITS[i][0], PITS[i][1], f) - 0.12;
      sailor(x, s * lerp(PW[0], PW[1], 0.52) * HB(xu(x)), s, ruolo);
    }

    // foil: braccio (curvo sull'AC75), siluro, ala a T con flap
    const foils = {};
    const bend = t => FO.bend[0] * Math.sin(Math.PI * t) + FO.bend[1] * t * t;
    function foilAssembly(side, down) {
      const g = new THREE.Group(); g.position.set(PIV_X, PIV_Y, side * PIV_Z);
      g.rotation.x = side > 0 ? (down ? -CANT : -(Math.PI / 2 + RAISE)) : (down ? CANT : Math.PI / 2 + RAISE);
      boat.add(g);
      const armId = down ? 'arm' : 'wfoil', wingId = down ? 'wing' : 'wfoil';
      // nel gruppo, verso l'esterno della barca è -side lungo Z
      const out = -side;
      const st = [];
      for (let i = 0; i <= 18; i++) { const t = i / 18; st.push({ p: V3(0, -t * (ARM - 0.02), out * bend(t)), c: V3(1, 0, 0), t: V3(0, 0, side), chord: lerp(FO.arm[0], FO.arm[1], t), thick: lerp(FO.armT[0], FO.armT[1], t), x0: 0.42 }); }
      add(armId, loft(st, 22), 'foil', g);
      const hub = new THREE.CylinderGeometry(FO.hubR, FO.hubR, FO.hubL, 28); hub.rotateZ(Math.PI / 2); add(armId, hub, 'foil', g);
      for (const e of [-1, 1]) { const c = new THREE.SphereGeometry(FO.hubR, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); c.rotateZ(-e * Math.PI / 2); c.translate(e * (FO.hubL / 2), 0, 0); add(armId, c, 'foil', g); }
      // ala e siluro, costruiti attorno alla fine del braccio e inclinati di "tilt" (punta esterna più in basso)
      const wg = new THREE.Group(); wg.position.set(0, -ARM, out * bend(1)); wg.rotation.x = side * rad(FO.tilt); g.add(wg);
      const prof = [], bl = FO.bulbL, br = FO.bulb;
      for (let i = 0; i <= 30; i++) { const y = lerp(-0.516 * bl, 0.484 * bl, i / 30); let r; if (y > 0.274 * bl) r = br * Math.sqrt(Math.max(0, 1 - ((y - 0.274 * bl) / (0.21 * bl)) ** 2)); else if (y > -0.097 * bl) r = br; else r = lerp(0.02 * br / 0.115, br, Math.pow((y + 0.516 * bl) / (0.419 * bl), 0.7)); prof.push(new THREE.Vector2(Math.max(r, 0.0001), y)); }
      const bulb = new THREE.LatheGeometry(prof, 28); bulb.rotateZ(-Math.PI / 2); bulb.translate(0.04, 0, 0);
      add(wingId, bulb, 'foil', wg);
      // ala principale (74% della corda) e flap (28%)
      const SPAN = FO.span, ANH = rad(FO.anh), Y0 = -0.03;
      add(wingId, loft(wingStations(SPAN, FO.root, FO.tip, FO.thick, Y0, ANH, FO.sweep, 0.4, 0.74), 18), 'foil', wg);
      for (const e of [-1, 1]) for (const [q0, q1, def] of [[0.1, 0.52, 6], [0.56, 0.86, 3]]) {
        const fs = [];
        for (let i = 0; i <= 6; i++) {
          const q = lerp(q0, q1, i / 6), a = q, c = lerp(FO.root, FO.tip, a);
          const p = V3(-FO.sweep * a * a - 0.43 * c, Y0 - a * SPAN / 2 * Math.tan(ANH), e * q * SPAN / 2);
          const d = rad(def), cd = V3(Math.cos(d), Math.sin(d), 0), td = V3(-Math.sin(d), Math.cos(d), 0);
          fs.push({ p, c: cd, t: td, chord: 0.28 * c, thick: 0.1, x0: 0 });
        }
        add(wingId, loft(fs, 12), 'flap', wg);
      }
      foils[down ? 'down' : 'up'] = g;
      g.userData.wing = wg;
      return g;
    }
    foilAssembly(-WIND, true);
    foilAssembly(WIND, false);
    // carenature dei perni dei foil sullo scafo
    for (const s of [1, -1]) { const f = new THREE.SphereGeometry(FO.fair, 24, 14); f.scale(2.4, 0.9, 0.55); f.translate(PIV_X, PIV_Y + 0.02, s * (PIV_Z - 0.12 * FO.fair / 0.28)); add('hull', f, 'paint'); }

    // timone a T appeso allo specchio di poppa
    {
      const st = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14; st.push({ p: V3(RX - 0.05 * t, lerp(0.05, RUD_BOT, t), 0), c: V3(1, 0, 0), t: V3(0, 0, 1), chord: lerp(RU.chord[0], RU.chord[1], t), thick: RU.thick, x0: 0.35 }); }
      add('rudder', loft(st, 20), 'foil');
      const el = wingStations(RU.span, RU.root, RU.tip, 0.11, RUD_BOT - 0.02, 0, 0.03, 0.4, 1, 20); el.forEach(s => s.p.x += RX - 0.02);
      add('rudder', loft(el, 16), 'foil');
      const pod = new THREE.CapsuleGeometry(0.05 * k75 ** 0.5, 0.36 * k75 ** 0.5, 6, 12); pod.rotateZ(Math.PI / 2); pod.translate(RX - 0.04, RUD_BOT - 0.02, 0); add('rudder', pod, 'foil');
      const gantry = new THREE.BoxGeometry(0.34 * k75 ** 0.5, 0.78 * k75 ** 0.5, 0.26 * k75 ** 0.5); gantry.translate(RX + 0.02, -0.2 * k75, 0); add('rudder', gantry, 'foil');
      const pole = rod(V3(RX + 0.05, 0.18, 0), V3(RX + 0.05, 0.62, 0), 0.02); add('hull', pole, 'rig');
      const cam = new THREE.BoxGeometry(0.16, 0.11, 0.12); cam.translate(RX + 0.05, 0.68, 0); add('hull', cam, 'rig');
    }

    /* meno oggetti da disegnare: si uniscono i pezzi con stessa parte e stesso materiale */
    const mtx = new THREE.Matrix4();
    for (const g of sailors) {
      g.updateMatrix();
      for (const c of [...g.children]) { c.updateMatrix(); c.geometry.applyMatrix4(mtx.multiplyMatrices(g.matrix, c.matrix)); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.scale.set(1, 1, 1); boat.add(c); }
      boat.remove(g);
    }
    for (const f of [foils.down, foils.up]) {
      const wg = f.userData.wing; wg.updateMatrix();
      for (const c of [...wg.children]) { c.updateMatrix(); c.geometry.applyMatrix4(mtx.multiplyMatrices(wg.matrix, c.matrix)); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.scale.set(1, 1, 1); f.add(c); }
      f.remove(wg);
    }
    for (const root of [boat, foils.down, foils.up, battGroup]) {
      const bins = new Map();
      for (const c of root.children) {
        if (!c.isMesh) continue;
        const u = c.userData, key = [u.part, u.mk, c.material.side, u.glassy || 0, u.luffLeft].join('|');
        if (!bins.has(key)) bins.set(key, []);
        bins.get(key).push(c);
      }
      for (const list of bins.values()) {
        if (list.length < 2) continue;
        list.forEach(c => { c.updateMatrix(); c.geometry.applyMatrix4(c.matrix); });
        const m = new THREE.Mesh(mergeGeos(list.map(c => c.geometry)), list[0].material);
        Object.assign(m.userData, list[0].userData); m.castShadow = m.receiveShadow = true;
        list.forEach(c => { root.remove(c); c.material.dispose(); }); root.add(m);
      }
    }
    const parts = {}, glassy = [];
    boat.traverse(o => { if (!o.isMesh) return; const id = o.userData.part; if (id) (parts[id] = parts[id] || []).push(o); if (o.userData.glassy) glassy.push(o); });
    boat.traverse(o => { if (o.isMesh) { const old = o.material; o.material = old.clone(); old.dispose(); o.material.userData.baseEm = o.material.emissive ? o.material.emissive.clone() : null; patch(o.material, ['sail', 'jib'].includes(o.userData.mk) ? 0.55 : 0); } });

    // posizione di volo: sbandata sopravento e prua leggermente su
    boat.position.set(dx, DECK, 0);
    boat.rotation.set(HEEL, 0, PITCH);
    boat.updateMatrixWorld(true);

    // punti del mare toccati dal foil e dal timone (spruzzi e schiuma), punte dell'ala (bolle)
    const endArm = V3(0, -ARM, -(-WIND) * bend(1));
    const wtips = [];
    { const wg = new THREE.Object3D(); wg.position.set(0, -ARM, WIND * bend(1)); wg.rotation.x = -WIND * rad(FO.tilt); wg.updateMatrix();
      for (const e of [-1, 1]) wtips.push(V3(-FO.sweep - 0.15 * FO.root / 0.37, -0.03 - FO.span / 2 * Math.tan(rad(FO.anh)) - 0.07, e * FO.span / 2 * 0.97).applyMatrix4(wg.matrix)); }
    const src = [V3(), V3()];
    const pierce = (grp, a, b) => {
      const A = grp.localToWorld(a.clone()), B = grp.localToWorld(b.clone()); const t = A.y / (A.y - B.y);
      return A.lerp(B, clamp(t, 0, 1));
    };
    const updateSources = () => {
      boat.updateMatrixWorld(true);
      src[0].copy(pierce(foils.down, V3(0, 0, 0), endArm));
      src[1].copy(pierce(boat, V3(RX, 0.05, 0), V3(RX - 0.05, RUD_BOT, 0)));
    };
    updateSources();
    const bSrc = [...wtips, V3(-0.62 * FO.root / 0.37, -ARM, WIND * bend(1)), V3(-0.28, -ARM * 0.75, WIND * bend(0.75))];
    return { nome, M, C, boat, parts, glassy, foils, battGroup, src, updateSources, bSrc, girthAt, k75, dx, tex: [] };
  }

  function mergeGeos(list) {
    let nv = 0, ni = 0;
    list.forEach(g => { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni);
    let ov = 0, oi = 0;
    for (const g of list) {
      const c = g.attributes.position.count;
      pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, ov * 2);
      if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) idx[oi + i] = a[i] + ov; oi += a.length; }
      else { for (let i = 0; i < c; i++) idx[oi + i] = ov + i; oi += c; }
      ov += c; g.dispose();
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    m.setIndex(new THREE.BufferAttribute(idx, 1));
    return m;
  }
  function rimuovi(b) {
    b.tex.forEach(t => t.dispose());
    b.boat.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    scene.remove(b.boat);
  }

  /* ----- livree ----- */
  let curTeam = LIVERY[opts.team] ? opts.team : 'lr';
  function vesti(b, team) {
    const lv = LIVERY[team];
    b.tex.forEach(t => t.dispose());
    const q = tier === 'high' ? 1 : 0.5, L = b.M.L;
    const { MAIN_CMAX, mainChord, JIB_CMAX, jibChord } = b.M;
    const hullTex = hullTexture(lv, b.girthAt, false, q, L), hullMetal = hullTexture(lv, b.girthAt, true, q, L);
    const mainT = { true: sailTexture(600, 2048, MAIN_CMAX, mainChord, true, lv, true, q), false: sailTexture(600, 2048, MAIN_CMAX, mainChord, false, lv, true, q) };
    const jibT = { true: sailTexture(512, 1600, JIB_CMAX, jibChord, true, lv, false, q), false: sailTexture(512, 1600, JIB_CMAX, jibChord, false, lv, false, q) };
    b.tex = [hullTex, hullMetal, mainT.true, mainT.false, jibT.true, jibT.false];
    b.boat.traverse(o => {
      if (!o.isMesh) return; const m = o.material;
      switch (o.userData.mk) {
        case 'paint': m.map = hullTex; m.metalnessMap = hullMetal; m.metalness = 1; m.roughness = lv.rough; break;
        case 'deck': m.color.set(lv.deck); break;
        case 'sail': m.map = mainT[o.userData.luffLeft]; break;
        case 'jib': m.map = jibT[o.userData.luffLeft]; break;
        case 'vest': m.color.set(lv.vest); break;
        case 'suit': m.color.set(lv.suit); break;
        case 'helm': m.color.set(lv.helm); break;
        default: return;
      }
      m.needsUpdate = true;
    });
  }
  function livery(team) {
    if (!LIVERY[team]) team = 'lr';
    curTeam = team;
    flotta.forEach(b => vesti(b, team));
  }

  /* ----- spruzzi ----- */
  const NP = tier === 'low' ? 450 : 900;
  const pPos = new Float32Array(NP * 3), pVel = new Float32Array(NP * 3), pLife = new Float32Array(NP), pMax = new Float32Array(NP), pSize = new Float32Array(NP), pSrc = new Uint8Array(NP);
  const sprayG = new THREE.BufferGeometry();
  sprayG.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  sprayG.setAttribute('aLife', new THREE.BufferAttribute(new Float32Array(NP), 1));
  sprayG.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
  const sprayU = { uScale: { value: 400 }, uCol: { value: new THREE.Color(0.9, 0.95, 1.0).multiplyScalar(1.1) } };
  const spray = new THREE.Points(sprayG, new THREE.ShaderMaterial({ vertexShader: sprayVS, fragmentShader: sprayFS, uniforms: sprayU, transparent: true, depthWrite: false }));
  spray.renderOrder = 3; spray.frustumCulled = false; scene.add(spray);
  const respawn = i => {
    const b = flotta[i % flotta.length], s = (i >> 1) % 4 === 0 ? 1 : 0, o = b.src[s], k = b.k75 ** 0.5, fl = b.M.FLOW;
    pSrc[i] = s;
    pPos[i * 3] = o.x + (Math.random() - 0.5) * 0.25 * k; pPos[i * 3 + 1] = 0.03; pPos[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.2 * k;
    const up = (s ? 0.8 + Math.random() * 1.4 : 1.2 + Math.random() * 3.2) * k;
    pVel[i * 3] = -fl * (0.35 + Math.random() * 0.4); pVel[i * 3 + 1] = up; pVel[i * 3 + 2] = (Math.random() - 0.5) * (s ? 1.2 : 2.4) * k;
    pMax[i] = pLife[i] = 0.35 + Math.random() * 0.9;
    pSize[i] = ((Math.random() < 0.12 ? 0.32 : 0.07) + Math.random() * 0.12) * k;
  };

  /* ----- sott'acqua: bolle dalle estremità dell'ala e particelle in sospensione ----- */
  const NB = 480;
  const bPos = new Float32Array(NB * 3), bVel = new Float32Array(NB * 3), bLife = new Float32Array(NB), bMax = new Float32Array(NB).fill(1), bSize = new Float32Array(NB);
  const bubG = new THREE.BufferGeometry();
  bubG.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  bubG.setAttribute('aLife', new THREE.BufferAttribute(new Float32Array(NB), 1));
  bubG.setAttribute('aSize', new THREE.BufferAttribute(bSize, 1));
  const bubbles = new THREE.Points(bubG, new THREE.ShaderMaterial({ vertexShader: sprayVS, fragmentShader: sprayFS, transparent: true, depthWrite: false,
    uniforms: { uScale: sprayU.uScale, uCol: { value: new THREE.Color(0.8, 0.97, 1.0) } } }));
  bubbles.frustumCulled = false; bubbles.visible = false; scene.add(bubbles);
  const bRespawn = (i, near) => {
    const k = i % 6, R = Math.random, b = principale, fl = b.M.FLOW;
    if (k < 4) {
      const o = b.foils.down.localToWorld(b.bSrc[k].clone());
      if (o.y > -0.05) { bLife[i] = 0; return; }
      bPos[i * 3] = o.x + (R() - 0.5) * 0.06; bPos[i * 3 + 1] = o.y + (R() - 0.5) * 0.06; bPos[i * 3 + 2] = o.z + (R() - 0.5) * 0.06;
      bVel[i * 3] = -fl * (0.75 + R() * 0.2); bVel[i * 3 + 1] = 0.2 + R() * 0.3; bVel[i * 3 + 2] = (R() - 0.5) * 0.5;
      bMax[i] = bLife[i] = 0.4 + R() * 0.9; bSize[i] = 0.025 + R() * 0.045;
    } else {
      bPos[i * 3] = near.x + 8 + R() * 6; bPos[i * 3 + 1] = Math.min(near.y + (R() - 0.5) * 6, -0.15); bPos[i * 3 + 2] = near.z + (R() - 0.5) * 14;
      bVel[i * 3] = -fl; bVel[i * 3 + 1] = (R() - 0.5) * 0.1; bVel[i * 3 + 2] = 0;
      bMax[i] = bLife[i] = 1.2 + R() * 1.4; bSize[i] = 0.012 + R() * 0.02;
    }
  };

  /* ----- le barche in scena ----- */
  let flotta = [], principale = null, modo = null, VW = VIEWS.ac40;
  function metti(m) {
    if (!VIEWS[m]) m = 'ac75';
    flotta.forEach(rimuovi);
    flotta = m === 'confronto' ? [costruisci('ac75', FILA.ac75), costruisci('ac40', FILA.ac40)] : [costruisci(m)];
    principale = flotta[0];
    modo = m; VW = VIEWS[m];
    flotta.forEach(b => vesti(b, curTeam));
    U_FLOW.value = principale.M.FLOW; WU.uFlow.value.set(principale.M.FLOW, 0);
    WU.uFoamK.value.set(1, 1);
    if (m === 'confronto') luce(-8, 9, 26); else luce(0, principale.M.MAST_H * 0.34, principale.M.L * 1.27);
    for (let i = 0; i < NP; i++) { respawn(i); pLife[i] *= Math.random(); }
    for (let i = 0; i < NB; i++) bLife[i] = 0;
    activeIds = []; setLabel(null);
    goal = { ...VW[0] }; view.t.fromArray(goal.t); view.d = goal.d; view.el = goal.el; view.az = goal.az + userYaw;
    userZoom = 1; userPitch = 0;
    renderer.shadowMap.needsUpdate = true;
  }

  /* ----- evidenziazione ----- */
  let activeIds = [];
  const setActive = (id, rel = []) => {
    activeIds = id ? [id, ...rel] : [];
    const glass = activeIds.includes('batt');
    for (const b of flotta) {
      b.glassy.forEach(m => { const mt = m.material; mt.transparent = glass; mt.opacity = glass ? (m.userData.glassy === 2 ? 0.28 : 0.2) : 1; mt.depthWrite = !glass; mt.needsUpdate = true; m.castShadow = !glass; });
      b.battGroup.visible = glass;
    }
    renderer.shadowMap.needsUpdate = true;
  };
  const glowAll = k => {
    for (const b of flotta) Object.entries(b.parts).forEach(([id, arr]) => {
      const on = b === principale && activeIds.includes(id) && id !== 'water';
      arr.forEach(m => { const mt = m.material; if (!mt.emissive) return; if (on) mt.emissive.setRGB(0.02 * k, 0.17 * k, 0.16 * k); else if (mt.userData.baseEm) mt.emissive.copy(mt.userData.baseEm); });
    });
  };

  /* ----- riflesso planare del mare ----- */
  const mirrorCam = new THREE.PerspectiveCamera();
  const clipPlane = new THREE.Plane(), clipV = new THREE.Vector4(), qv = new THREE.Vector4(), fwd = V3(), tgt = V3();
  let reflOn = tier !== 'low', reflScale = tier === 'high' ? 0.5 : 0.35;
  function renderMirror() {
    const cp = camera.position;
    mirrorCam.position.set(cp.x, -cp.y, cp.z);
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion); tgt.copy(cp).add(fwd); tgt.y = -tgt.y;
    mirrorCam.up.set(0, 1, 0).applyQuaternion(camera.quaternion); mirrorCam.up.y = -mirrorCam.up.y;
    mirrorCam.lookAt(tgt); mirrorCam.far = camera.far; mirrorCam.updateMatrixWorld();
    mirrorCam.projectionMatrix.copy(camera.projectionMatrix);
    WU.uReflMat.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
    clipPlane.set(V3(0, 1, 0), 0).applyMatrix4(mirrorCam.matrixWorldInverse);
    clipV.set(clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant);
    const e = mirrorCam.projectionMatrix.elements;
    qv.set((Math.sign(clipV.x) + e[8]) / e[0], (Math.sign(clipV.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
    clipV.multiplyScalar(2 / clipV.dot(qv));
    e[2] = clipV.x; e[6] = clipV.y; e[10] = clipV.z + 1 - 0.003; e[14] = clipV.w;
    mirrorCam.projectionMatrixInverse.copy(mirrorCam.projectionMatrix).invert();
    water.visible = false; spray.visible = false; abyss.visible = false;
    renderer.setRenderTarget(reflRT); renderer.clear(); renderer.render(scene, mirrorCam); renderer.setRenderTarget(null);
    water.visible = true; spray.visible = true; abyss.visible = true;
    WU.uUseRefl.value = 1;
  }

  function applyTier() {
    renderer.setPixelRatio(dprFor(tier));
    reflOn = tier !== 'low'; reflScale = tier === 'high' ? 0.5 : 0.35;
    const ms = tier === 'high' ? 2048 : 1024;
    if (sunLight.shadow.mapSize.x !== ms) { sunLight.shadow.mapSize.set(ms, ms); if (sunLight.shadow.map) { sunLight.shadow.map.dispose(); sunLight.shadow.map = null; } }
    resize();
  }

  /* ----- camera: trascinare per ruotare (destra-sinistra e alto-basso), due dita, ctrl+rotella o +/− per avvicinare ----- */
  let portrait = false, userYaw = 0, userPitch = 0, userZoom = 1, spin = 0, dragging = false, lastX = 0, lastY = 0, idle = 0;
  // altezza dello sguardo in gradi: da poco sotto il pelo dell'acqua (si vedono i foil) a quasi dall'alto
  const EL_MIN = -20, EL_MAX = 80;
  const elevazione = () => clamp(goal.el + userPitch, EL_MIN, EL_MAX);
  const inclina = d => { userPitch = clamp(userPitch + d, EL_MIN - goal.el, EL_MAX - goal.el); };
  const view = { t: V3(0, 8, 0), d: 30, az: 35, el: 12 };
  let goal = { ...VIEWS.ac40[0] };
  const lerpA = (a, b, t) => { const d = ((b - a + 540) % 360) - 180; return a + d * t; };
  const setView = (i, t) => {
    const a = VW[Math.min(i, VW.length - 1)], b = VW[Math.min(i + 1, VW.length - 1)];
    goal = { t: a.t.map((v, k) => v + (b.t[k] - v) * t), d: Math.exp(Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * t), az: lerpA(a.az, b.az, t), el: a.el + (b.el - a.el) * t };
  };
  // punto dell'etichetta: centro della parte (senza i cavi delle batterie); con la camera sott'acqua, solo la parte immersa
  const anchorOf = id => {
    if (!principale) return null;
    if (id === 'water') return principale.src[0].clone();
    const arr = (principale.parts[id] || []).filter(m => m.userData.mk !== 'hv'); if (!arr.length) return null;
    const box = new THREE.Box3(); arr.forEach(m => box.expandByObject(m));
    if (goal.t[1] + goal.d * Math.sin(rad(goal.el)) < 0 && box.min.y < -0.1) box.max.y = Math.min(box.max.y, -0.05);
    return box.getCenter(V3());
  };
  let labelId = null, labelAt = null;
  const setLabel = id => { labelId = id; labelAt = id ? anchorOf(id) : null; label.hidden = !id || !labelAt; if (id) label.querySelector('span').textContent = LABELS[id] || ''; };

  // il dito sulla barca la gira in ogni direzione: la pagina si scorre toccando fuori dal riquadro
  cv.style.touchAction = 'none';
  const punti = new Map(); let pinch0 = 0, zoom0 = 1;
  const distanza = () => { const [a, b] = [...punti.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  cv.addEventListener('pointerdown', e => {
    punti.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punti.size === 2) { dragging = false; pinch0 = distanza(); zoom0 = userZoom; }
    else { dragging = true; lastX = e.clientX; lastY = e.clientY; }
    idle = 0; ui.classList.add('used');
  });
  window.addEventListener('pointermove', e => {
    if (!punti.has(e.pointerId)) return;
    punti.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punti.size === 2 && pinch0 > 0) { userZoom = clamp(zoom0 * pinch0 / Math.max(distanza(), 1), 0.45, 2.2); return; }
    if (dragging) { userYaw += (e.clientX - lastX) * 0.35; inclina((e.clientY - lastY) * 0.25); lastX = e.clientX; lastY = e.clientY; }
  });
  // rotella con ctrl (o pizzico sul touchpad): avvicina e allontana; la rotella da sola scorre la pagina
  cv.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    userZoom = clamp(userZoom * Math.exp(e.deltaY * 0.01), 0.45, 2.2);
    idle = 0; ui.classList.add('used');
  }, { passive: false });
  const end = e => { punti.delete(e.pointerId); if (punti.size < 2) pinch0 = 0; if (!punti.size) dragging = false; };
  window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-b3]'); if (!b) return; ui.classList.add('used');
    const k = b.dataset.b3;
    if (k === 'l') userYaw -= 45; else if (k === 'r') userYaw += 45; else if (k === 'su') inclina(15); else if (k === 'giu') inclina(-15);
    else if (k === 'in') userZoom = clamp(userZoom / 1.3, 0.45, 2.2); else if (k === 'out') userZoom = clamp(userZoom * 1.3, 0.45, 2.2); else spin = 360;
  });

  function resize() {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    portrait = w < h && innerWidth < 900; camera.fov = portrait ? 50 : w < h ? 46 : 40;
    if (portrait) camera.setViewOffset(w, h, 0, h * 0.2, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    const px = renderer.getPixelRatio();
    reflRT.setSize(Math.max(256, Math.round(w * px * reflScale)), Math.max(256, Math.round(h * px * reflScale)));
    sprayU.uScale.value = h * px / (2 * Math.tan(rad(camera.fov) / 2));
  }
  applyTier();
  addEventListener('resize', resize);
  metti(opts.classe || 'ac75');

  const underFog = new THREE.FogExp2(0xffffff, 0.05); underFog.color.copy(UW_H);
  const clock = new THREE.Clock();
  let running = false, raf = 0, tAcc = 0, fAcc = 0, fN = 0, fno = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tmp = V3(), goalT = V3();
  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const rdt = Math.min(clock.getDelta(), 0.3), dt = Math.min(rdt, 0.05); tAcc += dt; idle += rdt;
    // se il dispositivo arranca, si scende di qualità
    if (!forced && tier !== 'low' && tAcc > 3) { fAcc += rdt; if (++fN >= 90) { if (fAcc / fN > 0.045) { tier = tier === 'high' ? 'mid' : 'low'; applyTier(); } fAcc = 0; fN = 0; } }
    const k = 1 - Math.exp(-rdt * 4);
    if (spin > 0) { const s = Math.min(spin, dt * 120); spin -= s; userYaw += s; }
    if (goal.d > principale.M.L * 1.7 && !dragging && idle > 2 && !reduce && modo !== 'confronto') userYaw += dt * 4;
    view.t.lerp(goalT.fromArray(goal.t), k); view.d += (goal.d * userZoom - view.d) * k; view.el += (elevazione() - view.el) * k;
    view.az = lerpA(view.az, goal.az + userYaw, k);
    const az = rad(view.az), el = rad(view.el), dd = view.d * (portrait ? 1.35 : 1);
    camera.position.set(view.t.x + dd * Math.cos(el) * Math.cos(az), view.t.y + dd * Math.sin(el), view.t.z + dd * Math.cos(el) * Math.sin(az));
    camera.lookAt(view.t); camera.updateMatrixWorld();
    const under = camera.position.y < 0;
    scene.fog = under ? underFog : null;
    sky.visible = clouds.visible = land.visible = abyss.visible = !under; deep.visible = under; spray.visible = !under; bubbles.visible = under;
    if (under) deep.position.copy(camera.position);
    deep.material.uniforms.uTime.value = tAcc; U_TIME.value = tAcc;
    U_ABOVE.value = under ? 0 : 1;
    renderer.setClearColor(under ? 0x0c4a5e : 0x000000);

    if (!reduce) {
      for (const b of flotta) {
        const a = 0.04 * b.k75 ** 0.5;
        b.boat.position.y = b.M.DECK + Math.sin(tAcc * 1.3 + b.dx) * a;
        b.boat.rotation.x = HEEL + Math.sin(tAcc * 0.9 + b.dx) * 0.004;
        b.boat.rotation.z = PITCH + Math.sin(tAcc * 0.7 + 1 + b.dx) * 0.003;
        b.updateSources();
      }
      WU.uTime.value = tAcc; cloudMat.uniforms.uTime.value = tAcc;
      const la = sprayG.attributes.aLife.array;
      for (let i = 0; i < NP; i++) {
        pLife[i] -= dt; if (pLife[i] <= 0 || pPos[i * 3 + 1] < -0.05) { respawn(i); }
        pVel[i * 3 + 1] -= 9.8 * dt;
        pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
        la[i] = 1 - pLife[i] / pMax[i];
      }
      sprayG.attributes.position.needsUpdate = true; sprayG.attributes.aLife.needsUpdate = true; sprayG.attributes.aSize.needsUpdate = true;
      if (under) {
        const bl = bubG.attributes.aLife.array;
        for (let i = 0; i < NB; i++) {
          bLife[i] -= dt; if (bLife[i] <= 0) bRespawn(i, view.t);
          bPos[i * 3] += bVel[i * 3] * dt; bPos[i * 3 + 1] = Math.min(bPos[i * 3 + 1] + bVel[i * 3 + 1] * dt, -0.02); bPos[i * 3 + 2] += bVel[i * 3 + 2] * dt;
          bl[i] = bLife[i] > 0 ? 1 - bLife[i] / bMax[i] : 1;
        }
        bubG.attributes.position.needsUpdate = true; bubG.attributes.aLife.needsUpdate = true; bubG.attributes.aSize.needsUpdate = true;
      }
    }
    WU.uFoamP.value.set(principale.src[0].x, principale.src[0].z, principale.src[1].x, principale.src[1].z);
    U_SUNV.value.copy(sunDir).transformDirection(camera.matrixWorldInverse);
    glowAll(0.55 + 0.45 * Math.sin(tAcc * 4));

    if (labelId && labelAt) {
      tmp.copy(labelAt).project(camera);
      const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      label.style.opacity = vis ? 1 : 0;
      const lx = Math.min(Math.max((tmp.x * 0.5 + 0.5) * stage.clientWidth, 12), stage.clientWidth - 170), ly = Math.min(Math.max((-tmp.y * 0.5 + 0.5) * stage.clientHeight, 64), stage.clientHeight - 48);
      label.style.transform = `translate(${lx}px,${ly}px)`;
    }
    const full = tier === 'high' || (++fno & 1);
    if (full) renderer.shadowMap.needsUpdate = true;
    if (reflOn && !under) { if (full || !WU.uUseRefl.value) renderMirror(); } else WU.uUseRefl.value = 0;
    renderer.render(scene, camera);
  };

  const api = {
    // ogni tappa riparte dalla sua inquadratura, anche se prima si è ruotato o ingrandito
    view(i, t) { setView(i, t); userYaw = 0; userPitch = 0; userZoom = 1; },
    active(id, rel) { setActive(id, rel); setLabel(id && LABELS[id] ? id : null); },
    altitude: () => view.t.y,
    livery,
    modello(m) { if (m !== modo) metti(m); },
    get modo() { return modo; },
    start() { if (running) return; running = true; clock.getDelta(); resize(); frame(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize
  };
  window.__b3 = { scene, water, spray, camera, renderer, api, get flotta() { return flotta; }, get tier() { return tier; }, snap() { view.t.fromArray(goal.t); view.d = goal.d * userZoom; view.el = elevazione(); view.az = goal.az + userYaw; } };
  return api;
}
