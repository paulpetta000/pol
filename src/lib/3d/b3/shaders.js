/* ---------- shader ---------- */
const NOISE = `
float h1(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.03+vec2(3.1,1.7); a*=.5; } return s; }`;

const waterVS = `
#include <common>
#include <shadowmap_pars_vertex>
uniform float uTime; uniform vec2 uFlow; uniform mat4 uReflMat; uniform vec4 uWaves[5];
varying vec3 vW; varying vec3 vN; varying vec4 vR; varying float vCrest;
void main(){
  vec4 w0 = modelMatrix * vec4(position, 1.0);
  vec2 p = w0.xz + uFlow * uTime;
  float r = length(w0.xz);
  vec3 d3 = vec3(0.0); vec3 n = vec3(0.0, 1.0, 0.0); float cr = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 wv = uWaves[i];
    float k = 6.2831853 / wv.z, c = sqrt(9.81 / k);
    float fade = 1.0 - smoothstep(wv.z * 3.0, wv.z * 9.0, r);
    float a = wv.w * fade, f = k * (dot(wv.xy, p) - c * uTime);
    float qa = 0.75 * fade / (k * 5.0), cf = cos(f), sf = sin(f);
    d3.x += qa * wv.x * cf; d3.z += qa * wv.y * cf; d3.y += a * sf;
    n.x -= wv.x * k * a * cf; n.z -= wv.y * k * a * cf; n.y -= k * qa * sf;
    cr += a * sf;
  }
  vec4 worldPosition = vec4(w0.xyz + d3, 1.0);
  vW = worldPosition.xyz; vN = normalize(n); vCrest = cr;
  vR = uReflMat * vec4(w0.x, 0.0, w0.z, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
  vec3 transformedNormal = normalize(mat3(viewMatrix) * vN);
  #include <shadowmap_vertex>
}`;

