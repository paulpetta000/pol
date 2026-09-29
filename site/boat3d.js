import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

const DECK = 2.1;
const WIND = 1; // vento da +Z: foil alzato a +Z, vele gonfie verso -Z
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// Inquadrature per ogni tappa (in metri, Y verso l'alto, acqua a y=0, prua verso +X)
const VIEWS = [
  { t: [0, 7.5, 0], d: 23, az: 35, el: 10 },
  { t: [0.3, 19.2, 0], d: 6.5, az: 60, el: 8, a: 'top' },
  { t: [-1.2, 10, 0], d: 18, az: 115, el: 6, a: 'main' },
  { t: [3.2, 7, 0], d: 13, az: 60, el: 8, a: 'jib' },
  { t: [-1.6, 2.4, 0], d: 7.5, az: 155, el: 32, a: 'deck' },
  { t: [-1.8, 2.5, 0], d: 4.2, az: 125, el: 24, a: 'crew' },
  { t: [0, 1.7, 0], d: 15, az: 90, el: 4, a: 'hull' },
  { t: [-0.4, 1.8, 0], d: 5.2, az: -115, el: 30, a: 'batt' },
  { t: [0.6, 3.4, 2.6], d: 8, az: 40, el: 12, a: 'wfoil' },
  { t: [0, 0.3, -1], d: 11, az: -60, el: 3, a: 'water' },
  { t: [0.6, -0.7, -1.7], d: 6.5, az: -70, el: -4, a: 'arm' },
  { t: [0.6, -1.9, -2.05], d: 3.7, az: -40, el: 12, a: 'wing' },
  { t: [-5.5, -1.25, 0], d: 4, az: -150, el: 12, a: 'rudder' },
  { t: [0, 7.5, 0], d: 23, az: 215, el: 10 }
];

const LABELS = {
  top: 'Testa della vela', main: 'Randa a doppia pelle', jib: 'Fiocco', deck: 'Base della vela',
  crew: 'Equipaggio', hull: 'Scafo in carbonio', batt: 'Pacco batterie', wfoil: 'Foil alzato',
  water: 'Pelo dell\'acqua', arm: 'Braccio del foil', wing: 'Ala del foil', rudder: 'Timone a T'
};

/* ---------- geometrie di supporto ---------- */
function airfoil(chord, thick, n = 18) {
  const s = new THREE.Shape();
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos(Math.PI * i / n)) / 2;
    const y = 5 * thick * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    pts.push([x, y]);
  }
  s.moveTo(0, 0);
  pts.forEach(([x, y]) => s.lineTo((0.5 - x) * chord, y * chord));
  for (let i = pts.length - 2; i > 0; i--) s.lineTo((0.5 - pts[i][0]) * chord, -pts[i][1] * chord);
  s.closePath();
  return s;
}
// Pala con profilo alare: corda lungo X, estrusa lungo "axis" per "len" metri, centrata se "center"
function blade(chord, thick, len, axis, center = false) {
  const g = new THREE.ExtrudeGeometry(airfoil(chord, thick), { depth: len, bevelEnabled: false, steps: 1, curveSegments: 4 });
  if (center) g.translate(0, 0, -len / 2);
  const X = V3(1, 0, 0), D = axis.clone().normalize();
  const N = new THREE.Vector3().crossVectors(D, X).normalize();
  const Xo = new THREE.Vector3().crossVectors(N, D).normalize();
  g.applyMatrix4(new THREE.Matrix4().makeBasis(Xo, N, D));
  g.computeVertexNormals();
  return g;
}

