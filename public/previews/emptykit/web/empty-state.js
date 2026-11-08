// Emptykit for the web: the 48 illustrations drawn live with three.js from one small GLB each, with the same
// strokes as the PNG and SVG files (the kit's line engine), any accent colour, light and dark themes, and real 3D
// motion: the models turn, and their silhouettes and hidden edges are recomputed every frame.
//
//   <script type="importmap">
//     { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js",
//                    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/" } }
//   </script>
//   <script type="module" src="./empty-state.js"></script>
//   <empty-state name="no-results" look="mono" theme="light" accent="teal" style="width: 240px"></empty-state>
//
// Attributes: name (slug, e.g. "no-results") or src (a GLB URL) · look: mono | line | blueprint · theme: light |
// dark | auto · accent: indigo | violet | blue | teal | orange | pink | any #hex · glow (Mono dark) · bold ·
// line-scale (number) · motion: orbit (a slow turn back and forth, the default) | tilt (turns toward the pointer) |
// float (a gentle bob, the exact iso view) | none · yaw, pitch (degrees: a fixed pose, with any motion) · phase
// (seconds: offsets the animation clock, to desync several) · hidden-edges="false" drops the dashed hidden edges of
// Line and Blueprint. With prefers-reduced-motion the illustration stays still.
//
// From code:
//   import { mountEmptyState } from './empty-state.js';
//   const ill = await mountEmptyState(element, { name: 'no-results', look: 'mono', theme: 'dark', glow: true });
//   ill.set({ accent: '#0EA5E9' });  ill.set({ motion: 'tilt' });  ill.set({ yaw: 20 });  ill.dispose();
//
// How it draws: one shared WebGL renderer (so a page can show all 48 without running out of WebGL contexts) renders
// each illustration and copies it into the element's own 2D canvas. Layers, bottom to top, as in the PNG/SVG:
// Blueprint grid and guides (SVG), the ground shadow, the three-tone fills, the shadow on the objects, Line's hidden
// edges, the accent glow, the strokes.
// - Strokes are the kit's line engine, run live: every time the pose changes, the component redoes the engine's
//   candidate pass from the GLB's topology (ek.topo): edges between flat faces become contours where one face turns
//   away and creases where they fold, marked edges stay creases, smooth surfaces give contours interpolated inside
//   their triangles (n.v = 0). Visibility is decided per pixel on the GPU at the stroke's centre line against a depth
//   pre-pass, so silhouettes keep their full width and hidden edges come out dashed; a contour with empty background
//   on either side is drawn at outline weight, as in the PNGs. At the isometric pose this matches the PNGs to about
//   1-2/255 per pixel. The ground shadow turns with the model (the kit's light is straight above), and the shadow on
//   the objects stays on the surfaces that were seen in the iso view. Sparkles keep facing you (their strokes are the
//   GLB's baked LINES, which are also the fallback for a GLB without topology).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LOOKS, ACCENTS, SUBJECTS, BOLD } from './looks.js';

export { LOOKS, ACCENTS, SUBJECTS };

const GLB_BASE = new URL('./glb/', import.meta.url).href;
const L_SHADOW = 1, L_FILL = 2, L_OBJSHADOW = 3, L_HIDDEN = 4, L_GLOW = 5, L_STROKES = 6;
const L_LIVE = 7, L_PRE = 8, L_PRE_FIXED = 9, L_GHOST = 10;
const ORDER = { detail: 0, crease: 1, contour: 2, outline: 3 };
const DEG = Math.PI / 180;
const MOTIONS = ['orbit', 'tilt', 'float', 'none'];
const DEFAULT_MOTION = 'orbit';
const ORBIT = { angle: 24, period: 9.6, float: 0.008 };     // degrees either way, seconds per swing, bob amplitude
const TILT = { yaw: 26, pitch: 8, ease: 7 };                // degrees at the edge of the viewport, spring rate (1/s)
const FLOAT = { amp: 0.014, period: 4.8, twinkle: 2.4 };    // bob (fraction of the frame), seconds

/** Stroke multiplier for an illustration shown `css` px wide (1 at 800 px and above, up to 2.2 when small). */
export function optical(css) {
  return Math.max(1, Math.min(2.2, Math.pow(800 / Math.max(css, 1), 0.45)));
}