const waterFS = `
#include <common>
#include <packing>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
uniform float uTime; uniform vec2 uFlow; uniform vec3 uSun; uniform vec3 uSunCol;
uniform samplerCube uEnv; uniform sampler2D uRefl; uniform float uUseRefl; uniform sampler2D uNrm;
uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uUwH; uniform vec4 uFoamP; uniform vec2 uFoamK;
varying vec3 vW; varying vec3 vN; varying vec4 vR; varying float vCrest;
${NOISE}
float wake(vec2 o, float len, float w0, vec2 pe){
  float b = o.x - vW.x;
  if (b < -0.3) return 0.0;
  float bb = max(b, 0.0), w = w0 + bb * 0.055, dz = abs(vW.z - o.y);
  if (dz > w * 4.0 + bb * 0.4 + 0.5) return 0.0;
  float core = exp(-dz * dz / (w * w)) * exp(-bb / len);
  float kel = exp(-pow(dz - bb * 0.34 - w0, 2.0) / (0.015 + bb * 0.01)) * exp(-bb / (len * 0.6)) * 0.6;
  float n = fbm(vec2(pe.x * 1.1, pe.y * 3.5));
  float m = fbm(vec2(pe.x * 3.0, pe.y * 7.0));
  return (core * smoothstep(0.2, 0.75, n + 0.3 * core) + kel * smoothstep(0.5, 0.8, m)) * smoothstep(-0.3, 0.25, b);
}
void main(){
  vec3 toC = cameraPosition - vW; float dist = length(toC); vec3 V = toC / dist;
  vec2 pe = vW.xz + uFlow * uTime;
  vec2 s1 = texture2D(uNrm, pe / 13.0 + vec2(0.0, -uTime * 0.03)).rg * 2.0 - 1.0;
  vec2 s2 = texture2D(uNrm, pe / 4.1 + vec2(uTime * 0.02, -uTime * 0.055)).rg * 2.0 - 1.0;
  vec2 s3 = texture2D(uNrm, pe / 1.3 + vec2(-uTime * 0.05, -uTime * 0.09)).rg * 2.0 - 1.0;
  float nearK = 1.0 - smoothstep(5.0, 45.0, dist), midK = 1.0 - smoothstep(25.0, 500.0, dist);
  vec2 sl = s1 * 0.16 + s2 * 0.13 * midK + s3 * 0.09 * nearK;
  vec3 N = normalize(vec3(vN.x - sl.x, vN.y, vN.z - sl.y));
  float sh = getShadowMask();
  if (cameraPosition.y < 0.0) {
    vec3 Nd = normalize(vec3(-vN.x + sl.x * 2.5, -vN.y, -vN.z + sl.y * 2.5));
    vec3 I = -V;
    vec3 T = refract(I, -Nd, 1.33);
    float win = dot(T, T) > 0.0 ? smoothstep(0.0, 0.25, T.y) : 0.0;
    vec3 sky = textureCube(uEnv, normalize(vec3(T.x, abs(T.y) + 0.05, T.z))).rgb;
    vec3 tir = mix(uUwH * 1.5, vec3(0.06, 0.34, 0.4), clamp(0.45 + 1.4 * (sl.x + sl.y), 0.0, 1.0));
    vec3 col = mix(tir, sky * 0.9 + vec3(0.02, 0.08, 0.09), win);
    col += vec3(1.0, 0.96, 0.88) * pow(max(dot(T, uSun), 0.0), 90.0) * win * 3.0;
    col = mix(col, uUwH, 1.0 - exp(-pow(dist * 0.05, 2.0)));
    gl_FragColor = vec4(col, 0.97);
  } else {
    float NdV = max(dot(N, V), 0.0);
    float F = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);
    vec3 R = reflect(-V, N); R.y = abs(R.y);
    vec3 env = textureCube(uEnv, R).rgb;
    vec2 ruv = vR.xy / vR.w + N.xz * 0.12 * (1.0 - smoothstep(30.0, 300.0, dist));
    vec3 pl = texture2D(uRefl, clamp(ruv, 0.002, 0.998)).rgb;
    vec3 refl = mix(env, pl, uUseRefl * 0.9);
    float sunUp = max(uSun.y, 0.0);
    vec3 body = mix(uShallow, uDeep, smoothstep(0.0, 0.7, V.y)) * (0.4 + 0.6 * sh) * (0.55 + 0.9 * sunUp);
    float sss = pow(max(dot(V, -normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0), 2.0) * clamp(vCrest * 3.0 + 0.35, 0.0, 1.0);
    body += uShallow * sss * 0.45 * sh;
    vec3 col = mix(body, refl, F);
    vec3 Hh = normalize(uSun + V);
    float nh = max(dot(N, Hh), 0.0);
    col += uSunCol * (pow(nh, 1400.0) * 70.0 + pow(nh, 180.0) * 1.2) * sh * (0.35 + F);
    float fo = clamp(wake(uFoamP.xy, 24.0, 0.13, pe) * uFoamK.x + wake(uFoamP.zw, 13.0, 0.08, pe) * uFoamK.y, 0.0, 1.0);
    vec3 foamC = vec3(0.9, 0.95, 0.98) * (0.45 + 0.55 * sh) * (0.65 + 0.6 * sunUp);
    col = mix(col, foamC, fo * 0.92);
    vec3 hz = textureCube(uEnv, normalize(vec3(-V.x, 0.015, -V.z))).rgb;
    col = mix(col, hz, smoothstep(300.0, 5200.0, dist) * 0.92);
    float a = max(max(mix(0.6, 1.0, F), fo), smoothstep(40.0, 220.0, dist));
    gl_FragColor = vec4(col, a);
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const cloudVS = 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const cloudFS = `
uniform vec3 uSun; uniform float uTime; uniform float uBright; varying vec3 vD;
${NOISE}
void main(){
  vec3 d = normalize(vD);
  if (d.y < 0.0) discard;
  vec2 uv = d.xz / (d.y + 0.07) * 1.4 + vec2(uTime * 0.004, 0.0);
  float n = fbm(uv * 0.8 + vec2(7.0, 3.0));
  float dens = smoothstep(0.54, 0.8, n) * smoothstep(0.0, 0.06, d.y) * (1.0 - 0.75 * smoothstep(0.18, 0.6, d.y));
  if (dens < 0.003) discard;
  float n2 = fbm(uv * 0.8 + vec2(7.0, 3.0) + uSun.xz * 0.06);
  float lit = clamp(0.55 + (n - n2) * 5.0, 0.0, 1.0);
  float silver = pow(max(dot(d, uSun), 0.0), 6.0);
  vec3 col = mix(vec3(0.5, 0.56, 0.64), vec3(1.0, 0.98, 0.94), lit) + silver * 0.6;
  gl_FragColor = vec4(col * uBright, dens * 0.92);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// Golfo di Napoli sullo sfondo: Vesuvio e Somma, penisola sorrentina, Capri, Posillipo e la città
const landVS = 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const landFS = `
uniform samplerCube uEnv; uniform vec3 uSun; varying vec3 vP;
float hh(float x){ return fract(sin(x * 127.1) * 43758.5453); }
float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3. - 2. * f); return mix(hh(i), hh(i + 1.), f); }
float f1(float x){ return n1(x) * .5 + n1(x * 2.3) * .25 + n1(x * 5.1) * .125 + n1(x * 11.7) * .0625; }
float ad(float a, float b){ float d = a - b; return atan(sin(d), cos(d)); }
void main(){
  float az = atan(vP.z, vP.x), y = vP.y;
  float dv = ad(az, radians(205.)), ds = ad(az, radians(199.));
  float ves = 208. * pow(max(0., 1. - abs(dv) / .27), 1.9) - 6. * exp(-dv * dv / .00006);
  float som = 172. * pow(max(0., 1. - abs(ds) / .24), 2.3);
  float mas = max(ves, som) + (f1(az * 45.) - .5) * 5.;
  float dp = ad(az, radians(243.));
  float sor = (48. + 26. * f1(az * 16.)) * smoothstep(.37, .2, abs(dp)) * (1. - .45 * smoothstep(-.1, .37, dp));
  float dc = ad(az, radians(273.));
  float cap = 44. * exp(-pow((dc + .02) / .028, 2.)) + 31. * exp(-pow((dc - .032) / .034, 2.));
  float dn = ad(az, radians(135.));
  float city = (11. + 9. * f1(az * 70.)) * smoothstep(.95, .7, abs(dn)) + 30. * exp(-pow(ad(az, radians(95.)) / .12, 2.));
  float H = max(max(mas, sor), max(cap, city));
  if (y > H) discard;
  vec3 hz = textureCube(uEnv, normalize(vec3(cos(az), .02, sin(az)))).rgb;
  vec3 base = vec3(.2, .23, .22); float haze = .42;
  if (H == city) { base = vec3(.48, .45, .4); haze = .22; float b = step(.5, n1(az * 1400.)) * step(.35, fract(y * .5 + n1(az * 380.))); base = mix(base, vec3(.72, .68, .6), b * .6 * step(y, 16.)); }
  else if (H == sor) haze = .62;
  else if (H == cap) haze = .72;
  float side = sign(ad(az, radians(205.))) * sign(ad(atan(uSun.z, uSun.x), radians(205.)));
  base *= H == mas ? .85 + .25 * side : 1.;
  base *= .8 + .4 * f1(az * 90. + y * .05);
  vec3 col = mix(base * (.6 + .6 * max(uSun.y, 0.)), hz, clamp(haze + (1. - y / H) * .12, 0., .95));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const sprayVS = `
attribute float aLife; attribute float aSize; uniform float uScale; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = min(aSize * uScale / -mv.z, 36.0); vA = smoothstep(0.0, 0.15, aLife) * smoothstep(1.0, 0.45, aLife); }`;
const sprayFS = `
uniform vec3 uCol; varying float vA;
void main(){ vec2 d = gl_PointCoord - .5; float r = dot(d, d) * 4.; if (r > 1.) discard; float a = (1. - r) * (1. - r) * vA * .38;
  gl_FragColor = vec4(uCol, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const CSS = `
.b3-canvas{display:block;width:100%;height:100%;cursor:grab}
.b3-canvas:active{cursor:grabbing}
.b3-ui{position:absolute;inset:0;pointer-events:none}
.b3-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 75% at 50% 48%,rgba(0,0,0,0) 60%,rgba(0,8,14,.3) 100%)}
.b3-label{position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;transition:opacity .3s;will-change:transform}
.b3-label i{width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#2CC4D8;box-shadow:0 0 0 4px rgba(44,196,216,.28),0 0 18px #2CC4D8;animation:b3p 1.6s ease-in-out infinite}
.b3-label span{font:600 12px/1 var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#EDF3F5;background:rgba(9,13,16,.8);border:1px solid rgba(44,196,216,.5);padding:5px 8px;border-radius:3px;white-space:nowrap}
@keyframes b3p{50%{box-shadow:0 0 0 9px rgba(44,196,216,0),0 0 22px #2CC4D8}}
.b3-hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);font:600 13px/1.2 var(--f-sans,sans-serif);color:#EDF3F5;background:rgba(9,13,16,.72);border:1px solid rgba(120,190,220,.3);padding:7px 12px;border-radius:99px;transition:opacity .5s;white-space:nowrap}
.b3-ui.used .b3-hint{opacity:0}
.b3-ctrl{position:absolute;left:10px;top:10px;display:flex;flex-wrap:wrap;gap:6px;pointer-events:auto}
.b3-ctrl button{min-width:44px;height:44px;padding:0 10px;border-radius:3px;background:rgba(9,13,16,.78);border:1px solid rgba(120,190,220,.35);color:#EDF3F5;font:600 15px var(--f-mono,monospace);cursor:pointer}
.b3-ctrl button:hover,.b3-ctrl button:focus-visible{border-color:#2CC4D8;outline:none}
.b3-scala{position:absolute;right:10px;top:10px;font:600 11px var(--f-mono,monospace);letter-spacing:.06em;color:#EDF3F5;background:rgba(9,13,16,.72);padding:6px 8px;border-radius:3px;pointer-events:none}
`;

export { NOISE, waterVS, waterFS, cloudVS, cloudFS, landVS, landFS, sprayVS, sprayFS, CSS };