function hullGeometry() {
  const N = 64, R = 12, L = 11.8;
  const pos = [], idx = [];
  const ring = [];
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = -L / 2 + u * L;
    let b = 1.28 * (u < 0.35 ? 0.84 + 0.16 * Math.sin(u / 0.35 * Math.PI / 2) : 1 - Math.pow((u - 0.35) / 0.65, 1.9));
    b = Math.max(b, 0.015);
    const deck = 0.14 * u * u;
    const bot = -0.78 + 0.62 * Math.pow(smooth(0.55, 1, u), 1.3);
    const bus = 0.2 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.1) / 0.7))) * (1 - smooth(0.7, 1, u));
    const half = [
      [b, deck], [b * 0.995, deck - 0.12], [b * 0.97, (deck + bot) / 2], [b * 0.9, bot + 0.14],
      [b * 0.74, bot + 0.02], [b * 0.45, bot - 0.02], [b * 0.2, bot - bus * 0.7], [0, bot - bus]
    ];
    const pts = [];
    for (let k = 0; k < half.length; k++) pts.push(half[k]);
    for (let k = half.length - 2; k >= 0; k--) pts.push([-half[k][0], half[k][1]]);
    const curve = new THREE.SplineCurve(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const sp = curve.getPoints(R * 2);
    ring.push(sp.length);
    sp.forEach(p => pos.push(x, p.y, p.x));
  }
  const M = ring[0];
  for (let i = 0; i < N; i++) for (let k = 0; k < M - 1; k++) {
    const a = i * M + k, b = a + 1, c = a + M, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  // specchio di poppa
  const base = pos.length / 3;
  const cx = -L / 2;
  pos.push(cx, -0.2, 0);
  for (let k = 0; k < M - 1; k++) idx.push(base, k + 1, k);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function deckGeometry() {
  const N = 64, L = 11.8, pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = -L / 2 + u * L;
    let b = 1.28 * (u < 0.35 ? 0.84 + 0.16 * Math.sin(u / 0.35 * Math.PI / 2) : 1 - Math.pow((u - 0.35) / 0.65, 1.9));
    b = Math.max(b, 0.015) * 0.995;
    const y = 0.14 * u * u + 0.004;
    for (let k = 0; k <= 8; k++) { const z = -b + 2 * b * k / 8; pos.push(x, y + 0.06 * (1 - (z / b) ** 2), z); }
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < 8; k++) { const a = i * 9 + k; idx.push(a, a + 1, a + 9, a + 1, a + 10, a + 9); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function stripeGeometry(y0, y1) {
  const N = 64, L = 11.8, pos = [], idx = [];
  for (let s = -1; s <= 1; s += 2) {
    const off = pos.length / 3;
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = -L / 2 + u * L;
      let b = 1.28 * (u < 0.35 ? 0.84 + 0.16 * Math.sin(u / 0.35 * Math.PI / 2) : 1 - Math.pow((u - 0.35) / 0.65, 1.9));
      b = Math.max(b, 0.015) + 0.006;
      const d = 0.14 * u * u;
      pos.push(x, d + y0, s * b, x, d + y1, s * b);
    }
    for (let i = 0; i < N; i++) { const a = off + i * 2; s > 0 ? idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) : idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// Vela come superficie curva: luff(t) -> leech(t), con grasso verso sottovento e svergolamento
function sailGeometry(luff, leech, camber, twist0, twist1, rows = 28, cols = 14) {
  const pos = [], uv = [], idx = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let r = 0; r <= rows; r++) {
    const t = r / rows;
    luff(t, a); leech(t, b);
    const tw = (twist0 + (twist1 - twist0) * t) * Math.PI / 180;
    const chord = a.distanceTo(b);
    for (let c = 0; c <= cols; c++) {
      const s = c / cols;
      const p = a.clone().lerp(b, s);
      const bulge = camber * chord * Math.sin(Math.PI * Math.pow(s, 0.8));
      p.z += -WIND * (bulge + Math.sin(tw) * chord * s);
      pos.push(p.x, p.y, p.z); uv.push(s, t);
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * (cols + 1) + c;
    idx.push(i, i + 1, i + cols + 1, i + 1, i + cols + 2, i + cols + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function sailTexture(main) {
  return canvasTex(512, 1024, (x, w, h) => {
    x.fillStyle = '#f3f5f7'; x.fillRect(0, 0, w, h);
    // pannelli a raggiera e fibre della membrana
    x.strokeStyle = 'rgba(120,135,150,.22)'; x.lineWidth = 2;
    for (let i = 1; i < 9; i++) { x.beginPath(); x.moveTo(0, h * (1 - i / 9)); x.quadraticCurveTo(w * .5, h * (1 - i / 9) - 20, w, h * (1 - i / 9) + 40); x.stroke(); }
    x.strokeStyle = 'rgba(90,105,120,.08)'; x.lineWidth = 1;
    for (let i = 0; i < 140; i++) { x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.lineTo(w, y + (Math.random() - .5) * 300); x.stroke(); }
    if (main) {
      x.fillStyle = '#c9252c'; x.fillRect(0, 0, w, 26);
    }
    // bordo di uscita rinforzato
    x.fillStyle = 'rgba(40,50,60,.18)'; x.fillRect(w - 10, 0, 10, h);
  });
}

/* ---------- shader del mare ---------- */
const waterVS = `
varying vec3 vW;
void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const waterFS = `
uniform float uTime; uniform vec3 uSun; uniform samplerCube uEnv; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec4 uWake;
varying vec3 vW;
float h(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
float H(vec2 p, float det){ vec2 f=vec2(uTime*6.,0.);
  return fbm((p+f)*.18)*.9 + det*(fbm((p+f*1.3)*.75+vec2(uTime*.4,-uTime*.3))*.3 + fbm((p+f*1.1)*2.4)*.05); }
void main(){
  vec2 p=vW.xz; float dist=length(cameraPosition-vW);
  float det=1.-smoothstep(8.,70.,dist); float e=.08+dist*.004; float amp=.5*(1.-smoothstep(60.,900.,dist))+.04;
  float hc=H(p,det); vec3 nrm=normalize(vec3(-(H(p+vec2(e,0),det)-hc)/e*amp,1.,-(H(p+vec2(0,e),det)-hc)/e*amp));
  vec3 V=normalize(cameraPosition-vW);
  bool below = cameraPosition.y<0.;
  if(below){ nrm=-nrm; }
  float fres=pow(1.-max(dot(nrm,V),0.),5.)*.9+.03;
  vec3 R=reflect(-V,nrm); R.y=abs(R.y);
  vec3 sky=textureCube(uEnv,R).rgb;
  vec3 body=mix(uShallow,uDeep,clamp(dist/60.,0.,1.));
  sky*=.8;
  vec3 col=mix(body,sky,fres);
  float sd=max(dot(R,normalize(uSun)),0.); float spec=pow(sd,160.)*2.5*(det*.7+.3)+pow(sd,18.)*.12;
  col+=vec3(1.,.86,.66)*spec;
  float foam=0.;
  for(int k=0;k<2;k++){ vec2 o=k==0?uWake.xy:uWake.zw; float bx=o.x-vW.x; if(bx>-.3){ float w=.18+bx*.07; float dz=abs(vW.z-o.y); float trail=exp(-dz*dz/(w*w))*exp(-bx/(k==0?26.:18.)); float side=exp(-pow(dz-w*1.6,2.)/(w*w*.3))*exp(-bx/14.)*.6; foam+=(trail+side)*smoothstep(.25,.75,fbm(vec2(vW.x+uTime*9.,vW.z)*1.7)+.25); } }
  col=mix(col,vec3(.93,.97,1.),clamp(foam,0.,1.)*.85);
  float alpha=mix(.62,.985,fres)+foam*.4+smoothstep(15.,120.,dist)*.4;
  if(below){ col=mix(vec3(.35,.62,.72),vec3(1.,.95,.85),pow(max(dot(-V,vec3(0,1,0)),0.),3.)*.6)+spec*.2; alpha=.9; }
  gl_FragColor=vec4(col,clamp(alpha,0.,1.));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const CSS = `
.b3-canvas{display:block;width:100%;height:100%;cursor:grab}
.b3-canvas:active{cursor:grabbing}
.b3-ui{position:absolute;inset:0;pointer-events:none}
.b3-label{position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;transition:opacity .3s;will-change:transform}
.b3-label i{width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#43D1C6;box-shadow:0 0 0 4px rgba(67,209,198,.28),0 0 18px #43D1C6;animation:b3p 1.6s ease-in-out infinite}
.b3-label span{font:700 13px/1 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#E6F0F5;background:rgba(6,19,29,.78);border:1px solid rgba(67,209,198,.5);padding:5px 8px;border-radius:6px;white-space:nowrap}
@keyframes b3p{50%{box-shadow:0 0 0 9px rgba(67,209,198,0),0 0 22px #43D1C6}}
.b3-hint{position:absolute;left:50%;top:76px;transform:translateX(-50%);font:600 13px/1.2 'Source Sans 3',sans-serif;color:#E6F0F5;background:rgba(6,19,29,.72);border:1px solid rgba(120,190,220,.3);padding:7px 12px;border-radius:99px;transition:opacity .5s;white-space:nowrap}
.b3-ui.used .b3-hint{opacity:0}
.b3-ctrl{position:absolute;left:16px;top:76px;display:flex;gap:6px;pointer-events:auto}
.b3-ctrl button{min-width:40px;height:36px;padding:0 10px;border-radius:99px;background:rgba(6,19,29,.78);border:1px solid rgba(120,190,220,.35);color:#E6F0F5;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.06em}
.b3-ctrl button:hover{border-color:#43D1C6}
@media(max-width:899px){.b3-hint{top:118px}}
`;

/* ---------- montaggio ---------- */
export function mount(stage, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.62;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!document.getElementById('b3-css')) { const st = document.createElement('style'); st.id = 'b3-css'; st.textContent = CSS; document.head.appendChild(st); }
  const cv = renderer.domElement;
  cv.className = 'b3-canvas';
  stage.innerHTML = '';
  stage.appendChild(cv);

  const ui = document.createElement('div');
  ui.className = 'b3-ui';
  ui.innerHTML = `<div class="b3-label" hidden><i></i><span></span></div>
    <div class="b3-hint">↔ Trascina per ruotare la barca</div>
    <div class="b3-ctrl"><button type="button" data-b3="l" aria-label="Ruota a sinistra">⟲</button><button type="button" data-b3="spin" aria-label="Giro completo">360°</button><button type="button" data-b3="r" aria-label="Ruota a destra">⟳</button></div>`;
  stage.appendChild(ui);
  const label = ui.querySelector('.b3-label');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 8000);

  // cielo al tramonto sul golfo
  const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(84), THREE.MathUtils.degToRad(-120));
  const sky = new Sky(); sky.scale.setScalar(6000);
  const su = sky.material.uniforms;
  su.turbidity.value = 6; su.rayleigh.value = 1.6; su.mieCoefficient.value = 0.006; su.mieDirectionalG.value = 0.86;
  su.sunPosition.value.copy(sun);
  scene.add(sky);

  const skyScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(6000);
  Object.keys(su).forEach(k => { if (sky2.material.uniforms[k]) sky2.material.uniforms[k].value = su[k].value; });
  skyScene.add(sky2);
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cubeCam = new THREE.CubeCamera(1, 10000, cubeRT);
  cubeCam.update(renderer, skyScene);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(skyScene).texture;

  const sunLight = new THREE.DirectionalLight(0xffe2c0, 3.2);
  sunLight.position.copy(sun).multiplyScalar(60);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunLight.shadow.camera, { left: -16, right: 16, top: 22, bottom: -6, near: 1, far: 140 });
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);
  scene.add(new THREE.HemisphereLight(0xbfd8ea, 0x1f4557, 0.5));

  // mare
  const water = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.ShaderMaterial({
    vertexShader: waterVS, fragmentShader: waterFS, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uSun: { value: sun.clone() }, uEnv: { value: cubeRT.texture }, uDeep: { value: new THREE.Color(0x06303f) }, uShallow: { value: new THREE.Color(0x0f5c6e) }, uWake: { value: new THREE.Vector4() } }
  }));
  water.rotation.x = -Math.PI / 2;
  water.renderOrder = 2;
  scene.add(water);

  // Vesuvio e costa lontana, nella foschia
  const haze = new THREE.ShaderMaterial({ fog: false, vertexShader: 'varying float vY; void main(){ vY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying float vY; void main(){ vec3 c=mix(vec3(.62,.62,.64),vec3(.47,.53,.58),smoothstep(0.,420.,vY)); gl_FragColor=vec4(c,1.);\n #include <colorspace_fragment>\n }' });
  const volc = new THREE.LatheGeometry([V3(0, 0, 0), V3(900, 0, 0), V3(620, 120, 0), V3(330, 330, 0), V3(150, 460, 0), V3(95, 470, 0), V3(60, 440, 0), V3(0, 440, 0)].map(v => new THREE.Vector2(v.x, v.y)), 40);
  const vesuvio = new THREE.Mesh(volc, haze); vesuvio.scale.set(.8, .8, .8); vesuvio.position.set(-3000, -8, -2700); scene.add(vesuvio);
  const somma = new THREE.Mesh(volc, haze); somma.scale.set(.9, .64, .9); somma.position.set(-2550, -8, -2950); scene.add(somma);
  const coast = new THREE.Mesh(new THREE.CylinderGeometry(3900, 3900, 90, 90, 1, true, Math.PI * 0.55, Math.PI * 0.9), new THREE.MeshBasicMaterial({ color: 0x8a9aa2, side: THREE.BackSide, fog: false, transparent: true, opacity: .55 }));
  coast.position.y = 8; coast.scale.y = .35; coast.material.opacity = .28; scene.add(coast);

  const deep = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 vP; void main(){ float y=vP.y; vec3 c=mix(vec3(.01,.07,.1),vec3(.06,.33,.42),smoothstep(-.9,.05,y)); float ray=pow(max(sin(vP.x*38.+vP.z*21.)*.5+.5,0.),6.)*smoothstep(-.2,.1,y)*.18; gl_FragColor=vec4(c+ray,1.);\n #include <colorspace_fragment>\n }' }));
  deep.visible = false; deep.renderOrder = -1; scene.add(deep);

  /* ----- la barca ----- */
  const boat = new THREE.Group(); scene.add(boat);
  const parts = {};
  const add = (id, mesh) => { (parts[id] = parts[id] || []).push(mesh); mesh.castShadow = true; mesh.receiveShadow = true; boat.add(mesh); return mesh; };
  const M = {
    hull: new THREE.MeshPhysicalMaterial({ color: 0xf5f7f8, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true }),
    deck: new THREE.MeshStandardMaterial({ color: 0x46525c, roughness: 0.9 }),
    red: new THREE.MeshPhysicalMaterial({ color: 0xc8202a, roughness: 0.3, clearcoat: 1 }),
    carbon: new THREE.MeshPhysicalMaterial({ color: 0x161d24, roughness: 0.32, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15 }),
    foil: new THREE.MeshPhysicalMaterial({ color: 0x20272e, roughness: 0.28, metalness: 0.35, clearcoat: 1 }),
    flap: new THREE.MeshPhysicalMaterial({ color: 0x2f3a44, roughness: 0.3, metalness: 0.3 }),
    main: new THREE.MeshPhysicalMaterial({ map: sailTexture(true), roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide }),
    jib: new THREE.MeshPhysicalMaterial({ map: sailTexture(false), roughness: 0.6, sheen: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.97 }),
    rig: new THREE.MeshStandardMaterial({ color: 0x0e1418, roughness: 0.5 }),
    batt: new THREE.MeshStandardMaterial({ color: 0x1c3b4a, roughness: 0.4, metalness: 0.4, emissive: 0x0b2830 }),
    suit: new THREE.MeshStandardMaterial({ color: 0x1a2129, roughness: 0.7 })
  };
  Object.values(M).forEach(m => { m.userData.baseEm = m.emissive ? m.emissive.clone() : null; });

  const hullMesh = add('hull', new THREE.Mesh(hullGeometry(), M.hull));
  const deckMesh = add('deck', new THREE.Mesh(deckGeometry(), M.deck));
  add('hull', new THREE.Mesh(stripeGeometry(-0.3, -0.2), M.red));

  // abitacoli ed equipaggio
  const helm = [0xe9b44c, 0x43d1c6, 0xe9b44c, 0x43d1c6];
  [[-1.3, .62], [-1.3, -.62], [-2.5, .62], [-2.5, -.62]].forEach(([x, z], i) => {
    const pit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.55), new THREE.MeshStandardMaterial({ color: 0x0a1117, roughness: 0.9 }));
    pit.position.set(x, 0.0, z); add('deck', pit);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.32, 6, 12), M.suit);
    torso.position.set(x + 0.08, 0.3, z); torso.rotation.z = -0.25; add('crew', torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 16), new THREE.MeshPhysicalMaterial({ color: helm[i], roughness: 0.25, clearcoat: 1 }));
    head.position.set(x + 0.2, 0.68, z); add('crew', head);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.152, 16, 8, -0.6, 1.2, 1.2, 0.5), new THREE.MeshPhysicalMaterial({ color: 0x0b0f14, roughness: 0.05, metalness: 0.6 }));
    visor.position.copy(head.position); add('crew', visor);
  });

  // batterie dentro lo scafo
  const batt = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.34, 0.7), M.batt); batt.position.set(-0.4, -0.35, 0); add('batt', batt);
  const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xe9b44c })); bolt.position.set(-0.4, -0.17, 0); add('batt', bolt);
  batt.visible = bolt.visible = false;

  // albero alare
  const MX = 0.9, H = 18;
  const mastG = new THREE.CylinderGeometry(0.055, 0.12, H, 20); mastG.scale(2.3, 1, 1); mastG.translate(0, H / 2, 0);
  const mast = new THREE.Mesh(mastG, M.carbon); mast.position.set(MX, 0.05, 0); mast.rotation.z = 0.035; add('main', mast);
  const mastAt = y => V3(MX - Math.sin(0.035) * y - 0.2, y + 0.05, 0);

  // randa a doppia pelle, square top
  const mainG = sailGeometry(
    (t, v) => v.copy(mastAt(0.35 + t * (H - 0.6))),
    (t, v) => { const a = mastAt(0.35 + t * (H - 0.6)); const c = 4.3 + (1.55 - 4.3) * t + 0.45 * Math.sin(Math.PI * t); v.set(a.x - c, a.y - 0.1 * Math.sin(Math.PI * t), 0); },
    0.085, 7, 16);
  add('main', new THREE.Mesh(mainG, M.main));
  const skin2 = new THREE.Mesh(mainG, M.main); skin2.position.z = -WIND * 0.07; skin2.scale.set(1, 1, 1); add('main', skin2);
  // stecche
  for (let k = 1; k <= 6; k++) {
    const t = k / 7, a = mastAt(0.35 + t * (H - 0.6)), c = 4.3 + (1.55 - 4.3) * t + 0.45 * Math.sin(Math.PI * t);
    const pts = []; for (let s = 0; s <= 10; s++) { const q = s / 10; const tw = (7 + 9 * t) * Math.PI / 180; pts.push(V3(a.x - c * q, a.y - 0.1 * Math.sin(Math.PI * t) * q, -WIND * (0.085 * c * Math.sin(Math.PI * Math.pow(q, .8)) + Math.sin(tw) * c * q) - WIND * 0.035)); }
    add('main', new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.018, 5), M.rig));
  }
  // fiocco
  const tack = V3(5.55, 0.35, 0), head = mastAt(12.6).add(V3(0.25, 0, 0)), clew = V3(MX - 0.45, 0.4, 0);
  const jibG = sailGeometry((t, v) => v.copy(tack).lerp(head, t), (t, v) => v.copy(clew).lerp(head, t), 0.1, 10, 14, 20, 10);
  add('jib', new THREE.Mesh(jibG, M.jib));
  const stay = (a, b, r = 0.012, id = 'jib') => { const d = b.clone().sub(a); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), M.rig); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); add(id, m); };
  stay(tack.clone().add(V3(0.1, -0.2, 0)), head.clone().add(V3(0.02, 0.2, 0)), 0.014);
  stay(mastAt(13), V3(0.6, 0.05, 1.12), 0.01, 'main'); stay(mastAt(13), V3(0.6, 0.05, -1.12), 0.01, 'main');
  // bompresso corto e prua
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.7, 10), M.carbon); bow.rotation.z = Math.PI / 2; bow.position.set(5.95, 0.1, 0); add('hull', bow);

  // foil: braccio + ala a T + siluro + flap
  const foilSide = (side, down) => {
    const g = new THREE.Group(); boat.add(g);
    const piv = V3(0.6, -0.5, side * 1.15);
    const dir = down ? V3(0, -1, side * 0.26).normalize() : V3(0, 0.58, side * 1).normalize();
    const len = 3.7;
    const arm = new THREE.Mesh(blade(0.5, 0.16, len, dir), M.foil); arm.position.copy(piv); arm.castShadow = true; arm.receiveShadow = true; g.add(arm);
    const tip = piv.clone().addScaledVector(dir, len);
    const span = new THREE.Vector3().crossVectors(V3(1, 0, 0), dir).normalize();
    const wing = new THREE.Mesh(blade(0.55, 0.13, 2.9, span, true), M.foil); wing.position.copy(tip); g.add(wing);
    const flapG = blade(0.16, 0.1, 2.5, span, true); flapG.translate(-0.33, 0, 0);
    const flap = new THREE.Mesh(flapG, M.flap); flap.position.copy(tip); g.add(flap);
    const bulb = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.9, 8, 16), M.foil); bulb.rotation.z = Math.PI / 2; bulb.position.copy(tip).add(V3(0.1, 0, 0)); g.add(bulb);
    [arm, wing, flap, bulb].forEach(m => { m.castShadow = true; });
    const id = down ? 'arm' : 'wfoil';
    (parts[id] = parts[id] || []).push(arm);
    if (down) { (parts.wing = parts.wing || []).push(wing, flap, bulb); } else { (parts.wfoil = parts.wfoil || []).push(wing, flap, bulb); }
    return { piv, dir };
  };
  const lee = foilSide(-WIND, true);
  foilSide(WIND, false);

  // timone a T
  const rud = new THREE.Mesh(blade(0.36, 0.12, 3.2, V3(0, -1, 0)), M.foil); rud.position.set(-5.55, -0.35, 0); add('rudder', rud);
  const elev = new THREE.Mesh(blade(0.34, 0.12, 1.5, V3(0, 0, 1), true), M.foil); elev.position.set(-5.55, -3.5, 0); add('rudder', elev);

  // posizione di volo
  boat.position.y = DECK;
  boat.rotation.x = WIND * THREE.MathUtils.degToRad(2.5);
  boat.traverse(o => { if (o.isMesh && !o.userData.noClone) { o.material = o.material.clone(); o.material.userData.baseEm = o.material.emissive ? o.material.emissive.clone() : null; } });

  /* ----- spruzzi ----- */
  const sprite = canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  const NP = 700, pPos = new Float32Array(NP * 3), pVel = new Float32Array(NP * 3), pLife = new Float32Array(NP), pSrc = new Uint8Array(NP);
  const sprayG = new THREE.BufferGeometry(); sprayG.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const spray = new THREE.Points(sprayG, new THREE.PointsMaterial({ map: sprite, size: 0.24, transparent: true, depthWrite: false, opacity: 0.8, color: 0xf4fbff }));
  spray.renderOrder = 3; spray.frustumCulled = false; scene.add(spray);
  const leeHit = lee.piv.clone().addScaledVector(lee.dir, (lee.piv.y + DECK) / -lee.dir.y); leeHit.y = 0;
  const srcs = [leeHit, V3(-5.55, 0, 0)];
  const respawn = i => {
    const s = i % 5 === 0 ? 1 : 0; pSrc[i] = s; const o = srcs[s];
    pPos[i * 3] = o.x + (Math.random() - .5) * .3; pPos[i * 3 + 1] = 0.02; pPos[i * 3 + 2] = o.z + (Math.random() - .5) * .25;
    pVel[i * 3] = -4 - Math.random() * 6; pVel[i * 3 + 1] = 1.2 + Math.random() * (s ? 1.2 : 2.6); pVel[i * 3 + 2] = (Math.random() - .5) * 2.2;
    pLife[i] = 0.4 + Math.random() * 0.9;
  };
  for (let i = 0; i < NP; i++) { respawn(i); pLife[i] *= Math.random(); }

  water.material.uniforms.uWake.value.set(leeHit.x, leeHit.z, srcs[1].x, srcs[1].z);

  /* ----- evidenziazione ----- */
  let activeIds = [];
  const setActive = (id, rel = []) => {
    activeIds = id ? [id, ...rel] : [];
    const glass = activeIds.includes('batt');
    hullMesh.material.opacity = glass ? 0.3 : 1; hullMesh.material.depthWrite = !glass; hullMesh.castShadow = !glass; deckMesh.material.transparent = true; deckMesh.material.opacity = glass ? 0.22 : 1; deckMesh.material.depthWrite = !glass;
    batt.visible = bolt.visible = glass;
  };
  const glowAll = k => {
    Object.entries(parts).forEach(([id, arr]) => {
      const on = activeIds.includes(id) && id !== 'water';
      arr.forEach(m => { const mt = m.material; if (!mt.emissive) return; if (on) { mt.emissive.setRGB(0.06 * k, 0.42 * k, 0.4 * k); } else if (mt.userData.baseEm) mt.emissive.copy(mt.userData.baseEm); });
    });
  };

  /* ----- camera ----- */
  let portrait = false, userYaw = 0, spin = 0, dragging = false, lastX = 0, idle = 0;
  const view = { t: V3(0, 8, 0), d: 30, az: 35, el: 12 };
  let goal = { ...VIEWS[0] };
  const lerpA = (a, b, t) => { let d = ((b - a + 540) % 360) - 180; return a + d * t; };
  const setView = (i, t) => {
    const a = VIEWS[Math.min(i, VIEWS.length - 1)], b = VIEWS[Math.min(i + 1, VIEWS.length - 1)];
    goal = { t: a.t.map((v, k) => v + (b.t[k] - v) * t), d: Math.exp(Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * t), az: lerpA(a.az, b.az, t), el: a.el + (b.el - a.el) * t };
  };
  const anchorOf = id => { if (id === 'water') return leeHit.clone(); const arr = parts[id]; if (!arr || !arr.length) return null; const box = new THREE.Box3(); arr.forEach(m => box.expandByObject(m)); return box.getCenter(new THREE.Vector3()); };
  let labelId = null, labelAt = null;
  const setLabel = id => { labelId = id; labelAt = id ? anchorOf(id) : null; label.hidden = !id; if (id) label.querySelector('span').textContent = LABELS[id] || ''; };

  cv.style.touchAction = 'pan-y';
  cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; idle = 0; ui.classList.add('used'); });
  window.addEventListener('pointermove', e => { if (!dragging) return; userYaw += (e.clientX - lastX) * 0.35; lastX = e.clientX; });
  const end = () => { dragging = false; };
  window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-b3]'); if (!b) return; ui.classList.add('used');
    const k = b.dataset.b3; if (k === 'l') userYaw -= 45; else if (k === 'r') userYaw += 45; else spin = 360;
  });

  const resize = () => {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    portrait = w < h; camera.fov = portrait ? 50 : 40;
    if (portrait) camera.setViewOffset(w, h, 0, h * 0.2, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  const underFog = new THREE.FogExp2(0x0b4152, 0.07);
  const clock = new THREE.Clock();
  let running = false, raf = 0, tAcc = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tmp = new THREE.Vector3();
  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const rdt = Math.min(clock.getDelta(), 0.3), dt = Math.min(rdt, 0.05); tAcc += dt; idle += rdt;
    const k = 1 - Math.exp(-rdt * 4);
    if (spin > 0) { const s = Math.min(spin, dt * 120); spin -= s; userYaw += s; }
    const overview = goal.d > 20;
    if (overview && !dragging && idle > 2 && !reduce) userYaw += dt * 4;
    view.t.lerp(V3(...goal.t), k); view.d += (goal.d - view.d) * k; view.el += (goal.el - view.el) * k;
    view.az = lerpA(view.az, goal.az + userYaw, k);
    const az = THREE.MathUtils.degToRad(view.az), el = THREE.MathUtils.degToRad(view.el);
    const dd = view.d * (portrait ? 1.35 : 1);
    camera.position.set(view.t.x + dd * Math.cos(el) * Math.cos(az), view.t.y + dd * Math.sin(el), view.t.z + dd * Math.cos(el) * Math.sin(az));
    camera.lookAt(view.t);
    const under = camera.position.y < 0;
    scene.fog = under ? underFog : null;
    sky.visible = !under; deep.visible = under; spray.visible = !under; if (under) deep.position.copy(camera.position);
    renderer.setClearColor(under ? 0x0c4a5e : 0x000000);

    if (!reduce) {
      boat.position.y = DECK + Math.sin(tAcc * 1.3) * 0.035;
      boat.rotation.z = Math.sin(tAcc * 0.9) * 0.006;
      water.material.uniforms.uTime.value = tAcc;
      for (let i = 0; i < NP; i++) {
        pLife[i] -= dt; if (pLife[i] <= 0) { respawn(i); continue; }
        pVel[i * 3 + 1] -= 9.8 * dt;
        pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] = Math.max(0, pPos[i * 3 + 1] + pVel[i * 3 + 1] * dt); pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
      }
      sprayG.attributes.position.needsUpdate = true;
    }
    glowAll(0.55 + 0.45 * Math.sin(tAcc * 4));

    if (labelId) {
      const p = labelAt;
      if (p) { tmp.copy(p).project(camera); const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
        label.style.opacity = vis ? 1 : 0; const lx = Math.min(Math.max((tmp.x * .5 + .5) * stage.clientWidth, 12), stage.clientWidth - 170), ly = Math.min(Math.max((-tmp.y * .5 + .5) * stage.clientHeight, 120), stage.clientHeight - 40); label.style.transform = `translate(${lx}px,${ly}px)`; }
    }
    renderer.render(scene, camera);
  };

  return {
    view: setView,
    active(id, rel) { setActive(id, rel); setLabel(id && LABELS[id] ? id : null); },
    altitude: () => view.t.y,
    start() { if (running) return; running = true; clock.getDelta(); resize(); frame(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize
  };
}