// ---------------------------------------------------------------------------------------------------- colours
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function hexLin(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255));
}
function linHex(rgb) {
  return '#' + rgb.map((c) => Math.round(Math.min(1, Math.max(0, toSrgb(c))) * 255).toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}
function oklch(hex) {
  const [r, g, b] = hexLin(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function fromOklch(L, C, H) {
  const rgbOf = (c) => {
    const A = c * Math.cos(H), B = c * Math.sin(H);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  };
  let lo = 0, hi = C;                        // keep the hue and lightness, reduce chroma into the sRGB gamut
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (rgbOf(mid).every((v) => v >= -1e-4 && v <= 1 + 1e-4)) lo = mid; else hi = mid;
  }
  return linHex(rgbOf(lo));
}

/** The kit's accent palette for a preset name or any hex colour: { light: [accent, shade], dark: [...], glow }. */
export function accentPalette(accent = 'indigo') {
  if (ACCENTS[accent]) return ACCENTS[accent];
  const [L, C, H] = oklch(accent);
  const dark = fromOklch(L + 0.044, C * 0.955, H);
  const [dL, dC] = oklch(dark);
  return { light: [accent, fromOklch(L * 0.661, C * 0.773, H)], dark: [dark, fromOklch(dL * 0.657, dC * 0.929, H)],
           glow: fromOklch(L + 0.078, C * 0.865, H) };
}

/** Resolve look + theme (+ glow) to the kit's style table entry. */
export function styleOf(look = 'mono', theme = 'light', glow = false) {
  const t = theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  const key = `${look}-${t}${look === 'mono' && t === 'dark' && glow ? '-glow' : ''}`;
  if (!LOOKS[key]) throw new Error(`empty-state: unknown look/theme "${key}"`);
  return { key, style: LOOKS[key], dark: t === 'dark' };
}

export function urlOf(name, base = GLB_BASE) {
  const s = SUBJECTS.find((x) => x[1] === name);
  if (!s) throw new Error(`empty-state: unknown illustration "${name}"`);
  return new URL(`ek-${String(s[0]).padStart(2, '0')}-${s[1]}.glb`, base).href;
}

// ---------------------------------------------------------------------------------------------------- shaders
const toneVertex = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
// Tone fill: shade amount from the world normal (Blender Z-up frame), identical to the kit's Blender material.
const toneFragment = /* glsl */ `
  uniform vec3 base; uniform vec3 shade; uniform vec3 kPos; uniform vec3 kNeg;
  uniform float power; uniform float opacity;
  varying vec3 vN;
  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    vec3 b = vec3(n.x, -n.z, n.y);
    vec3 w = pow(abs(b), vec3(power));
    vec3 k = mix(kNeg, kPos, step(0.0, b));
    float fac = dot(w, k) / max(w.x + w.y + w.z, 1e-6);
    gl_FragColor = vec4(mix(base, shade, fac), opacity);
    #include <colorspace_fragment>
  }`;
const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// A render target (premultiplied, linear) drawn over the canvas at some opacity
const layerFragment = /* glsl */ `
  uniform sampler2D map; uniform float opacity; varying vec2 vUv;
  void main() {
    vec4 t = texture2D(map, vUv);
    gl_FragColor = vec4(t.rgb / max(t.a, 1e-4), t.a * opacity);
    #include <colorspace_fragment>
  }`;
// Separable Gaussian blur (premultiplied, linear light like an SVG filter)
const blurFragment = /* glsl */ `
  uniform sampler2D map; uniform vec2 dir; uniform float sigma; varying vec2 vUv;
  void main() {
    vec4 acc = vec4(0.0); float wsum = 0.0;
    for (int i = -40; i <= 40; i++) {
      float x = float(i) * max(sigma, 0.5) / 13.0;
      float w = exp(-0.5 * x * x / (sigma * sigma + 1e-6));
      acc += texture2D(map, vUv + dir * x) * w; wsum += w;
    }
    gl_FragColor = acc / wsum;
  }`;
// Shadow masks: luminance = shadow amount
const shadowFragment = /* glsl */ `
  uniform sampler2D map; uniform vec3 color; uniform float opacity; varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(color, texture2D(map, vUv).r * opacity);
    #include <colorspace_fragment>
  }`;
const shadowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = vec2(uv.x, 1.0 - uv.y); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const groundVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// Depth pre-pass for the live strokes. Its colour carries the shadow falling on the objects: each surface point looks
// itself up in the iso view's shadow texture (where it was, before the turn), if it was seen there.
const preVertex = /* glsl */ `
  uniform mat4 unturn; uniform mat4 restVP;
  varying vec3 vRest;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vec4 r = restVP * (unturn * w);
    vRest = r.xyz / r.w;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const preFragment = /* glsl */ `
  uniform sampler2D shadowMap; uniform sampler2D restDepth; uniform float useShadow; uniform float bias;
  varying vec3 vRest;
  void main() {
    float s = 0.0;
    if (useShadow > 0.5) {
      vec2 uv = vRest.xy * 0.5 + 0.5;
      float seen = step(vRest.z * 0.5 + 0.5, texture2D(restDepth, uv).r + bias);
      s = texture2D(shadowMap, vec2(uv.x, 1.0 - uv.y)).r * seen;
    }
    gl_FragColor = vec4(s, 0.0, 0.0, 1.0);
  }`;

// Live strokes: one screen-space quad per segment (instanced). The fragment finds its point on the centre line, and
// tests that point (nudged off the surface along its normal, like the line engine's rays) against the depth pre-pass.
const strokeVertex = /* glsl */ `
  uniform vec2 res; uniform float hwMax; uniform vec3 toCam; uniform float eps; uniform float epsN; uniform float minNudge;
  attribute vec3 iA; attribute vec3 iB; attribute vec3 iNA; attribute vec3 iNB; attribute vec4 iInfo;
  attribute vec2 iDist;
  varying vec2 vP; varying vec4 vAB; varying vec4 vQ; varying vec2 vQZ; varying vec4 vInfo; varying vec2 vDist;
  vec3 toPx(vec3 w) {
    vec4 c = projectionMatrix * viewMatrix * vec4(w, 1.0);
    vec3 n = c.xyz / c.w;
    return vec3((n.xy * 0.5 + 0.5) * res, n.z * 0.5 + 0.5);
  }
  vec3 nudge(vec3 n) { return dot(n, n) > 1e-12 ? normalize(mat3(modelMatrix) * n) * epsN : vec3(0.0); }
  void main() {
    vec3 wa = (modelMatrix * vec4(iA, 1.0)).xyz, wb = (modelMatrix * vec4(iB, 1.0)).xyz;
    vec3 pa = toPx(wa), pb = toPx(wb);
    vec3 na = nudge(iNA), nb = nudge(iNB);
    if (iInfo.x > 1.5) {
      // a silhouette: test at least a pixel outside it, past the texel of its own curving surface
      float da = length(toPx(wa + na).xy - pa.xy), db = length(toPx(wb + nb).xy - pb.xy);
      na *= da > 1e-6 ? max(1.0, minNudge / da) : 1.0;
      nb *= db > 1e-6 ? max(1.0, minNudge / db) : 1.0;
    }
    vec3 qa = toPx(wa + toCam * eps + na), qb = toPx(wb + toCam * eps + nb);
    vec2 seg = pb.xy - pa.xy;
    float len = length(seg);
    vec2 along = len > 0.0001 ? seg / len : vec2(1.0, 0.0);
    vec2 across = vec2(-along.y, along.x);
    vec2 p = mix(pa.xy, pb.xy, position.y) + along * (position.y * 2.0 - 1.0) * hwMax + across * position.x * hwMax;
    vP = p; vAB = vec4(pa.xy, pb.xy); vQ = vec4(qa.xy, qb.xy); vQZ = vec2(qa.z, qb.z); vInfo = iInfo; vDist = iDist;
    gl_Position = vec4(p / res * 2.0 - 1.0, 0.0, 1.0);
  }`;
const strokeFragment = /* glsl */ `
  uniform sampler2D depthMap; uniform sampler2D ghostMap; uniform float useGhost;
  uniform vec2 res; uniform float unit; uniform vec4 hw; uniform float hwHidden; uniform float side; uniform float bias;
  uniform int mode; uniform vec3 ink; uniform vec3 accent; uniform vec3 glowColor; uniform float opacity;
  uniform vec2 dashHidden; uniform vec2 dashGhost;
  varying vec2 vP; varying vec4 vAB; varying vec4 vQ; varying vec2 vQZ; varying vec4 vInfo; varying vec2 vDist;
  float depthAt(vec2 p) { return texture2D(depthMap, p / res).r; }
  // the nearest surface's depth exactly at p: its texel's depth, extrapolated along the surface's slope (the
  // gentler one-sided difference, so a neighbouring silhouette doesn't skew it), as fine as the line engine's rays
  float surfaceAt(sampler2D map, vec2 p) {
    vec2 c = floor(p) + 0.5, px = 1.0 / res;
    float d = texture2D(map, c * px).r;
    if (d >= 1.0) return d;
    float l = texture2D(map, (c - vec2(1.0, 0.0)) * px).r, r = texture2D(map, (c + vec2(1.0, 0.0)) * px).r;
    float b = texture2D(map, (c - vec2(0.0, 1.0)) * px).r, t = texture2D(map, (c + vec2(0.0, 1.0)) * px).r;
    float gx = abs(d - l) < abs(r - d) ? d - l : r - d, gy = abs(d - b) < abs(t - d) ? d - b : t - d;
    return d + gx * (p.x - c.x) + gy * (p.y - c.y);
  }
  // distance from the fragment to the nearest dash (round caps) of this segment; s runs along the chain (px)
  float dashDistance(float along, float perp, float L, float sA, float k, float dash, float period) {
    float s = sA + k * along;
    float m = mod(s, period);
    float best = 1e9;
    for (int i = -1; i <= 1; i++) {
      float d0 = s - m + float(i) * period;
      float a0 = (d0 - sA) / k, a1 = (d0 + dash - sA) / k;
      float lo = max(min(a0, a1), 0.0), hi = min(max(a0, a1), L);
      if (lo > hi) continue;
      best = min(best, length(vec2(along - clamp(along, lo, hi), perp)));
    }
    return best;
  }
  void main() {
    vec2 a = vAB.xy, ab = vAB.zw - vAB.xy;
    float L2 = dot(ab, ab), L = sqrt(L2);
    float along = L > 1e-4 ? dot(vP - a, ab) / L : 0.0;
    float t = L > 1e-4 ? clamp(along / L, 0.0, 1.0) : 0.0;
    vec2 dir = L > 1e-4 ? ab / L : vec2(1.0, 0.0), nrm = vec2(-dir.y, dir.x);
    vec2 c = a + ab * t;
    float qz = mix(vQZ.x, vQZ.y, t);
    vec2 q = mix(vQ.xy, vQ.zw, t);
    bool vis = qz <= surfaceAt(depthMap, q) + bias;
    if (useGhost > 0.5 && vInfo.z > 1.5) vis = vis && qz <= surfaceAt(ghostMap, q) + bias;
    int cls = int(vInfo.x + 0.5);
    bool dashedObj = mod(vInfo.z, 2.0) > 0.5;
    float w;
    bool dashed = dashedObj;
    vec2 dash = dashGhost;
    if (mode == 1) {
      if (vis || cls == 0 || dashedObj) discard;
      w = hwHidden; dashed = true; dash = dashHidden;
    } else {
      if (!vis) discard;
      if (mode == 2 && vInfo.y < 0.5) discard;
      if (cls == 2) w = (depthAt(c + nrm * side) >= 1.0 || depthAt(c - nrm * side) >= 1.0) ? hw.w : hw.z;
      else w = cls == 1 ? hw.y : hw.x;
      if (dashedObj && dash.x <= 0.0) dash = vec2(4.4, 4.8) * w;
    }
    float dist = length(vP - c);
    float k = L > 1e-4 ? (vDist.y - vDist.x) * unit / L : 0.0;
    if (dashed && abs(k) > 1e-3) dist = dashDistance(along, dot(vP - a, nrm), L, vDist.x * unit, k, dash.x, dash.x + dash.y);
    float cov = clamp(w + 0.5 - dist, 0.0, 1.0);
    if (cov <= 0.0) discard;
    vec3 col = mode == 2 ? glowColor : (vInfo.y > 0.5 ? accent : ink);
    gl_FragColor = vec4(col, cov * opacity);
    #include <colorspace_fragment>
  }`;

// ---------------------------------------------------------------------------------------------------- shared GL
let GL = null;
function gl() {
  if (GL) return GL;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(1);
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const mk = (frag, extra = {}) => new THREE.ShaderMaterial({
    vertexShader: quadVertex, fragmentShader: frag, depthTest: false, depthWrite: false, transparent: true,
    uniforms: { map: { value: null }, opacity: { value: 1 }, dir: { value: new THREE.Vector2() },
                sigma: { value: 1 }, color: { value: new THREE.Color() } }, ...extra });
  GL = { renderer, quad, quadCam, quadScene, size: 0,
         layerMat: mk(layerFragment), blurMat: mk(blurFragment, { blending: THREE.NoBlending }),
         shadeMat: mk(shadowFragment), depthMat: new THREE.MeshDepthMaterial(),
         white: new THREE.DataTexture(new Float32Array([1, 1, 1, 1]), 1, 1, THREE.RGBAFormat, THREE.FloatType) };
  GL.white.needsUpdate = true;
  return GL;
}

function drawQuad(material) {
  const g = gl();
  g.quad.material = material;
  g.renderer.render(g.quadScene, g.quadCam);
}

function depthTarget(size, color = false) {
  const rt = new THREE.WebGLRenderTarget(size, size, { depthTexture: new THREE.DepthTexture(size, size, THREE.FloatType),
                                                       type: THREE.UnsignedByteType });
  rt.texture.minFilter = rt.texture.magFilter = color ? THREE.LinearFilter : THREE.NearestFilter;
  return rt;
}

// ---------------------------------------------------------------------------------------------------- loading
const CACHE = new Map();
function load(url) {
  if (!CACHE.has(url)) {
    CACHE.set(url, new GLTFLoader().loadAsync(url).then(async (gltf) => {
      const ek = gltf.scene.userData.ek || {};
      const tex = {};
      for (const k of ['ground', 'objects']) {
        const i = ek.shadow && ek.shadow[k];
        if (i != null) {
          tex[k] = await gltf.parser.getDependency('texture', i);
          tex[k].colorSpace = THREE.NoColorSpace;
        }
      }
      return { gltf, ek, tex, topo: await topology(gltf, ek) };
    }));
  }
  return CACHE.get(url);
}

/** The line topology the live strokes are computed from (see the kit's blender/ek/topo.py for the layout). */
async function topology(gltf, ek) {
  if (!ek.topo) return null;
  const buf = await gltf.parser.getDependency('bufferView', ek.topo.view);
  const objects = ek.topo.objects.map((o) => {
    const arr = (T, [off, n], w) => new T(buf, off, n * w);
    const q = arr(Int16Array, o.N, 3), N = new Float32Array(q.length);
    for (let i = 0; i < q.length; i++) N[i] = q[i] / 32767;
    return { ...o, P: arr(Float32Array, o.P, 3), N, E: arr(Uint16Array, o.E, 4), K: arr(Uint8Array, o.K, 1),
             T: arr(Uint16Array, o.T, 6), G: arr(Uint16Array, o.G, 3) };
  });
  return { objects, pivot: ek.topo.pivot };
}

// ---------------------------------------------------------------------------------------------------- live strokes
const STRIDE = 18;                       // a, b, offset normal at a, at b, (class, role, flags, -), dash distance a, b
const DETAIL = 0, CREASE = 1, CONTOUR = 2;
const KEYS = 2 ** 33;                    // per-object key space for chaining: vertices, then edge crossings

class LiveStrokes {
  constructor(topo) {
    this.objs = topo.objects.filter((o) => o.lines);
    let cap = 1;
    for (const o of this.objs) {
      cap += o.K.length + o.T.length / 6;
      o.g = new Float32Array(o.N.length / 3);
    }
    this.data = new Float32Array(cap * STRIDE);
    this.keyA = new Float64Array(cap);
    this.keyB = new Float64Array(cap);
    this.dashable = new Uint8Array(cap);
    this.seen = new Uint8Array(cap);
    this.len = new Float32Array(cap);
    this.ib = new THREE.InstancedInterleavedBuffer(this.data, STRIDE, 1).setUsage(THREE.DynamicDrawUsage);
    const geo = (this.geometry = new THREE.InstancedBufferGeometry());
    geo.setIndex([0, 1, 2, 2, 1, 3]);
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0], 3));
    const at = (name, size, off) => geo.setAttribute(name, new THREE.InterleavedBufferAttribute(this.ib, size, off));
    at('iA', 3, 0); at('iB', 3, 3); at('iNA', 3, 6); at('iNB', 3, 9); at('iInfo', 4, 12); at('iDist', 2, 16);
    geo.instanceCount = 0;
    this.n = 0;
  }

  /** Recompute the strokes for view direction v (toward the camera, in the model's rest frame). M: model -> clip,
   *  for dash distances. dashAll: hidden edges are drawn, so every stroke may need its dash distances. */
  update(v, M, dashAll) {
    const D = this.data, vx = v.x, vy = v.y, vz = v.z;
    let n = 0, o, role, flags, dashObj;
    const emit = (ax, ay, az, bx, by, bz, n0x, n0y, n0z, n1x, n1y, n1z, cls, ka, kb) => {
      const i = n * STRIDE;
      D[i] = ax; D[i + 1] = ay; D[i + 2] = az; D[i + 3] = bx; D[i + 4] = by; D[i + 5] = bz;
      D[i + 6] = n0x; D[i + 7] = n0y; D[i + 8] = n0z; D[i + 9] = n1x; D[i + 10] = n1y; D[i + 11] = n1z;
      D[i + 12] = cls; D[i + 13] = role; D[i + 14] = flags; D[i + 15] = 0; D[i + 16] = 0; D[i + 17] = 0;
      this.keyA[n] = ka; this.keyB[n] = kb;
      this.dashable[n] = dashObj || (dashAll && cls !== DETAIL) ? 1 : 0;
      n++;
    };
    const X = new Float64Array(14);      // two edge crossings: point, offset normal, key
    for (let oi = 0; oi < this.objs.length; oi++) {
      o = this.objs[oi];
      const { P, N, E, K, T, g } = o;
      role = o.role === 'accent' ? 1 : 0;
      flags = (o.dashed ? 1 : 0) + (o.ghost ? 2 : 0);
      dashObj = o.dashed;
      const base = oi * KEYS;
      for (let i = 0, j = 0; i < g.length; i++, j += 3) g[i] = N[j] * vx + N[j + 1] * vy + N[j + 2] * vz;
      // edges: feature edges by the facing of their two faces, the rest always
      for (let e = 0; e < K.length; e++) {
        const kind = K[e] & 3, a = E[4 * e], b = E[4 * e + 1], na = 3 * E[4 * e + 2], nb = 3 * E[4 * e + 3];
        let cls = DETAIL, x0 = 0, y0 = 0, z0 = 0, x1 = 0, y1 = 0, z1 = 0;
        if (kind === 0) {
          if ((g[na / 3] > 0) !== (g[nb / 3] > 0)) cls = CONTOUR;
          else if (K[e] & 4) cls = CREASE;
          else continue;
          x0 = x1 = N[na] + N[nb]; y0 = y1 = N[na + 1] + N[nb + 1]; z0 = z1 = N[na + 2] + N[nb + 2];
        } else if (kind === 1) {
          cls = CREASE;
          x0 = N[na]; y0 = N[na + 1]; z0 = N[na + 2]; x1 = N[nb]; y1 = N[nb + 1]; z1 = N[nb + 2];
        } else if (kind === 2) {
          cls = CONTOUR;
          const s = g[na / 3] >= 0 ? 1 : -1;
          x0 = x1 = s * N[na]; y0 = y1 = s * N[na + 1]; z0 = z1 = s * N[na + 2];
        }
        emit(P[3 * a], P[3 * a + 1], P[3 * a + 2], P[3 * b], P[3 * b + 1], P[3 * b + 2],
             x0, y0, z0, x1, y1, z1, cls, base + a, base + b);
      }
      // smooth triangles: the contour where the interpolated normal turns side-on (n.v = 0)
      const cross = (vi, vj, ni, nj, gi, gj, k) => {
        if (vi > vj) { let t = vi; vi = vj; vj = t; t = ni; ni = nj; nj = t; t = gi; gi = gj; gj = t; }
        const t = gi / (gi - gj), pi = 3 * vi, pj = 3 * vj;
        X[k] = P[pi] + t * (P[pj] - P[pi]); X[k + 1] = P[pi + 1] + t * (P[pj + 1] - P[pi + 1]);
        X[k + 2] = P[pi + 2] + t * (P[pj + 2] - P[pi + 2]);
        let nx = N[ni] + t * (N[nj] - N[ni]), ny = N[ni + 1] + t * (N[nj + 1] - N[ni + 1]);
        let nz = N[ni + 2] + t * (N[nj + 2] - N[ni + 2]);
        const d = nx * vx + ny * vy + nz * vz;
        nx -= vx * d; ny -= vy * d; nz -= vz * d;
        X[k + 3] = nx; X[k + 4] = ny; X[k + 5] = nz;
        X[k + 6] = base + 65536 * (vi + 1) + vj;
      };
      for (let t = 0; t < T.length; t += 6) {
        const v0 = T[t], v1 = T[t + 1], v2 = T[t + 2], n0 = 3 * T[t + 3], n1 = 3 * T[t + 4], n2 = 3 * T[t + 5];
        const g0 = g[n0 / 3] || 1e-12, g1 = g[n1 / 3] || 1e-12, g2 = g[n2 / 3] || 1e-12;
        const s0 = g0 > 0, s1 = g1 > 0, s2 = g2 > 0;
        if (s0 === s1 && s1 === s2) continue;
        let k = 0;
        if (s0 !== s1) { cross(v0, v1, n0, n1, g0, g1, k); k = 7; }
        if (s1 !== s2) { cross(v1, v2, n1, n2, g1, g2, k); k = 7; }
        if (s2 !== s0) cross(v2, v0, n2, n0, g2, g0, k);
        if (Math.abs(X[0] - X[7]) + Math.abs(X[1] - X[8]) + Math.abs(X[2] - X[9]) < 1e-9) continue;
        emit(X[0], X[1], X[2], X[7], X[8], X[9], X[3], X[4], X[5], X[10], X[11], X[12], CONTOUR, X[6], X[13]);
      }
    }
    this.n = n;
    this.distances(M);
    this.ib.clearUpdateRanges();
    this.ib.addUpdateRange(0, n * STRIDE);
    this.ib.needsUpdate = true;
    this.geometry.instanceCount = n;
  }

  /** Dash distances along chained strokes, in canvas units (1000 across the frame), as the PNG/SVG dashes run. */
  distances(M) {
    const n = this.n, D = this.data, e = M.elements, ka = this.keyA, kb = this.keyB, dsh = this.dashable;
    const seen = this.seen, len = this.len, ends = new Map();
    let any = false;
    for (let s = 0; s < n; s++) {
      seen[s] = 0;
      if (!dsh[s]) continue;
      any = true;
      const i = s * STRIDE;
      const ax = e[0] * D[i] + e[4] * D[i + 1] + e[8] * D[i + 2], ay = e[1] * D[i] + e[5] * D[i + 1] + e[9] * D[i + 2];
      const bx = e[0] * D[i + 3] + e[4] * D[i + 4] + e[8] * D[i + 5];
      const by = e[1] * D[i + 3] + e[5] * D[i + 4] + e[9] * D[i + 5];
      len[s] = 500 * Math.hypot(bx - ax, by - ay);
      for (const k of [ka[s], kb[s]]) {
        const l = ends.get(k);
        if (l === undefined) ends.set(k, s); else if (typeof l === 'number') ends.set(k, [l, s]); else l.push(s);
      }
    }
    if (!any) return;
    const next = (k, s) => {
      const l = ends.get(k);
      if (typeof l === 'number') return -1;
      for (const x of l) if (x !== s && !seen[x]) return x;
      return -1;
    };
    for (let s = 0; s < n; s++) {
      if (!dsh[s] || seen[s]) continue;
      let cur = s, enter = ka[s];
      for (let steps = 0; steps <= n; steps++) {          // back to the chain's open end (or once round a loop)
        const p = next(enter, cur);
        if (p < 0 || p === s) break;
        enter = ka[p] === enter ? kb[p] : ka[p];
        cur = p;
      }
      let acc = 0;
      while (cur >= 0 && !seen[cur]) {
        seen[cur] = 1;
        const i = cur * STRIDE;
        let exit;
        if (ka[cur] === enter) { D[i + 16] = acc; D[i + 17] = acc + len[cur]; exit = kb[cur]; }
        else { D[i + 17] = acc; D[i + 16] = acc + len[cur]; exit = ka[cur]; }
        acc += len[cur];
        enter = exit;
        cur = next(exit, cur);
      }
    }
  }

  dispose() { this.geometry.dispose(); }
}

function strokeMaterial() {
  const g = gl();
  return new THREE.ShaderMaterial({
    vertexShader: strokeVertex, fragmentShader: strokeFragment, transparent: true, depthTest: false,
    depthWrite: false, side: THREE.DoubleSide,
    uniforms: {
      res: { value: new THREE.Vector2(1, 1) }, unit: { value: 1 }, hwMax: { value: 4 }, toCam: { value: new THREE.Vector3() },
      eps: { value: 0 }, epsN: { value: 0 }, minNudge: { value: 1 }, bias: { value: 0 }, side: { value: 2 },
      hw: { value: new THREE.Vector4() }, hwHidden: { value: 1 }, mode: { value: 0 },
      dashHidden: { value: new THREE.Vector2() }, dashGhost: { value: new THREE.Vector2() },
      depthMap: { value: g.white }, ghostMap: { value: g.white }, useGhost: { value: 0 },
      ink: { value: new THREE.Color() }, accent: { value: new THREE.Color() }, glowColor: { value: new THREE.Color() },
      opacity: { value: 1 },
    },
  });
}

// ---------------------------------------------------------------------------------------------------- one illustration
class Illustration {
  constructor(asset, opts) {
    this.asset = asset;
    this.opts = { look: 'mono', theme: 'light', accent: 'indigo', glow: false, lineScale: 1, motion: DEFAULT_MOTION,
                  hiddenEdges: true, yaw: 0, pitch: 0, phase: 0, ...opts };
    this.t0 = performance.now();
    this.tilt = { yaw: 0, pitch: 0, tx: 0, ty: 0, last: 0 };
    this.isLive = false;
    this.build();
  }

  build() {
    const { gltf, ek, tex, topo } = this.asset;
    const scene = (this.scene = new THREE.Scene());            // a Scene (the GLTF root is a Group): overrideMaterial
    scene.add(gltf.scene.clone(true));
    scene.updateMatrixWorld(true);
    const cam = (this.camera = gltf.cameras[0].clone());
    // the GLB camera sits under a node; use its world transform directly
    const src = gltf.cameras[0];
    src.updateMatrixWorld(true);
    src.matrixWorld.decompose(cam.position, cam.quaternion, cam.scale);
    cam.updateMatrixWorld(true);
    this.rest = cam.position.clone();
    this.restQ = cam.quaternion.clone();
    this.frame = cam.top - cam.bottom;
    this.up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    this.meshes = [];
    this.lineNodes = [];
    scene.traverse((o) => {
      if (o.isMesh) this.meshes.push(o);
      else if ((o.isLineSegments || o.isLine) && o.userData && o.userData.cls) this.lineNodes.push(o);
    });
    // lift (the float) > turn (about the vertical through the pivot) > rest: the model in its iso-view place.
    // Sparkles only float; the ground shadow only turns.
    const pivot = new THREE.Vector3().fromArray(topo ? topo.pivot : [0, 0, 0]);
    const turnGroup = () => {
      const turn = new THREE.Group(), rest = new THREE.Group();
      turn.position.copy(pivot);
      rest.position.copy(pivot).negate();
      turn.add(rest);
      return [turn, rest];
    };
    this.lift = new THREE.Group();
    [this.turn, this.restGroup] = turnGroup();
    [this.groundTurn, this.groundRest] = turnGroup();
    this.lift.add(this.turn);
    scene.add(this.lift, this.groundTurn);
    scene.updateMatrixWorld(true);
    const spark = (name) => /^spark/.test(name || '');
    for (const m of this.meshes) {
      (spark(m.name) ? this.lift : this.restGroup).attach(m);
      m.userData.role = m.userData.ek_role || (m.parent && m.parent.userData.ek_role) || 'body';
      m.layers.set(L_FILL);
    }
    this.box = new THREE.Box3();
    for (const m of this.meshes) if (!spark(m.name)) this.box.expandByObject(m);
    // strokes: one LineSegments2 per line set; distances are measured on screen (canvas units), like SVG dashes
    const v = new THREE.Vector3();
    const toCanvas = (p) => { v.copy(p).project(cam); return [(v.x + 1) * 500, (1 - v.y) * 500]; };
    this.strokes = [];
    for (const l of this.lineNodes) {
      l.visible = false;
      const geo = new LineSegmentsGeometry().fromLineSegments(l);
      const pos = l.geometry.attributes.position;
      const d = new Float32Array(pos.count);
      const a = new THREE.Vector3(), b = new THREE.Vector3();
      let acc = 0;
      for (let i = 0; i < pos.count; i += 2) {
        a.fromBufferAttribute(pos, i).applyMatrix4(l.matrixWorld);
        b.fromBufferAttribute(pos, i + 1).applyMatrix4(l.matrixWorld);
        const [ax, ay] = toCanvas(a), [bx, by] = toCanvas(b);
        d[i] = acc;
        acc += Math.hypot(bx - ax, by - ay);
        d[i + 1] = acc;
      }
      const ib = new THREE.InstancedInterleavedBuffer(d, 2, 1);
      geo.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(ib, 1, 0));
      geo.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(ib, 1, 1));
      const s = new LineSegments2(geo, new LineMaterial({ worldUnits: false, depthTest: false, transparent: true }));
      s.userData = { ...l.userData };
      s.matrixAutoUpdate = false;
      s.matrix.copy(l.matrixWorld);
      s.renderOrder = 10 + (ORDER[s.userData.cls] || 0);
      s.frustumCulled = false;
      (s.userData.obj ? this.lift : this.restGroup).add(s);
      this.strokes.push(s);
    }
    // sparkles twinkle: scale their mesh and their own line sets about the sparkle's centre
    this.sparks = new Map();
    for (const s of this.strokes) {
      const o = s.userData.obj;
      if (!o) continue;
      if (!this.sparks.has(o)) this.sparks.set(o, { items: [], box: new THREE.Box3() });
      const sp = this.sparks.get(o);
      s.geometry.computeBoundingBox();
      sp.box.union(s.geometry.boundingBox.clone().applyMatrix4(s.matrix));
      sp.items.push({ o: s, m0: s.matrix.clone() });
    }
    for (const m of this.meshes) {
      const sp = this.sparks.get(m.name);
      if (sp) {
        m.matrixAutoUpdate = false;
        m.updateMatrix();
        sp.items.push({ o: m, m0: m.matrix.clone() });
      }
    }
    let i = 0;
    for (const sp of this.sparks.values()) { sp.c = sp.box.getCenter(new THREE.Vector3()); sp.phase = 2.1 * i++; }
    // shadows. The ground shadow lies on the ground: the iso view's texture projected onto it (it turns with the
    // model; the kit's sun is straight above). The baked shadow on the objects floats with them in the iso view.
    const shadowMat = (texture, vertex = shadowVertex) => new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: shadowFragment, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { map: { value: texture }, color: { value: new THREE.Color() }, opacity: { value: 0 } } });
    this.groundShadow = null;
    if (tex.ground) {
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      const pos = [], uv = [];
      for (const [x, y] of [[-2, -2], [2, -2], [2, 2], [-2, 2]]) {     // twice the frame: it still covers it turned
        const p = new THREE.Vector3(x, y, -1).unproject(cam);
        p.addScaledVector(fwd, -p.y / fwd.y);
        pos.push(p.x, 0, p.z);
        uv.push(x * 0.5 + 0.5, 0.5 - y * 0.5);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex([0, 1, 2, 0, 2, 3]);
      const q = (this.groundShadow = new THREE.Mesh(geo, shadowMat(tex.ground, groundVertex)));
      tex.ground.wrapS = tex.ground.wrapT = THREE.ClampToEdgeWrapping;
      q.frustumCulled = false;
      q.layers.set(L_SHADOW);
      this.groundRest.add(q);
    }
    this.objShadow = null;
    if (tex.objects) {
      const q = (this.objShadow = new THREE.Mesh(new THREE.PlaneGeometry(cam.right - cam.left, cam.top - cam.bottom),
                                                 shadowMat(tex.objects)));
      q.frustumCulled = false;
      q.position.set((cam.left + cam.right) / 2, (cam.top + cam.bottom) / 2, -cam.near - 1);
      q.applyMatrix4(cam.matrixWorld);
      q.layers.set(L_OBJSHADOW);
      this.lift.add(q);
    }
    scene.add(cam);
    this.apply();
  }

  /** Live strokes, the ghosts' own depth and the pre-pass layers: made the first time the model turns. */
  ensureLive() {
    if (this.live) return true;
    const topo = this.asset.topo;
    if (!topo) return false;
    this.live = new LiveStrokes(topo);
    this.liveMesh = new THREE.Mesh(this.live.geometry, strokeMaterial());
    this.liveMesh.frustumCulled = false;
    this.liveMesh.layers.set(L_LIVE);
    this.restGroup.add(this.liveMesh);
    this.ghosts = [];
    for (const o of topo.objects) {
      if (!o.ghost || !o.G.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(o.P, 3));
      geo.setIndex(new THREE.BufferAttribute(o.G, 1));
      const m = new THREE.Mesh(geo, gl().depthMat);
      m.layers.set(L_GHOST);
      m.frustumCulled = false;
      this.restGroup.add(m);
      this.ghosts.push(m);
    }
    for (const m of this.meshes) {
      if (m.userData.ek_nooccl || m.userData.role === 'glass') continue;
      m.layers.enable(/^spark/.test(m.name) ? L_PRE_FIXED : L_PRE);
    }
    const cam = this.camera;
    cam.updateMatrixWorld(true);
    this.restVP = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const pre = (useShadow) => new THREE.ShaderMaterial({
      vertexShader: preVertex, fragmentShader: preFragment, side: THREE.DoubleSide,
      uniforms: { unturn: { value: new THREE.Matrix4() }, restVP: { value: this.restVP },
                  shadowMap: { value: this.asset.tex.objects || gl().white }, restDepth: { value: gl().white },
                  useShadow: { value: useShadow && this.asset.tex.objects ? 1 : 0 }, bias: { value: 2e-5 } } });
    this.preMat = pre(true);
    this.preFixedMat = pre(false);
    this.ghostMat = new THREE.ShaderMaterial({ vertexShader: preVertex, fragmentShader: preFragment,
      side: THREE.DoubleSide,
      uniforms: { unturn: { value: new THREE.Matrix4() }, restVP: { value: this.restVP },
                  shadowMap: { value: gl().white }, restDepth: { value: gl().white }, useShadow: { value: 0 },
                  bias: { value: 0 } } });
    this.restDepthPending = true;
    this.poseKey = '';
    return true;
  }

  /** Switch between the baked iso strokes and the live ones. */
  setLive(on) {
    if (on && !this.ensureLive()) on = false;
    if (on === this.isLive) return;
    this.isLive = on;
    this.size = 0;
    this.apply();
  }

  /** Apply look, theme, accent and stroke sizes to the materials. */
  apply() {
    const o = this.opts;
    const { key, style, dark } = styleOf(o.look, o.theme, o.glow);
    this.key = key;
    this.style = style;
    const pal = accentPalette(o.accent);
    const mono = o.look === 'mono';
    const [acc, accShade] = mono ? (dark ? pal.dark : pal.light)
      : [style.fill ? style.fill.roles.accent : null, style.fill ? (style.fill.accent_shade || style.fill.shade) : null];
    const f = style.fill;
    this.fillOpacity = f ? (f.opacity ?? 1) : 0;
    for (const m of this.meshes) {
      const role = m.userData.role;
      if (m.material && m.material.isShaderMaterial) m.material.dispose();
      if (!f) continue;
      const k = f.k;
      const glass = role === 'glass';
      m.material = new THREE.ShaderMaterial({
        vertexShader: toneVertex, fragmentShader: toneFragment, side: THREE.DoubleSide,
        transparent: glass, depthWrite: !glass,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
        uniforms: {
          base: { value: new THREE.Color(role === 'accent' ? acc : (f.roles[role] || f.roles.body)) },
          shade: { value: new THREE.Color(role === 'accent' ? accShade : f.shade) },
          kPos: { value: new THREE.Vector3(k['+x'], k['+y'], k['+z']) },
          kNeg: { value: new THREE.Vector3(k['-x'], k['-y'], k['-z']) },
          power: { value: f.power || 2.0 },
          opacity: { value: glass ? (f.glass_alpha ?? 0.45) : 1.0 },
        },
      });
      m.renderOrder = glass ? 2 : 0;
    }
    const sh = style.shadow;
    for (const q of [this.groundShadow, this.objShadow]) {
      if (!q) continue;
      q.visible = !!sh;
      if (sh) { q.material.uniforms.color.value.set(sh.color); q.material.uniforms.opacity.value = sh.opacity; }
    }
    this.glowColor = style.glow ? (o.glow && pal.glow ? pal.glow : style.glow.color) : null;
    const hidden = (this.hidden = !!(style.lines.hidden && o.hiddenEdges && (!f || style.lines.hidden.over_fill)));
    for (const s of this.strokes) {
      const x = s.userData;
      const show = (x.vis === 'visible' || (hidden && x.vis === 'hidden' && x.cls !== 'detail' && !x.dashed) === true)
        && (!this.isLive || !!x.obj);
      s.visible = show;
      s.layers.set(x.vis === 'hidden' ? L_HIDDEN : L_STROKES);
      if (x.vis === 'hidden') {
        if (!show) continue;
        s.material.color.set(style.lines.color.ink);
        s.material.opacity = style.lines.hidden.opacity;
      } else {
        s.material.color.set(style.lines.color[x.role] || style.lines.color.ink);
        s.material.opacity = 1;
      }
      s.material.dashed = x.vis === 'hidden' || !!x.dashed;
      s.material.needsUpdate = true;
    }
    if (this.liveMesh) {
      const u = this.liveMesh.material.uniforms;
      u.ink.value.set(style.lines.color.ink);
      u.accent.value.set(style.lines.color.accent || style.lines.color.ink);
      if (this.glowColor) u.glowColor.value.set(this.glowColor);
      this.poseKey = '';                       // hidden edges on or off change which strokes need dash distances
    }
    this.size = 0;                              // stroke widths are set on the next draw (they depend on size)
  }

  set(opts) {
    Object.assign(this.opts, opts);
    this.apply();
  }

  setSizes(css, px) {
    if (this.size === px && this.css === css) return;
    this.size = px;
    this.css = css;
    const style = this.style;
    const lw = optical(css) * (this.opts.lineScale || 1);
    this.lw = lw;
    const unit = px / 1000;                         // device px per canvas unit
    for (const s of this.strokes) {
      const x = s.userData;
      const m = s.material;
      m.resolution.set(px, px);
      if (x.vis === 'hidden') {
        const h = style.lines.hidden;
        if (!h) continue;
        m.linewidth = h.width * lw * unit;
        m.dashSize = h.dash[0] * lw;
        m.gapSize = h.dash[1] * lw;
      } else {
        const w = style.lines.width[x.cls] * lw;
        m.linewidth = w * unit;
        const g = style.lines.ghost_dash || [2.2 * w, 2.4 * w];
        m.dashSize = g[0];
        m.gapSize = g[1];
      }
    }
    const mkRT = () => new THREE.WebGLRenderTarget(px, px, { type: THREE.HalfFloatType, samples: 4 });
    for (const k of ['rtFill', 'rtGlow', 'rtBlur', 'rtHidden', 'rtPre', 'rtGhost']) {
      if (this[k]) { if (this[k].depthTexture) this[k].depthTexture.dispose(); this[k].dispose(); }
      this[k] = null;
    }
    if (this.fillOpacity && this.fillOpacity < 1) this.rtFill = mkRT();
    if (this.glowColor) {
      this.rtGlow = mkRT();
      this.rtBlur = new THREE.WebGLRenderTarget(px, px, { type: THREE.HalfFloatType });
    }
    if (this.isLive) {
      const L = style.lines, u = this.liveMesh.material.uniforms, wd = L.width;
      const half = (w) => (w * lw * unit) / 2;
      u.res.value.set(px, px);
      u.unit.value = unit;
      u.hw.value.set(half(wd.detail), half(wd.crease), half(wd.contour), half(wd.outline));
      u.hwHidden.value = L.hidden ? half(L.hidden.width) : 0.5;
      u.hwMax.value = Math.max(half(wd.outline), u.hwHidden.value) + 1.5;
      u.side.value = 2.2 * unit;
      u.dashHidden.value.set(L.hidden ? L.hidden.dash[0] * lw * unit : 0, L.hidden ? L.hidden.dash[1] * lw * unit : 0);
      u.dashGhost.value.set(L.ghost_dash ? L.ghost_dash[0] * lw * unit : 0, L.ghost_dash ? L.ghost_dash[1] * lw * unit : 0);
      const world = this.frame / 1000;            // world units per canvas unit
      u.eps.value = 0.15 * world;
      u.epsN.value = 0.35 * world;
      // depth tolerance: the line engine's own (0.15 canvas units) or 0.4 px, whichever is larger (the depth
      // pre-pass resolves surfaces to a fraction of a pixel)
      u.bias.value = Math.max(0.15 * world, (0.4 * this.frame) / px) / (this.camera.far - this.camera.near);
      this.rtPre = depthTarget(px, true);
      u.depthMap.value = this.rtPre.depthTexture;
      if (this.ghosts.length) { this.rtGhost = depthTarget(px); u.ghostMap.value = this.rtGhost.depthTexture; }
      u.useGhost.value = this.ghosts.length ? 1 : 0;
      if (this.hidden) this.rtHidden = new THREE.WebGLRenderTarget(px, px, { type: THREE.HalfFloatType });
    }
  }

  /** The pose for time t (seconds) under a motion; returns the float offset (fraction of the frame). */
  animate(t, motion) {
    const o = this.opts;
    const tt = t + (+o.phase || 0);
    const bob = motion === 'float' ? FLOAT.amp : motion === 'orbit' ? ORBIT.float : 0;
    const h = bob * Math.sin((2 * Math.PI * tt) / FLOAT.period);         // up is positive; the loops line up at 9.6 s
    let yaw = (+o.yaw || 0) * DEG, pitch = (+o.pitch || 0) * DEG;
    if (motion === 'orbit') yaw += ORBIT.angle * DEG * Math.sin((2 * Math.PI * tt) / ORBIT.period);
    if (motion === 'tilt') { yaw += this.tilt.yaw; pitch += this.tilt.pitch; }
    this.setLive(true);                         // the baked iso strokes only if the GLB has no topology
    this.lift.position.copy(this.up).multiplyScalar(h * this.frame);
    this.turn.rotation.y = this.groundTurn.rotation.y = this.isLive ? yaw : 0;
    const cam = this.camera;
    cam.position.copy(this.rest);
    cam.quaternion.copy(this.restQ);
    if (this.isLive && pitch) {
      // turn the camera up or down about the model's centre (on the view axis, so the frame stays centred)
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.restQ);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.restQ);
      const c = this.rest.clone().addScaledVector(fwd, this.box.getCenter(new THREE.Vector3()).sub(this.rest).dot(fwd));
      const q = new THREE.Quaternion().setFromAxisAngle(right, -pitch);
      cam.position.sub(c).applyQuaternion(q).add(c);
      cam.quaternion.premultiply(q);
    }
    cam.updateMatrixWorld(true);
    if (this.groundShadow && this.style.shadow) {
      this.groundShadow.material.uniforms.opacity.value = this.style.shadow.opacity * (1 - 6 * Math.max(0, h));
    }
    const S = new THREE.Matrix4(), T1 = new THREE.Matrix4(), T2 = new THREE.Matrix4();
    for (const sp of this.sparks.values()) {
      const k = motion !== 'none' ? 1 + 0.09 * Math.sin((2 * Math.PI * tt) / FLOAT.twinkle + sp.phase) : 1;
      T1.makeTranslation(-sp.c.x, -sp.c.y, -sp.c.z);
      S.makeScale(k, k, k);
      T2.makeTranslation(sp.c.x, sp.c.y, sp.c.z);
      const M = T2.clone().multiply(S).multiply(T1);
      for (const it of sp.items) {
        it.o.matrix.copy(M).multiply(it.m0);
        it.o.matrixWorldNeedsUpdate = true;
      }
    }
    this.scene.updateMatrixWorld(true);
    if (this.isLive) {
      const key = `${yaw.toFixed(6)}|${pitch.toFixed(6)}`;
      if (key !== this.poseKey) {
        this.poseKey = key;
        const toCam = new THREE.Vector3(0, 0, 1).applyQuaternion(cam.quaternion);
        const v = toCam.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -yaw);
        const M = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
          .multiply(this.restGroup.matrixWorld);
        this.live.update(v, M, this.hidden);
        this.liveMesh.material.uniforms.toCam.value.copy(toCam);
      }
      this.yaw = yaw;
      this.pitch = pitch;
    }
    return h;
  }

  /** Project a point of the model (rest frame, glTF Y-up) or of the ground (ground: true) to canvas units. */
  canvasOf(p, ground = false) {
    const v = new THREE.Vector3().fromArray(p);
    if (!ground) v.applyMatrix4(this.restGroup.matrixWorld);
    v.project(this.camera);
    return [(v.x + 1) * 500, (1 - v.y) * 500];
  }

  prepass(px) {
    const g = gl(), r = g.renderer, cam = this.camera, scene = this.scene;
    const pass = (layer, mat) => { scene.overrideMaterial = mat; cam.layers.set(layer); r.render(scene, cam); };
    if (this.restDepthPending) {
      // depth of the iso view, once: which surfaces the object-shadow texture saw
      this.restDepthPending = false;
      const saved = [this.turn.rotation.y, this.lift.position.clone(), cam.position.clone(), cam.quaternion.clone()];
      this.turn.rotation.y = 0;
      this.lift.position.set(0, 0, 0);
      cam.position.copy(this.rest);
      cam.quaternion.copy(this.restQ);
      scene.updateMatrixWorld(true);
      this.rtRest = depthTarget(768);
      r.setRenderTarget(this.rtRest);
      r.clear(true, true, true);
      pass(L_PRE, this.ghostMat);
      this.preMat.uniforms.restDepth.value = this.rtRest.depthTexture;
      [this.turn.rotation.y] = saved;
      this.lift.position.copy(saved[1]);
      cam.position.copy(saved[2]);
      cam.quaternion.copy(saved[3]);
      scene.updateMatrixWorld(true);
    }
    const unturn = new THREE.Matrix4().copy(this.restGroup.matrixWorld).invert();
    this.preMat.uniforms.unturn.value.copy(unturn);
    r.setRenderTarget(this.rtPre);
    r.clear(true, true, true);
    pass(L_PRE, this.preMat);
    pass(L_PRE_FIXED, this.preFixedMat);
    if (this.rtGhost) {
      r.setRenderTarget(this.rtGhost);
      r.clear(true, true, true);
      pass(L_GHOST, this.ghostMat);
    }
    scene.overrideMaterial = null;
  }

  draw(px) {
    const g = gl();
    const r = g.renderer;
    const cam = this.camera;
    const live = this.isLive;
    const pass = (layer) => { cam.layers.set(layer); r.render(this.scene, cam); };
    const u = live ? this.liveMesh.material.uniforms : null;
    const livePass = (mode, opacity = 1) => { u.mode.value = mode; u.opacity.value = opacity; pass(L_LIVE); };
    if (live) this.prepass(px);
    r.setRenderTarget(null);
    r.setViewport(0, 0, px, px);
    r.setScissor(0, 0, px, px);
    r.setScissorTest(true);
    r.clear(true, true, true);
    if (this.groundShadow && this.groundShadow.visible) pass(L_SHADOW);
    if (this.style.fill) {
      if (this.rtFill) {
        r.setRenderTarget(this.rtFill);
        r.clear(true, true, true);
        pass(L_FILL);
        r.setRenderTarget(null);
        g.layerMat.uniforms.map.value = this.rtFill.texture;
        g.layerMat.uniforms.opacity.value = this.fillOpacity;
        drawQuad(g.layerMat);
      } else {
        pass(L_FILL);
      }
      r.clearDepth();
    }
    const sh = this.style.shadow;
    if (live) {
      if (sh && sh.on_objects && this.asset.tex.objects && this.style.fill) {
        g.shadeMat.uniforms.map.value = this.rtPre.texture;
        g.shadeMat.uniforms.color.value.set(sh.color);
        g.shadeMat.uniforms.opacity.value = sh.opacity;
        drawQuad(g.shadeMat);
      }
      if (this.rtHidden) {
        r.setRenderTarget(this.rtHidden);
        r.clear(true, true, true);
        livePass(1);
        r.setRenderTarget(null);
        g.layerMat.uniforms.map.value = this.rtHidden.texture;
        g.layerMat.uniforms.opacity.value = this.style.lines.hidden.opacity;
        drawQuad(g.layerMat);
      }
    } else {
      if (this.objShadow && this.objShadow.visible) pass(L_OBJSHADOW);
      pass(L_HIDDEN);
    }
    if (this.glowColor && this.rtGlow) {
      const gs = this.style.glow;
      const saved = [];
      for (const s of this.strokes) {
        if (!s.visible || s.userData.vis !== 'visible' || s.userData.role !== 'accent') continue;
        saved.push([s, s.material.color.getHex()]);
        s.material.color.set(this.glowColor);
        s.layers.enable(L_GLOW);
      }
      r.setRenderTarget(this.rtGlow);
      r.clear(true, true, true);
      pass(L_GLOW);
      if (live) livePass(2);
      for (const [s, c] of saved) { s.material.color.setHex(c); s.layers.disable(L_GLOW); }
      const sigma = gs.blur * Math.min(this.lw, 1.5) * (px / 1000);
      g.blurMat.uniforms.sigma.value = sigma;
      g.blurMat.uniforms.map.value = this.rtGlow.texture;
      g.blurMat.uniforms.dir.value.set(1 / px, 0);
      r.setRenderTarget(this.rtBlur);
      drawQuad(g.blurMat);
      g.blurMat.uniforms.map.value = this.rtBlur.texture;
      g.blurMat.uniforms.dir.value.set(0, 1 / px);
      r.setRenderTarget(this.rtGlow);
      drawQuad(g.blurMat);
      r.setRenderTarget(null);
      g.layerMat.uniforms.map.value = this.rtGlow.texture;
      g.layerMat.uniforms.opacity.value = gs.opacity;
      drawQuad(g.layerMat);
    }
    if (live) livePass(0);
    pass(L_STROKES);
    r.setScissorTest(false);
  }

  dispose() {
    for (const m of this.meshes) if (m.material && m.material.dispose) m.material.dispose();
    for (const s of this.strokes) { s.geometry.dispose(); s.material.dispose(); }
    for (const k of ['rtFill', 'rtGlow', 'rtBlur', 'rtHidden', 'rtPre', 'rtGhost', 'rtRest']) {
      if (this[k]) { if (this[k].depthTexture) this[k].depthTexture.dispose(); this[k].dispose(); }
    }
    if (this.live) {
      this.live.dispose();
      this.liveMesh.material.dispose();
      for (const m of [this.preMat, this.preFixedMat, this.ghostMat]) m.dispose();
      for (const m of this.ghosts) m.geometry.dispose();
    }
  }
}

// ---------------------------------------------------------------------------------------------------- 2D overlays
const SVGNS = 'http://www.w3.org/2000/svg';
const pathD = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L');

/** Blueprint grid (stays put) and construction guides (move with the object), as SVG in canvas units. `proj` maps
 *  a 3D point (glTF Y-up) to the canvas: ground points with ground = true; null = the fixed iso projection. */
function blueprintSvg(ek, style, lw, proj = null) {
  const g = style.grid, G = ek.guides;
  const iso = (p) => {                                   // ek.origin / ek.axes project Blender Z-up points
    const o = ek.origin, ax = ek.axes;
    return [o[0] + p[0] * ax.x[0] + p[1] * ax.y[0] + p[2] * ax.z[0], o[1] + p[0] * ax.x[1] + p[1] * ax.y[1] + p[2] * ax.z[1]];
  };
  let grid = '', guides = '';
  if (g && ek.origin) {
    const n = Math.floor(g.extent / g.step), ds = [];
    for (let i = -n; i <= n; i++) {
      const v = i * g.step;
      for (const [a, b] of [[[v, -g.extent, 0], [v, g.extent, 0]], [[-g.extent, v, 0], [g.extent, v, 0]]]) {
        ds.push(pathD(proj ? [proj([a[0], 0, -a[1]], true), proj([b[0], 0, -b[1]], true)] : [iso(a), iso(b)]));
      }
    }
    grid = `<defs><radialGradient id="f" cx="500" cy="500" r="475" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity=".6"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <mask id="m"><rect width="1000" height="1000" fill="url(#f)"/></mask></defs>
      <g mask="url(#m)" stroke="${g.color}" stroke-opacity="${g.opacity}" stroke-width="1" fill="none">
      ${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
  }
  const gu = style.guides;
  if (gu && G) {
    const w = gu.width * lw;
    const sty = {
      footprint: `stroke-width="${w * 0.8}" stroke-dasharray="${(w * 3).toFixed(1)} ${(w * 3).toFixed(1)}"`,
      ext: `stroke-width="${w * 0.8}"`, dim: `stroke-width="${w}"`, tick: `stroke-width="${w * 1.6}"`,
      axis: `stroke-width="${w * 0.8}" stroke-dasharray="${(w * 9).toFixed(1)} ${(w * 3).toFixed(1)} ${(w * 1.2).toFixed(1)} ${(w * 3).toFixed(1)}"`,
    };
    const pts = (l) => (proj && l.pts3 ? l.pts3.map((p) => proj(p)) : l.pts);
    guides += `<g stroke="${gu.color}" stroke-opacity="${gu.opacity}" fill="none" stroke-linecap="round">`;
    for (const kind of ['footprint', 'ext', 'dim', 'tick', 'axis']) {
      const ds = G.lines.filter((l) => l.kind === kind).map((l) => `<path d="${pathD(pts(l))}"/>`);
      if (ds.length) guides += `<g ${sty[kind]}>${ds.join('')}</g>`;
    }
    guides += '</g>';
    const fs = (gu.font_size || 13) * Math.min(lw, 1.6);
    for (const lb of G.labels) {
      let [[ux, uy], [vx, vy], [px, py]] = [lb.u, lb.v, lb.pos];
      if (proj && lb.mid3) {
        const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
        const unitv = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
        const pa = proj(lb.mid3);
        [ux, uy] = unitv(pa, proj(add(lb.mid3, lb.d3)));
        [vx, vy] = unitv(pa, proj(add(lb.mid3, lb.n3)));
        if (ux < 0) { ux = -ux; uy = -uy; }
        [px, py] = pa;
      }
      guides += `<text transform="matrix(${ux} ${uy} ${-vx} ${-vy} ${px} ${py})" font-family="PT Mono, ui-monospace, Menlo, monospace" font-size="${fs}" text-anchor="middle" fill="${gu.color}" fill-opacity="${Math.min(1, gu.opacity * 1.3)}">${lb.text}</text>`;
    }
  }
  return { grid, guides };
}

// ---------------------------------------------------------------------------------------------------- mounting
const LIVE = new Set();
let raf = 0;
let CLOCK = null;
let POINTER = null;
/** Drive every illustration's animation from your own clock (seconds), e.g. to sync or record; null = real time. */
export function setClock(fn) { CLOCK = fn; for (const v of LIVE) v.render(v.now()); }
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function tick() {
  raf = 0;
  const now = performance.now();
  let any = false;
  for (const v of LIVE) {
    if (!v.visible) continue;
    const moving = v.motion() !== 'none' && v.ill.opts.loop !== false;
    if (moving || v.dirty) v.render(CLOCK ? CLOCK() : (now - v.ill.t0) / 1000);   // still ones only when changed
    any = any || moving;
  }
  if (any) raf = requestAnimationFrame(tick);
}
function schedule() { if (!raf) raf = requestAnimationFrame(tick); }
function watchPointer() {
  if (watchPointer.on) return;
  watchPointer.on = true;
  addEventListener('pointermove', (e) => { POINTER = [e.clientX, e.clientY]; schedule(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { POINTER = null; schedule(); });
  addEventListener('blur', () => { POINTER = null; schedule(); });
}

/**
 * Draw an illustration into `host` (any element; it gets a canvas and, for Blueprint, two SVG layers).
 * opts: name | url, look, theme, accent, glow, lineScale, motion ('orbit' | 'tilt' | 'float' | 'none'), yaw, pitch
 * (degrees), phase (seconds), hiddenEdges, base (GLB folder URL), loop (false: no animation loop; draw frames
 * yourself with renderAt(seconds), e.g. to record a video).
 * Returns { set(opts), render(), renderAt(seconds), dispose(), illustration }.
 */
export async function mountEmptyState(host, opts = {}) {
  const url = opts.url || urlOf(opts.name, opts.base);
  const asset = await load(url);
  if (opts.float === false && !opts.motion) opts = { ...opts, motion: 'none' };
  const ill = new Illustration(asset, opts);
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const layer = (tag) => {
    const el = document.createElementNS(tag === 'canvas' ? 'http://www.w3.org/1999/xhtml' : SVGNS, tag);
    el.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none');
    if (tag === 'svg') { el.setAttribute('viewBox', '0 0 1000 1000'); el.setAttribute('aria-hidden', 'true'); }
    host.appendChild(el);
    return el;
  };
  const under = layer('svg'), guides = layer('svg'), canvas = layer('canvas'), ctx = canvas.getContext('2d');
  canvas.setAttribute('role', 'img');
  const title = (SUBJECTS.find((s) => url.includes(`-${s[1]}.glb`)) || [])[3] || '';
  if (title) canvas.setAttribute('aria-label', title);
  let svgKey = '';
  const view = {
    ill, visible: true, dirty: true,
    now: () => (CLOCK ? CLOCK() : (performance.now() - ill.t0) / 1000),
    motion: () => {
      const m = MOTIONS.includes(ill.opts.motion) ? ill.opts.motion : DEFAULT_MOTION;
      return reduced() ? 'none' : m;
    },
    /** tilt: ease toward the pointer (its offset from the element's centre, relative to the viewport) */
    tilt() {
      const s = ill.tilt, now = performance.now();
      const dt = Math.min(0.1, s.last ? (now - s.last) / 1000 : 0);
      s.last = now;
      let tx = 0, ty = 0;
      if (POINTER) {
        const r = host.getBoundingClientRect();
        const clamp = (x) => Math.max(-1, Math.min(1, x));
        tx = clamp((POINTER[0] - (r.left + r.width / 2)) / Math.max(innerWidth / 2, r.width));
        ty = clamp((POINTER[1] - (r.top + r.height / 2)) / Math.max(innerHeight / 2, r.height));
      }
      const k = 1 - Math.exp(-TILT.ease * dt);
      s.yaw += (tx * TILT.yaw * DEG - s.yaw) * k;
      s.pitch += (ty * TILT.pitch * DEG - s.pitch) * k;
    },
    render(t = 0) {
      view.dirty = false;
      const css = Math.max(1, Math.round(host.clientWidth || 240));
      const px = Math.round(css * Math.min(window.devicePixelRatio || 1, 2));
      const g = gl();
      if (px > g.size) { g.size = px; g.renderer.setSize(px, px, false); }
      const motion = view.motion();
      if (motion === 'tilt') { watchPointer(); view.tilt(); }
      const h = ill.animate(t, motion);
      ill.setSizes(css, px);
      if (ill.isLive) {
        const sk = `${ill.key}|${ill.lw.toFixed(3)}|${ill.poseKey}|${ill.lift.position.y.toFixed(5)}`;
        if (sk !== svgKey && (ill.style.grid || ill.style.guides)) {
          const s = blueprintSvg(ill.asset.ek, ill.style, ill.lw, (p, ground) => ill.canvasOf(p, ground));
          under.innerHTML = s.grid;
          guides.innerHTML = s.guides;
        } else if (sk !== svgKey) { under.innerHTML = guides.innerHTML = ''; }
        svgKey = sk;
        guides.style.transform = '';
      } else {
        const sk = `${ill.key}|${ill.lw.toFixed(3)}`;
        if (sk !== svgKey) {
          svgKey = sk;
          const s = blueprintSvg(ill.asset.ek, ill.style, ill.lw);
          under.innerHTML = s.grid;
          guides.innerHTML = s.guides;
        }
        guides.style.transform = `translateY(${(-h * 100).toFixed(3)}%)`;
      }
      ill.draw(px);
      if (canvas.width !== px) { canvas.width = canvas.height = px; }
      ctx.clearRect(0, 0, px, px);
      ctx.drawImage(g.renderer.domElement, 0, g.size - px, px, px, 0, 0, px, px);
    },
  };
  // guides sit under the fill (Blueprint), so the canvas goes on top of both SVG layers
  host.appendChild(canvas);
  const io = new IntersectionObserver((es) => {
    view.visible = es[es.length - 1].isIntersecting;
    view.dirty = true;
    schedule();
  });
  io.observe(host);
  const ro = new ResizeObserver(() => { view.render(view.now()); });
  ro.observe(host);
  LIVE.add(view);
  view.render(view.now());
  if (view.motion() !== 'none') schedule();
  return {
    illustration: ill,
    render: () => view.render(view.now()),
    /** Draw the animation at a given time (seconds), e.g. to record frames. */
    renderAt: (seconds) => view.render(seconds),
    set(o) {
      if (o.float === false && !o.motion) o = { ...o, motion: 'none' };
      else if (o.float === true && !o.motion && ill.opts.motion === 'none') o = { ...o, motion: 'float' };
      ill.set(o); svgKey = ''; view.render(view.now()); if (view.motion() !== 'none') schedule();
    },
    dispose() { LIVE.delete(view); io.disconnect(); ro.disconnect(); ill.dispose(); under.remove(); guides.remove(); canvas.remove(); },
  };
}

// ---------------------------------------------------------------------------------------------------- <empty-state>
const ATTRS = ['name', 'src', 'look', 'theme', 'accent', 'glow', 'bold', 'line-scale', 'motion', 'yaw', 'pitch', 'phase',
               'float', 'hidden-edges'];
export class EmptyStateElement extends HTMLElement {
  static get observedAttributes() { return ATTRS; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>:host{display:inline-block;width:240px;aspect-ratio:1/1;position:relative;vertical-align:middle}
      :host([hidden]){display:none} div{position:absolute;inset:0}</style><div part="art"></div>`;
    this.box = root.querySelector('div');
  }
  options() {
    const a = (n, d) => (this.hasAttribute(n) ? this.getAttribute(n) : d);
    const bool = (n, d) => (this.hasAttribute(n) ? this.getAttribute(n) !== 'false' : d);
    const num = (n) => parseFloat(a(n, '0')) || 0;
    return {
      name: a('name'), url: a('src') || undefined, look: a('look', 'mono'), theme: a('theme', 'light'),
      accent: a('accent', 'indigo'), glow: bool('glow', false),
      motion: a('motion', bool('float', true) ? DEFAULT_MOTION : 'none'),
      yaw: num('yaw'), pitch: num('pitch'), phase: num('phase'),
      hiddenEdges: bool('hidden-edges', true),
      lineScale: parseFloat(a('line-scale', '1')) * (bool('bold', false) ? BOLD : 1),
    };
  }
  async connectedCallback() {
    if (this.view || this.loading) return;
    this.loading = true;
    try {
      const o = this.options();
      const view = await mountEmptyState(this.box, o);
      if (!this.isConnected) { view.dispose(); return; }
      this.view = view;
      const now = this.options();                // attributes may have changed while the GLB was loading
      if (now.name !== o.name || now.url !== o.url) { view.dispose(); this.view = null; this.loading = false;
                                                      return this.connectedCallback(); }
      if (JSON.stringify(now) !== JSON.stringify(o)) view.set(now);
      this.dispatchEvent(new Event('load'));
    } catch (e) {
      console.error(e);
      this.dispatchEvent(new Event('error'));
    } finally {
      this.loading = false;
    }
  }
  disconnectedCallback() { if (this.view) { this.view.dispose(); this.view = null; } }
  attributeChangedCallback(n, a, b) {
    if (!this.view || a === b) return;
    if (n === 'name' || n === 'src') { this.view.dispose(); this.view = null; this.connectedCallback(); return; }
    this.view.set(this.options());
  }
}
if (!customElements.get('empty-state')) customElements.define('empty-state', EmptyStateElement);

// re-theme 'auto' elements when the system theme changes
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  for (const v of LIVE) if (v.ill.opts.theme === 'auto') { v.ill.apply(); v.render(0); }
});
