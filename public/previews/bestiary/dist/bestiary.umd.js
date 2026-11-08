/*!
 * Bestiary — Interactive point-cloud birds and beasts
 * v1.0.0 · zero dependencies · Canvas 2D
 * Sold under the UI8 license. Fonts in dist/fonts are SIL OFL.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define(factory);
  else root.Bestiary = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';
/*
 * Specimen engine — shared by every point-cloud set (Herbarium, Bestiary, …).
 *
 * A species is grown from geometry with a seeded random source, projected by
 * hand onto a 2D canvas, and framed in a plate with a tag and a label. The
 * build script bundles this file with a product's species pack into one
 * dependency-free ESM and UMD file.
 */

const VERSION = '1.0.0';
const TAU = Math.PI * 2;
/** The golden angle, 137.5°, which is how seed heads and rose petals pack. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Filled in by the product bundle (see build.mjs). */
const PRODUCT = { name: 'Specimen', slug: 'specimen', attr: 'specimen', version: VERSION };
/** Filled in by the product's species pack. */
const SPECIES = {};

/* ────────────────────────────────────────────────────────────────────────────
   Deterministic random
   Every specimen is built from a seed, so the same seed always grows the same
   one. Change the seed to get a sibling.
   ──────────────────────────────────────────────────────────────────────────── */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   Vector helpers
   Specimen space: +y is up, the renderer turns the specimen about +y and looks
   down at it by the species' `lean`.
   ──────────────────────────────────────────────────────────────────────────── */

function rotX(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function rotY(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c };
}

function rotZ(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

function unitSphere(rand) {
  const theta = rand() * TAU;
  const phi = Math.acos(2 * rand() - 1);
  const sinPhi = Math.sin(phi);
  return { x: sinPhi * Math.cos(theta), y: sinPhi * Math.sin(theta), z: Math.cos(phi) };
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Two unit vectors perpendicular to `d` (and to each other). */
function basis(d) {
  const ref = Math.abs(d.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  const u = normalize({
    x: ref.y * d.z - ref.z * d.y,
    y: ref.z * d.x - ref.x * d.z,
    z: ref.x * d.y - ref.y * d.x,
  });
  const v = { x: d.y * u.z - d.z * u.y, y: d.z * u.x - d.x * u.z, z: d.x * u.y - d.y * u.x };
  return { u, v };
}

/* ────────────────────────────────────────────────────────────────────────────
   Geometry primitives
   Everything takes `rand` first so a species can be rebuilt identically.
   Points are { x, y, z, shell } — shell 0 is the surface (largest, darkest
   dots), 1 is the mid layer, 2 is the faint core. A `paint` callback can
   choose the shell per point, or return -1 to leave the point out.
   ──────────────────────────────────────────────────────────────────────────── */

/** Half-width of a blade along its length, u = 0 at the base, 1 at the tip. */
const PROFILES = {
  ovate: (u) => Math.pow(Math.sin(Math.PI * (0.06 + u * 0.94)), 0.55),
  round: (u) => Math.pow(Math.sin(Math.PI * (0.12 + u * 0.72)), 0.5),
  lanceolate: (u) => Math.pow(Math.sin(Math.PI * (0.08 + u * 0.92)), 1.15),
  ray: (u) => (0.62 + 0.38 * Math.sin(Math.PI * u)) * (u > 0.92 ? Math.sqrt((1 - u) / 0.08) : 1),
  leaf: (u) => Math.pow(Math.sin(Math.PI * (0.02 + u * 0.98)), 0.7),
  oval: (u) => Math.pow(Math.sin(Math.PI * (0.1 + u * 0.8)), 0.45),
  wing: (u) => Math.pow(Math.sin(Math.PI * (0.06 + u * 0.9)), 0.35) * (1 - 0.3 * u),
};

/**
 * A blade: petal, leaf, wing, feather. It grows outward along +x from radius
 * `r0`, is tilted up by `tilt` radians, then swung around the axis by `yaw`.
 *
 *   curl   > 0 bends the tip toward the axis (a cup), < 0 bends it away
 *   bow    bulges the middle of the blade: < 0 outward (a tulip), > 0 inward
 *   cross  lifts the edges into a channel
 *   twist  rotates the blade about its own length, in radians at the tip
 *   rise   shifts the whole blade up after placement
 *   at     [x, y, z] offset after placement, for leaves on a stem or wings on a body
 *   veins  number of dotted lines drawn along the blade
 *   veinShell / veinDots  layer and dots-per-line for those veins (0 / 10)
 *   paint  (u, v) => shell | -1, per random point
 */
function petal(rand, o = {}) {
  const {
    count = 120,
    shell = 0,
    yaw = 0,
    tilt = 0,
    r0 = 0.05,
    length = 0.4,
    width = 0.12,
    profile = 'ovate',
    curl = 0,
    bow = 0,
    cross = 0.3,
    twist = 0,
    rise = 0,
    ruffle = 0,
    thickness = 0.012,
    veins = 0,
    veinShell = 0,
    veinDots = 10,
    at = null,
    paint = null,
  } = o;
  const prof = typeof profile === 'function' ? profile : PROFILES[profile] || PROFILES.ovate;
  const out = [];

  const place = (u, v, sh, thick) => {
    const w = width * prof(u);
    const x = r0 + u * length;
    let y = curl * u * u * length + bow * Math.sin(Math.PI * u) * length + cross * v * v * w + thick;
    let z = v * w;
    if (ruffle) y += Math.sin(v * 7.6 + u * 4.8) * u * u * ruffle;
    if (twist) {
      const a = twist * u;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const y2 = y * c - z * s;
      z = y * s + z * c;
      y = y2;
    }
    const p = rotY(rotZ({ x, y, z }, tilt), yaw);
    p.y += rise;
    if (at) {
      p.x += at[0];
      p.y += at[1];
      p.z += at[2];
    }
    return { x: p.x, y: p.y, z: p.z, shell: sh };
  };

  for (let i = 0; i < count; i += 1) {
    const u = rand();
    const v = rand() * 2 - 1;
    const sh = paint ? paint(u, v) : shell;
    if (sh < 0) continue;
    out.push(place(u, v, sh, (rand() - 0.5) * thickness));
  }
  for (let k = 0; k < veins; k += 1) {
    const v0 = veins === 1 ? 0 : (k / (veins - 1) - 0.5) * 1.5;
    for (let i = 0; i < veinDots; i += 1) {
      const u = 0.06 + (i / (veinDots - 1)) * 0.88;
      out.push(place(u, v0 * (0.35 + u * 0.65), veinShell, (rand() - 0.5) * thickness * 0.4));
    }
  }
  return out;
}

/** A sunflower-style spiral disc: `count` seeds packed at the golden angle. */
function fermat(rand, o = {}) {
  const {
    count = 200,
    radius = 0.15,
    dome = 0,
    y = 0,
    shell = 0,
    jitter = 0.004,
    start = 0,
    shellRule = null,
    at = null,
  } = o;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const r = radius * Math.sqrt(t);
    const a = i * GOLDEN + start;
    out.push({
      x: Math.cos(a) * r + (rand() - 0.5) * jitter + (at ? at[0] : 0),
      y: y + dome * Math.sqrt(1 - t) + (rand() - 0.5) * jitter + (at ? at[1] : 0),
      z: Math.sin(a) * r + (rand() - 0.5) * jitter + (at ? at[2] : 0),
      shell: shellRule ? shellRule(i, t) : shell,
    });
  }
  return out;
}

/** A ring of dots at height `y`, flat in the xz plane unless `normal` is given. */
function ring(rand, o = {}) {
  const { count = 40, radius = 0.1, y = 0, shell = 0, jitter = 0.004, at = null, normal = null } = o;
  const out = [];
  const frame = normal ? basis(normalize({ x: normal[0], y: normal[1], z: normal[2] })) : null;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU + (rand() - 0.5) * (TAU / count) * 0.6;
    const ca = Math.cos(a) * radius;
    const sa = Math.sin(a) * radius;
    const px = frame ? frame.u.x * ca + frame.v.x * sa : ca;
    const py = frame ? frame.u.y * ca + frame.v.y * sa : 0;
    const pz = frame ? frame.u.z * ca + frame.v.z * sa : sa;
    out.push({
      x: px + (rand() - 0.5) * jitter + (at ? at[0] : 0),
      y: py + y + (rand() - 0.5) * jitter + (at ? at[1] : 0),
      z: pz + (rand() - 0.5) * jitter + (at ? at[2] : 0),
      shell,
    });
  }
  return out;
}

/** A dotted straight line, for filaments, ribs and veins. */
function line(rand, o = {}) {
  const { from = [0, 0, 0], to = [0, 1, 0], count = 8, shell = 0, jitter = 0 } = o;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    out.push({
      x: from[0] + (to[0] - from[0]) * t + (rand() - 0.5) * jitter,
      y: from[1] + (to[1] - from[1]) * t + (rand() - 0.5) * jitter,
      z: from[2] + (to[2] - from[2]) * t + (rand() - 0.5) * jitter,
      shell,
    });
  }
  return out;
}

/**
 * A tube of dots along a polyline `path` ([[x, y, z], …]): necks, legs,
 * antennae, beaks, abdomens. `taper` shrinks the radius linearly toward the
 * end; `profile(t)` instead multiplies the radius by any curve you like (a
 * bushy tail, a bulging segment). `paint(t, angle)` can band it (return -1
 * to skip).
 */
function tube(rand, o = {}) {
  const { path = [[0, 0, 0], [0, 1, 0]], radius = 0.02, count = 40, shell = 0, taper = 0, profile = null, jitter = 0, paint = null } = o;
  const out = [];
  const segs = [];
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    segs.push({ a, b, len, start: total });
    total += len;
  }
  if (!total) return out;
  for (let i = 0; i < count; i += 1) {
    const t = rand();
    const d = t * total;
    let seg = segs[segs.length - 1];
    for (const s of segs) {
      if (d <= s.start + s.len) {
        seg = s;
        break;
      }
    }
    const k = seg.len ? (d - seg.start) / seg.len : 0;
    const dir = normalize({ x: seg.b[0] - seg.a[0], y: seg.b[1] - seg.a[1], z: seg.b[2] - seg.a[2] });
    const { u, v } = basis(dir);
    const angle = rand() * TAU;
    const sh = paint ? paint(t, angle) : shell;
    if (sh < 0) continue;
    const r = radius * (profile ? profile(t) : 1 - taper * t);
    const ca = Math.cos(angle) * r;
    const sa = Math.sin(angle) * r;
    out.push({
      x: seg.a[0] + (seg.b[0] - seg.a[0]) * k + u.x * ca + v.x * sa + (rand() - 0.5) * jitter,
      y: seg.a[1] + (seg.b[1] - seg.a[1]) * k + u.y * ca + v.y * sa + (rand() - 0.5) * jitter,
      z: seg.a[2] + (seg.b[2] - seg.a[2]) * k + u.z * ca + v.z * sa + (rand() - 0.5) * jitter,
      shell: sh,
    });
  }
  return out;
}

/**
 * An ellipsoid — a shell of points, or a solid fill. `paint(p, d)` gets the
 * placed point and its unit direction from the center; return a shell or -1.
 */
function ellipsoid(rand, o = {}) {
  const { count = 60, rx = 0.1, ry = 0.1, rz = 0.1, at = [0, 0, 0], shell = 0, fill = false, paint = null } = o;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const d = unitSphere(rand);
    const t = fill ? Math.cbrt(rand()) * 0.88 : 0.88 + 0.12 * rand();
    const p = { x: at[0] + d.x * rx * t, y: at[1] + d.y * ry * t, z: at[2] + d.z * rz * t };
    const sh = paint ? paint(p, d) : shell;
    if (sh < 0) continue;
    out.push({ x: p.x, y: p.y, z: p.z, shell: sh });
  }
  return out;
}

/** A stem hanging down from `top`, with a slight bend at the base. */
function stem(rand, o = {}) {
  const { count = 60, top = 0, length = 0.6, radius = 0.016, bend = 0.03, shell = 0, taper = 0.12 } = o;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const t = rand();
    const a = rand() * TAU;
    const r = radius * (1 - t * taper);
    out.push({
      x: Math.cos(a) * r + t * t * bend,
      y: top - t * length,
      z: Math.sin(a) * r,
      shell: t < 0.25 ? 1 : shell,
    });
  }
  return out;
}

/** Copies of `points` reflected across an axis plane. Build one wing, mirror it. */
function mirror(points, axis = 'z') {
  return points.map((p) => ({ ...p, [axis]: -p[axis] }));
}

/** Move every point through `fn(point) → { x, y, z }`, in place. */
function transform(points, fn) {
  for (const p of points) {
    const q = fn(p);
    p.x = q.x;
    p.y = q.y;
    p.z = q.z;
  }
  return points;
}

/**
 * Center the specimen and scale it so its farthest point sits at radius `fit`
 * (the canvas shows ±1). The species' `lean` is not baked in here: the
 * renderer applies it as camera pitch, so the specimen turns on its own axis
 * and its face stays toward the viewer through the whole rotation.
 */
function finish(points, o = {}) {
  const { fit = 0.92, center = 'bounds' } = o;
  const n = points.length;
  if (!n) return points;

  let cx = 0;
  let cy = 0;
  let cz = 0;
  if (center === 'centroid') {
    for (const p of points) {
      cx += p.x;
      cy += p.y;
      cz += p.z;
    }
    cx /= n;
    cy /= n;
    cz /= n;
  } else {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;
    cz = (minZ + maxZ) / 2;
  }

  let maxR = 0;
  for (const p of points) {
    p.x -= cx;
    p.y -= cy;
    p.z -= cz;
    maxR = Math.max(maxR, Math.hypot(p.x, p.y, p.z));
  }
  const s = fit / (maxR || 1);
  for (const p of points) {
    p.x *= s;
    p.y *= s;
    p.z *= s;
  }
  return points;
}

const geometry = {
  petal,
  fermat,
  ring,
  line,
  tube,
  ellipsoid,
  stem,
  mirror,
  transform,
  finish,
  rotX,
  rotY,
  rotZ,
  unitSphere,
  normalize,
  basis,
  PROFILES,
  GOLDEN,
  TAU,
};

/* ────────────────────────────────────────────────────────────────────────────
   Renderer
   ──────────────────────────────────────────────────────────────────────────── */

/** Surface / mid / core dot sizes and opacities. */
const LAYERS = [
  { size: 1.55, alpha: 0.9 },
  { size: 1.2, alpha: 0.48 },
  { size: 0.95, alpha: 0.28 },
];

const DEFAULTS = {
  /** A key from SPECIES, or { build(rand, n) } / { points }. */
  species: null,
  /** Same seed, same specimen. */
  seed: 7,
  /** Multiplies every point count. 0.5 halves the work on weak devices. */
  density: 1,
  /** Dot color. 'auto' reads the --sp-dot CSS variable off the canvas. */
  ink: 'auto',
  /** Optional solid clear color; leave null and let CSS paint the canvas. */
  background: null,
  layers: LAYERS,
  /** Multiplies dot radius. */
  dotScale: 1,
  /**
   * Let dots grow gently with the canvas (square root of size / 480px), so a
   * 300px plate stays airy and an 800px hero doesn't look thin. false = fixed.
   */
  dotResponsive: true,
  /** Specimen radius as a fraction of the canvas's short side. */
  scale: 0.44,
  perspective: 2.6,
  /** Radians per millisecond. 0 stops the turntable. */
  spin: 0.00022,
  /** Yaw the specimen starts at. */
  restYaw: 0.52,
  /** Extra camera pitch, radians, on top of the species' own. Positive looks further down. */
  pitch: 0,
  /** How far the pointer tilts the specimen. 0 disables parallax. */
  tilt: 1,
  /** Press-and-drag scatter. */
  scatter: true,
  scatterRadius: 0.4,
  scatterForce: 0.058,
  spring: 0.03,
  damping: 0.88,
  scatterMax: 0.82,
  /** Mouse hover scatters too (touch always needs a press). */
  hoverScatter: true,
  /** 'auto' follows prefers-reduced-motion; true or false forces it. */
  reducedMotion: 'auto',
  /** Stop the frame loop while the canvas is off screen. */
  pauseOffscreen: true,
  maxDpr: 2,
};

function createSpecimen(canvas, options = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new Error(`${PRODUCT.name}: createSpecimen needs a <canvas> element`);
  }
  const ctx = canvas.getContext('2d');
  const opts = { ...DEFAULTS, ...options };
  if (!opts.species) opts.species = Object.keys(SPECIES)[0] || null;

  let count = 0;
  let px;
  let py;
  let pz;
  let shells;
  let ox;
  let oy;
  let oz;
  let vx;
  let vy;
  let vz;
  let jx;
  let jy;
  let jz;
  let depths;
  let order;
  /** The species' own camera pitch; opts.pitch is added on top. */
  let lean = 0;

  let width = 0;
  let height = 0;
  let size = 0;
  let yaw = opts.restYaw;
  let tx = 0;
  let ty = 0;
  let ex = 0;
  let ey = 0;
  let pointerOn = false;
  let pointerX = 0;
  let pointerY = 0;
  let burst = 1;
  let impulse = null;
  let settled = true;

  let frame = 0;
  let running = false;
  let visible = true;
  let lastTime = 0;
  let destroyed = false;
  let reduced = false;
  let ink = '#121212';
  let inkTick = 0;

  const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

  const resolveReduced = () => (opts.reducedMotion === 'auto' ? !!(mq && mq.matches) : !!opts.reducedMotion);

  const resolveInk = () => {
    if (opts.ink !== 'auto') return opts.ink;
    const v = getComputedStyle(canvas).getPropertyValue('--sp-dot').trim();
    return v || '#121212';
  };

  const build = () => {
    const rand = mulberry32(opts.seed);
    const n = (c) => Math.max(1, Math.round(c * opts.density));
    let spec = opts.species;
    if (typeof spec === 'string') {
      const found = SPECIES[spec];
      if (!found) throw new Error(`${PRODUCT.name}: unknown species "${spec}"`);
      spec = found;
    }
    let built;
    if (spec && typeof spec.build === 'function') {
      built = spec.build(rand, n);
    } else if (spec && Array.isArray(spec.points)) {
      built = { points: spec.points.map((p) => ({ ...p })), lean: spec.lean, fit: spec.fit, center: spec.center };
    } else {
      throw new Error(`${PRODUCT.name}: a species needs build(rand, n) or points[]`);
    }
    const points = finish(built.points, { fit: built.fit ?? 0.92, center: built.center || 'bounds' });
    lean = built.lean ?? 0;

    count = points.length;
    px = new Float32Array(count);
    py = new Float32Array(count);
    pz = new Float32Array(count);
    shells = new Uint8Array(count);
    ox = new Float32Array(count);
    oy = new Float32Array(count);
    oz = new Float32Array(count);
    vx = new Float32Array(count);
    vy = new Float32Array(count);
    vz = new Float32Array(count);
    jx = new Float32Array(count);
    jy = new Float32Array(count);
    jz = new Float32Array(count);
    depths = new Float32Array(count);
    order = new Uint32Array(count);
    for (let i = 0; i < count; i += 1) {
      px[i] = points[i].x;
      py[i] = points[i].y;
      pz[i] = points[i].z;
      shells[i] = Math.min(2, Math.max(0, points[i].shell | 0));
      const j = unitSphere(rand);
      jx[i] = j.x;
      jy[i] = j.y;
      jz[i] = j.z;
      order[i] = i;
    }
    settled = true;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    size = Math.min(width, height);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ink = resolveInk();
  };

  const draw = (dt) => {
    ctx.clearRect(0, 0, width, height);
    if (opts.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, width, height);
    }
    if (!count || size === 0) return;

    if ((inkTick += 1) % 20 === 0 && opts.ink === 'auto') ink = resolveInk();

    /* Frame-rate independence: k is "how many 60 fps frames" elapsed. */
    const k = Math.min(dt, 50) / 16.667;
    const ease = 1 - Math.pow(0.95, k);
    ex += (tx - ex) * ease;
    ey += (ty - ey) * ease;
    if (!reduced) yaw += opts.spin * dt;

    const tiltAmt = reduced ? 0 : opts.tilt;
    const ay = yaw + ex * 0.6 * tiltAmt;
    const ax = lean + opts.pitch + ey * 0.5 * tiltAmt;
    const cosY = Math.cos(ay);
    const sinY = Math.sin(ay);
    const cosX = Math.cos(ax);
    const sinX = Math.sin(ax);

    const cx = width / 2;
    const cy = height / 2 + size * 0.02;
    const P = opts.perspective;
    const proj = size * opts.scale * P;
    const radius = size * opts.scatterRadius;

    const scattering = opts.scatter && (pointerOn || impulse);
    const physics = scattering || !settled;
    const springK = opts.spring * k;
    const damp = Math.pow(opts.damping, k);
    const forceK = opts.scatterForce * burst * k;
    const max = opts.scatterMax;
    const ix = impulse ? impulse.x : pointerX;
    const iy = impulse ? impulse.y : pointerY;
    let maxOffset = 0;

    for (let i = 0; i < count; i += 1) {
      const x = px[i];
      const y = py[i];
      const z = pz[i];

      if (physics) {
        if (scattering) {
          const hx = x * cosY - z * sinY;
          const hz = x * sinY + z * cosY;
          const hy = y * cosX - hz * sinX;
          const hd = 1 / (P - (y * sinX + hz * cosX));
          const dx = cx + hx * proj * hd - ix;
          const dy = cy - hy * proj * hd - iy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) {
            const falloff = (1 - dist / radius) ** 2;
            const inv = 1 / (dist || 1);
            const force = falloff * forceK;
            vx[i] += (dx * inv * 0.72 + jx[i] * 0.28) * force;
            vy[i] += (-dy * inv * 0.72 + jy[i] * 0.28) * force;
            vz[i] += jz[i] * force * 0.9;
          }
        }
        vx[i] -= ox[i] * springK;
        vy[i] -= oy[i] * springK;
        vz[i] -= oz[i] * springK;
        vx[i] *= damp;
        vy[i] *= damp;
        vz[i] *= damp;
        ox[i] = Math.max(-max, Math.min(max, ox[i] + vx[i]));
        oy[i] = Math.max(-max, Math.min(max, oy[i] + vy[i]));
        oz[i] = Math.max(-max, Math.min(max, oz[i] + vz[i]));
        const m = Math.abs(ox[i]) + Math.abs(oy[i]) + Math.abs(oz[i]) + Math.abs(vx[i]) + Math.abs(vy[i]) + Math.abs(vz[i]);
        if (m > maxOffset) maxOffset = m;
      }

      const wx = x + ox[i];
      const wy = y + oy[i];
      const wz = z + oz[i];
      const z1 = wx * sinY + wz * cosY;
      depths[i] = wy * sinX + z1 * cosX;
      order[i] = i;
    }

    if (physics) {
      if (!scattering && maxOffset < 0.0008) {
        ox.fill(0);
        oy.fill(0);
        oz.fill(0);
        vx.fill(0);
        vy.fill(0);
        vz.fill(0);
        settled = true;
      } else {
        settled = false;
      }
    }
    impulse = null;
    burst += (1 - burst) * (1 - Math.pow(0.88, k));

    order.sort((a, b) => depths[a] - depths[b]);

    ctx.fillStyle = ink;
    const layers = opts.layers;
    const responsive = opts.dotResponsive ? Math.min(1.5, Math.max(0.75, Math.sqrt(size / 480))) : 1;
    const dot = opts.dotScale * P * responsive;
    for (let o = 0; o < count; o += 1) {
      const i = order[o];
      const wx = px[i] + ox[i];
      const wy = py[i] + oy[i];
      const wz = pz[i] + oz[i];
      const x1 = wx * cosY - wz * sinY;
      const z1 = wx * sinY + wz * cosY;
      const y2 = wy * cosX - z1 * sinX;
      const depth = 1 / (P - depths[i]);
      const layer = layers[shells[i]] || layers[0];
      ctx.globalAlpha = Math.min(1, layer.alpha * (0.28 + depth * 1.5));
      ctx.beginPath();
      ctx.arc(cx + x1 * proj * depth, cy - y2 * proj * depth, layer.size * depth * dot, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const tick = (now) => {
    if (!running) return;
    const dt = lastTime ? Math.min(now - lastTime, 100) : 16.7;
    lastTime = now;
    draw(dt);
    if (reduced && settled && !pointerOn) {
      /* Reduced motion: nothing moves on its own, so idle until the next press. */
      running = false;
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || destroyed) return;
    running = true;
    lastTime = 0;
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const kick = () => {
    if (destroyed || !visible || document.hidden) return;
    if (reduced && settled && !pointerOn) {
      draw(0);
      return;
    }
    start();
  };

  const aim = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    tx = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
    ty = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
  };

  const onWindowMove = (event) => {
    if (!opts.tilt) return;
    const rect = canvas.getBoundingClientRect();
    tx = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
    ty = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
  };

  const onPointerDown = (event) => {
    if (!opts.scatter) return;
    pointerOn = true;
    burst = 2.4;
    aim(event);
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (_) {
      /* Some embedders (iframes, shadow roots) refuse capture; scatter still works. */
    }
    kick();
  };

  const onPointerMove = (event) => {
    if (!opts.scatter) return;
    if (!pointerOn && (event.pointerType === 'touch' || !opts.hoverScatter)) return;
    pointerOn = true;
    aim(event);
    kick();
  };

  const onPointerUp = (event) => {
    pointerOn = false;
    if (event && canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const onVisibility = () => {
    if (document.hidden) stop();
    else kick();
  };

  const onMotionChange = () => {
    reduced = resolveReduced();
    if (reduced) {
      tx = 0;
      ty = 0;
      ex = 0;
      ey = 0;
    }
    kick();
  };

  /* ── Wire up ─────────────────────────────────────────────────────────── */

  build();
  reduced = resolveReduced();
  resize();

  window.addEventListener('pointermove', onWindowMove, { passive: true });
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerenter', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  document.addEventListener('visibilitychange', onVisibility);
  if (mq) mq.addEventListener('change', onMotionChange);

  const ro = new ResizeObserver(() => {
    resize();
    if (!running) draw(0);
  });
  ro.observe(canvas);

  let io = null;
  if (opts.pauseOffscreen && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
      else stop();
    });
    io.observe(canvas);
  }

  kick();

  /* ── Public API ──────────────────────────────────────────────────────── */

  const instance = {
    canvas,
    get options() {
      return { ...opts };
    },
    get pointCount() {
      return count;
    },
    /** Change any option live. Species, seed and density rebuild the specimen. */
    setOptions(next = {}) {
      const rebuild = ['species', 'seed', 'density'].some((key) => key in next && next[key] !== opts[key]);
      Object.assign(opts, next);
      if (rebuild) build();
      if ('restYaw' in next) yaw = opts.restYaw;
      if ('ink' in next) ink = resolveInk();
      if ('reducedMotion' in next) onMotionChange();
      if (!running) draw(0);
      return instance;
    },
    setSpecies(species) {
      return instance.setOptions({ species });
    },
    /** Re-read the --sp-dot color, e.g. after a theme switch. */
    refresh() {
      ink = resolveInk();
      if (!running) draw(0);
      return instance;
    },
    /** Programmatic scatter at canvas coordinates (CSS pixels). */
    scatter(x = width / 2, y = height / 2, strength = 1) {
      impulse = { x, y };
      burst = 2.4 * strength;
      settled = false;
      kick();
      return instance;
    },
    /** Snap every point back home. */
    settle() {
      ox.fill(0);
      oy.fill(0);
      oz.fill(0);
      vx.fill(0);
      vy.fill(0);
      vz.fill(0);
      settled = true;
      return instance;
    },
    pause() {
      stop();
      return instance;
    },
    resume() {
      kick();
      return instance;
    },
    /** Draw exactly one frame — handy for tests and static exports. */
    render() {
      draw(0);
      return instance;
    },
    /** PNG data URL of the current frame. */
    snapshot(type = 'image/png', quality) {
      return canvas.toDataURL(type, quality);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      window.removeEventListener('pointermove', onWindowMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerenter', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibility);
      if (mq) mq.removeEventListener('change', onMotionChange);
      ro.disconnect();
      if (io) io.disconnect();
      ctx.clearRect(0, 0, width, height);
    },
  };

  return instance;
}

/* ────────────────────────────────────────────────────────────────────────────
   Plate helpers
   ──────────────────────────────────────────────────────────────────────────── */

/** One-line faces that read well in a dot-matrix face like Doto. */
const FACES = ['^_^', '^o^', '(o_o)', '\\o/', '=^.^=', '<3', '=D', 'xD', '\\m/', 'B)', 'n_n', '^3^', 'owo', '><>', '=P', '^u^'];

/**
 * Cycle an element through a list of faces: hold, fade out, swap, fade in.
 * Pauses while the tab is hidden and stops entirely under reduced motion.
 */
function faceCycle(el, o = {}) {
  const { faces = FACES, hold = 5400, fade = 280, outClass = 'sp-figure--out', reducedMotion = 'auto' } = o;
  if (!el) return { stop() {} };
  const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  const reduced = reducedMotion === 'auto' ? !!(mq && mq.matches) : !!reducedMotion;
  let shown = 0;
  el.textContent = faces[0];
  if (reduced || faces.length < 2) return { stop() {} };

  let holdTimer;
  let fadeTimer;
  const beat = () => {
    holdTimer = setTimeout(() => {
      if (document.hidden) {
        beat();
        return;
      }
      el.classList.add(outClass);
      fadeTimer = setTimeout(() => {
        let pick = shown;
        while (pick === shown) pick = Math.floor(Math.random() * faces.length);
        shown = pick;
        el.textContent = faces[pick];
        el.classList.remove(outClass);
        beat();
      }, fade);
    }, hold);
  };
  beat();
  return {
    stop() {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    },
  };
}

const NUMERIC_DATA = ['spin', 'dotScale', 'density', 'seed', 'scatterForce', 'scatterRadius', 'restYaw', 'pitch', 'scale', 'tilt', 'spring', 'damping', 'perspective', 'maxDpr'];

/**
 * Wire up every plate on the page.
 *
 *   <figure class="sp-plate" data-herbarium="lotus" data-spin="0.0003">
 *     <canvas class="sp-canvas"></canvas>
 *     <div class="sp-tag">
 *       <span class="sp-eyebrow">Specimen <span data-sp-index></span></span>
 *       <span class="sp-tag-value" data-sp-latin></span>
 *     </div>
 *     <div class="sp-label"><span class="sp-figure" data-sp-faces></span></div>
 *   </figure>
 *
 * The species comes from the product's own attribute (data-herbarium,
 * data-bestiary, …) or data-species. Any option can be set per plate as a
 * data attribute (data-dot-scale="1.4", data-ink="#fff", data-scatter="false").
 * Elements marked data-sp-index, data-sp-name and data-sp-latin are filled
 * from the species metadata, and data-sp-faces starts a face cycle.
 * Returns the instances.
 */
function mount(target, options = {}) {
  const selector = `[data-${PRODUCT.attr}], [data-species]`;
  let hosts;
  if (target == null) hosts = Array.from(document.querySelectorAll(selector));
  else if (typeof target === 'string') hosts = Array.from(document.querySelectorAll(target));
  else if (target instanceof Element) hosts = [target];
  else hosts = Array.from(target || []);

  return hosts.map((host) => {
    let canvas;
    if (host.tagName === 'CANVAS') {
      canvas = host;
    } else {
      canvas = host.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'sp-canvas';
        host.insertBefore(canvas, host.firstChild);
      }
    }
    canvas.setAttribute('aria-hidden', 'true');

    const ds = host.dataset;
    const o = { ...options };
    const key = ds[PRODUCT.attr] || ds.species;
    if (key) o.species = key;
    for (const name of NUMERIC_DATA) {
      if (ds[name] != null && ds[name] !== '') o[name] = parseFloat(ds[name]);
    }
    if (ds.ink) o.ink = ds.ink;
    if (ds.background) o.background = ds.background;
    if (ds.scatter != null) o.scatter = ds.scatter !== 'false';
    if (ds.hoverScatter != null) o.hoverScatter = ds.hoverScatter !== 'false';
    if (ds.pauseOffscreen != null) o.pauseOffscreen = ds.pauseOffscreen !== 'false';
    if (ds.reducedMotion != null) o.reducedMotion = ds.reducedMotion === 'auto' ? 'auto' : ds.reducedMotion !== 'false';

    const instance = createSpecimen(canvas, o);

    const meta = typeof o.species === 'string' ? SPECIES[o.species] : null;
    if (meta && host !== canvas) {
      host.querySelectorAll('[data-sp-index]').forEach((el) => {
        el.textContent = String(meta.index).padStart(2, '0');
      });
      host.querySelectorAll('[data-sp-name]').forEach((el) => {
        el.textContent = meta.name;
      });
      host.querySelectorAll('[data-sp-latin]').forEach((el) => {
        el.textContent = meta.latin;
      });
    }
    if (host !== canvas) {
      host.querySelectorAll('[data-sp-count]').forEach((el) => {
        el.textContent = instance.pointCount.toLocaleString();
      });
      host.querySelectorAll('[data-sp-faces]').forEach((el) => {
        const list = el.dataset.spFaces ? el.dataset.spFaces.split('|') : FACES;
        instance.faces = faceCycle(el, { faces: list });
      });
    }
    return instance;
  });
}

Object.assign(PRODUCT, {"name":"Bestiary","slug":"bestiary","attr":"bestiary","version":"1.0.0","description":"Interactive point-cloud birds and beasts"});

/*
 * Bestiary — the birds-and-beasts species pack.
 *
 * Each builder gets (rand, n) where n(count) applies the density option, and
 * returns { points, lean, fit }. Bodies run along x with the head at -x, +y is
 * up, wings reach out along ±z. Build one side, then mirror() the other.
 * The shared engine (../../_engine) is bundled with this file by build.mjs.
 */


const createBestiary = createSpecimen;

/* Blade outlines for wings and feathers: u = 0 at the root, 1 at the tip. */
const BIRD_WING = (u) => Math.pow(Math.sin(Math.PI * (0.06 + u * 0.9)), 0.35) * (1 - 0.3 * u);
const SWEPT_WING = (u) => Math.pow(Math.sin(Math.PI * (0.05 + u * 0.92)), 0.5) * (1 - 0.45 * u);
const FEATHER = (u) => (0.55 + 0.45 * Math.sin(Math.PI * u)) * (u > 0.9 ? Math.sqrt((1 - u) / 0.1) : 1);

/** A ring iris facing ±z, with a pupil dot. */
function eye(rand, at, r, count) {
  const out = ring(rand, { count, radius: r, at, shell: 0, jitter: 0.002, normal: [0, 0, 1] });
  out.push({ x: at[0], y: at[1], z: at[2] + Math.sign(at[2] || 1) * 0.004, shell: 0 });
  return out;
}

/** 01 · Hummingbird — hovering, wings up and back, tail fanned, bill out. */
function buildHummingbird(rand, n) {
  const points = [
    ...ellipsoid(rand, { count: n(200), rx: 0.17, ry: 0.09, rz: 0.08, at: [0.02, 0, 0], shell: 0 }),
    ...ellipsoid(rand, { count: n(70), rx: 0.15, ry: 0.07, rz: 0.06, at: [0.02, 0, 0], shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(100), rx: 0.075, ry: 0.07, rz: 0.065, at: [-0.19, 0.06, 0], shell: 0 }),
    ...ellipsoid(rand, { count: n(30), rx: 0.05, ry: 0.05, rz: 0.045, at: [-0.19, 0.06, 0], shell: 1, fill: true }),
    ...eye(rand, [-0.22, 0.08, 0.058], 0.014, n(10)),
    ...eye(rand, [-0.22, 0.08, -0.058], 0.014, n(10)),
    ...tube(rand, { path: [[-0.26, 0.055, 0], [-0.5, 0.03, 0]], radius: 0.007, taper: 0.8, count: n(40), shell: 0 }),
  ];
  const w = { yaw: Math.PI / 2 - 0.35, tilt: 0.55, r0: 0.03, length: 0.36, width: 0.09, profile: SWEPT_WING, curl: 0.15, cross: 0.1, at: [-0.02, 0.05, 0.04] };
  const wing = [...petal(rand, { ...w, count: n(150), shell: 0, veins: 5 }), ...petal(rand, { ...w, count: n(50), shell: 1 })];
  points.push(...wing, ...mirror(wing));
  for (let i = -2; i <= 2; i += 1) {
    points.push(...petal(rand, { count: n(26), shell: i % 2 ? 1 : 0, yaw: i * 0.2, tilt: -0.35, r0: 0.17, length: 0.17, width: 0.03, profile: FEATHER, veins: 1, at: [0, -0.01, 0] }));
  }
  const foot = ellipsoid(rand, { count: n(8), rx: 0.012, ry: 0.01, rz: 0.01, at: [0.06, -0.09, 0.03], shell: 0 });
  points.push(...foot, ...mirror(foot));
  /* Hover pose: nose up. */
  transform(points, (p) => rotZ(p, -0.5));
  return { points, lean: 0.35, fit: 0.92 };
}

/** 02 · Swallow — wings swept, tail forked, caught mid-glide. */
function buildSwallow(rand, n) {
  const points = [
    ...ellipsoid(rand, { count: n(180), rx: 0.2, ry: 0.06, rz: 0.06, shell: 0 }),
    ...ellipsoid(rand, { count: n(50), rx: 0.17, ry: 0.045, rz: 0.045, shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(70), rx: 0.06, ry: 0.055, rz: 0.055, at: [-0.22, 0.01, 0], shell: 0 }),
    ...eye(rand, [-0.24, 0.025, 0.047], 0.011, n(9)),
    ...eye(rand, [-0.24, 0.025, -0.047], 0.011, n(9)),
    ...tube(rand, { path: [[-0.27, 0.005, 0], [-0.33, 0, 0]], radius: 0.01, taper: 0.9, count: n(14), shell: 0 }),
  ];
  const w = { yaw: Math.PI / 2 - 0.6, tilt: 0.18, r0: 0.03, length: 0.58, width: 0.13, profile: SWEPT_WING, curl: -0.12, cross: 0.08, at: [-0.02, 0.02, 0.03] };
  const wing = [...petal(rand, { ...w, count: n(190), shell: 0, veins: 6 }), ...petal(rand, { ...w, count: n(60), shell: 1 })];
  points.push(...wing, ...mirror(wing));
  const streamer = petal(rand, { count: n(40), shell: 0, yaw: 0.26, tilt: -0.04, r0: 0.19, length: 0.34, width: 0.022, profile: FEATHER, veins: 1, at: [0, 0, 0.01] });
  points.push(...streamer, ...mirror(streamer));
  for (let i = -1; i <= 1; i += 1) {
    points.push(...petal(rand, { count: n(18), shell: 1, yaw: i * 0.1, tilt: -0.05, r0: 0.19, length: 0.14, width: 0.02, profile: FEATHER }));
  }
  return { points, lean: 0.62, fit: 0.92 };
}

/** 03 · Brown bear — ambling, shoulder hump, head low and turned to look at you, claws out. */
function buildBear(rand, n) {
  /* Shaggy coat: streaks of denser dots, lighter belly. */
  const shag = (p, d) => (d.y < -0.5 ? 1 : Math.sin(p.x * 26 + p.y * 40) * Math.cos(p.z * 30) > 0.3 ? 0 : rand() < 0.4 ? 0 : 1);
  const points = [
    ...ellipsoid(rand, { count: n(680), rx: 0.35, ry: 0.21, rz: 0.2, at: [0.02, 0.02, 0], paint: shag }),
    ...ellipsoid(rand, { count: n(200), rx: 0.31, ry: 0.17, rz: 0.16, at: [0.02, 0.02, 0], shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(200), rx: 0.18, ry: 0.16, rz: 0.18, at: [-0.14, 0.15, 0], paint: shag }),
    ...ellipsoid(rand, { count: n(150), rx: 0.17, ry: 0.17, rz: 0.17, at: [0.25, 0.05, 0], paint: shag }),
    ...tube(rand, { path: [[0.36, 0.03, 0], [0.42, -0.03, 0]], radius: 0.035, taper: 0.6, count: n(20), shell: 0 }),
  ];
  /* Fringe of longer fur under the belly. */
  const fringe = n(16);
  for (let i = 0; i < fringe; i += 1) {
    const x = -0.2 + rand() * 0.45;
    const z = (rand() - 0.5) * 0.3;
    points.push(...line(rand, { from: [x, -0.15, z], to: [x + 0.01, -0.22 - rand() * 0.03, z * 1.1], count: n(3), shell: 1 }));
  }
  /* The head is built straight, then turned toward the viewer around the neck. */
  const head = [
    ...tube(rand, { path: [[-0.3, 0.07, 0], [-0.42, 0.02, 0]], radius: 0.11, taper: 0.05, count: n(110), paint: () => (rand() < 0.6 ? 0 : 1) }),
    ...ellipsoid(rand, { count: n(220), rx: 0.15, ry: 0.13, rz: 0.13, at: [-0.48, 0.02, 0], shell: 0 }),
    ...ellipsoid(rand, { count: n(70), rx: 0.12, ry: 0.1, rz: 0.1, at: [-0.48, 0.02, 0], shell: 1, fill: true }),
    ...tube(rand, { path: [[-0.57, -0.01, 0], [-0.7, -0.06, 0]], radius: 0.06, taper: 0.3, count: n(90), shell: 0 }),
    ...ellipsoid(rand, { count: n(30), rx: 0.032, ry: 0.026, rz: 0.032, at: [-0.715, -0.055, 0], shell: 0, fill: true }),
  ];
  const headSide = [
    ...ellipsoid(rand, { count: n(40), rx: 0.04, ry: 0.04, rz: 0.022, at: [-0.44, 0.13, 0.095], shell: 0 }),
    ...ellipsoid(rand, { count: n(10), rx: 0.02, ry: 0.02, rz: 0.01, at: [-0.445, 0.13, 0.1], shell: 2, fill: true }),
    ...ring(rand, { count: n(8), radius: 0.011, at: [-0.555, 0.045, 0.085], shell: 0, jitter: 0.001, normal: [-0.6, 0.2, 0.75] }),
    { x: -0.56, y: 0.045, z: 0.09, shell: 0 },
    ...tube(rand, { path: [[-0.58, 0.08, 0.1], [-0.53, 0.1, 0.06]], radius: 0.008, count: n(10), shell: 0 }),
    ...line(rand, { from: [-0.7, -0.09, 0.02], to: [-0.6, -0.1, 0.05], count: n(5), shell: 1 }),
  ];
  head.push(...headSide, ...mirror(headSide));
  const pivot = -0.34;
  transform(head, (p) => {
    const q = rotY({ x: p.x - pivot, y: p.y, z: p.z }, -0.4);
    return { x: q.x + pivot, y: q.y, z: q.z };
  });
  points.push(...head);
  /* Legs mid-stride: near front forward, far front back, and the reverse behind. */
  const leg = (x0, x1, z, r, shell) => {
    const out = [
      ...tube(rand, { path: [[x0, -0.1, z], [x1 * 0.5 + x0 * 0.5, -0.28, z * 1.05], [x1, -0.46, z * 1.05]], radius: r, taper: 0.25, count: n(100), shell }),
      ...ellipsoid(rand, { count: n(30), rx: 0.075, ry: 0.028, rz: 0.055, at: [x1 - 0.02, -0.47, z * 1.05], shell }),
    ];
    for (let k = -2; k <= 2; k += 1) {
      out.push(...line(rand, { from: [x1 - 0.08, -0.475, z * 1.05 + k * 0.02], to: [x1 - 0.13, -0.485, z * 1.05 + k * 0.022], count: n(3), shell: 0 }));
    }
    return out;
  };
  points.push(...leg(-0.2, -0.3, 0.11, 0.065, 0), ...leg(-0.2, -0.1, -0.11, 0.065, 1), ...leg(0.2, 0.3, 0.11, 0.07, 0), ...leg(0.2, 0.12, -0.11, 0.07, 1));
  return { points, lean: 0.35, fit: 0.92 };
}

/** 04 · Crane — neck out, legs trailing, wings spread wide. */
function buildCrane(rand, n) {
  const points = [
    ...ellipsoid(rand, { count: n(160), rx: 0.2, ry: 0.085, rz: 0.09, shell: 0 }),
    ...ellipsoid(rand, { count: n(60), rx: 0.17, ry: 0.065, rz: 0.07, shell: 1, fill: true }),
    ...tube(rand, { path: [[-0.17, 0.03, 0], [-0.4, 0.06, 0], [-0.58, 0.06, 0]], radius: 0.022, taper: 0.3, count: n(70), shell: 0 }),
    ...ellipsoid(rand, { count: n(40), rx: 0.055, ry: 0.035, rz: 0.035, at: [-0.61, 0.065, 0], shell: 0 }),
    ...eye(rand, [-0.62, 0.075, 0.032], 0.008, n(8)),
    ...eye(rand, [-0.62, 0.075, -0.032], 0.008, n(8)),
    ...tube(rand, { path: [[-0.66, 0.06, 0], [-0.8, 0.045, 0]], radius: 0.01, taper: 0.9, count: n(24), shell: 0 }),
  ];
  const w = { yaw: Math.PI / 2 - 0.12, tilt: 0.28, r0: 0.04, length: 0.66, width: 0.2, profile: BIRD_WING, curl: -0.2, cross: 0.06, at: [0.02, 0.05, 0.05] };
  const wing = [...petal(rand, { ...w, count: n(240), shell: 0, veins: 8 }), ...petal(rand, { ...w, count: n(80), shell: 1 })];
  points.push(...wing, ...mirror(wing));
  for (let i = -2; i <= 2; i += 1) {
    points.push(...petal(rand, { count: n(20), shell: i % 2 ? 1 : 0, yaw: i * 0.16, tilt: -0.1, r0: 0.19, length: 0.15, width: 0.03, profile: FEATHER }));
  }
  const leg = tube(rand, { path: [[0.12, -0.06, 0.03], [0.4, -0.05, 0.035], [0.62, -0.03, 0.035]], radius: 0.007, count: n(40), shell: 0 });
  points.push(...leg, ...mirror(leg));
  return { points, lean: 0.62, fit: 0.92 };
}

/** 05 · Panther — prowling low, shoulders up, tail curled high, ghost rosettes. */
function buildPanther(rand, n) {
  /* A black leopard's coat: rosettes as darker clusters, belly lighter. */
  const rosettes = (p, d) => {
    if (d.y < -0.4) return 1;
    const s = Math.sin(p.x * 42 + 1.3) * Math.sin(p.z * 48 + p.y * 26);
    return s > 0.45 ? 0 : rand() < 0.3 ? 0 : 1;
  };
  const points = [
    ...ellipsoid(rand, { count: n(380), rx: 0.3, ry: 0.115, rz: 0.115, shell: 0, paint: rosettes }),
    ...ellipsoid(rand, { count: n(120), rx: 0.28, ry: 0.09, rz: 0.09, shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(130), rx: 0.12, ry: 0.11, rz: 0.11, at: [-0.16, 0.045, 0], shell: 0, paint: rosettes }),
    ...ellipsoid(rand, { count: n(120), rx: 0.12, ry: 0.105, rz: 0.105, at: [0.2, 0.03, 0], shell: 0, paint: rosettes }),
    ...tube(rand, { path: [[-0.26, 0.03, 0], [-0.42, -0.01, 0]], radius: 0.07, taper: 0.25, count: n(100), shell: 0 }),
    ...ellipsoid(rand, { count: n(130), rx: 0.085, ry: 0.07, rz: 0.075, at: [-0.5, -0.02, 0], shell: 0 }),
    ...ellipsoid(rand, { count: n(40), rx: 0.06, ry: 0.05, rz: 0.05, at: [-0.5, -0.02, 0], shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(60), rx: 0.055, ry: 0.038, rz: 0.045, at: [-0.575, -0.05, 0], shell: 0 }),
    ...tube(rand, { path: [[0.3, 0.02, 0], [0.45, 0.05, 0.02], [0.56, 0.12, 0.04], [0.6, 0.22, 0.03], [0.57, 0.29, 0]], radius: 0.024, taper: 0.35, count: n(110), shell: 0 }),
  ];
  const side = [
    ...tube(rand, { path: [[-0.48, 0.045, 0.045], [-0.47, 0.1, 0.06]], radius: 0.022, taper: 0.6, count: n(22), shell: 0 }),
    ...ring(rand, { count: n(9), radius: 0.011, at: [-0.555, 0, 0.045], shell: 0, jitter: 0.002, normal: [-0.6, 0.2, 0.75] }),
    { x: -0.56, y: 0, z: 0.048, shell: 0 },
    ...line(rand, { from: [-0.6, -0.055, 0.035], to: [-0.66, -0.04, 0.12], count: n(5), shell: 2 }),
    ...line(rand, { from: [-0.6, -0.06, 0.035], to: [-0.67, -0.07, 0.11], count: n(5), shell: 2 }),
  ];
  /* Near legs planted, far legs mid-step. */
  const legs = [
    ...tube(rand, { path: [[-0.17, -0.06, 0.06], [-0.2, -0.19, 0.075], [-0.22, -0.31, 0.075]], radius: 0.034, taper: 0.35, count: n(70), shell: 0 }),
    ...ellipsoid(rand, { count: n(14), rx: 0.035, ry: 0.014, rz: 0.028, at: [-0.235, -0.315, 0.075], shell: 0 }),
    ...tube(rand, { path: [[0.19, -0.05, 0.06], [0.26, -0.17, 0.075], [0.22, -0.31, 0.075]], radius: 0.036, taper: 0.35, count: n(70), shell: 0 }),
    ...ellipsoid(rand, { count: n(14), rx: 0.035, ry: 0.014, rz: 0.028, at: [0.205, -0.315, 0.075], shell: 0 }),
    ...tube(rand, { path: [[-0.17, -0.06, -0.06], [-0.26, -0.18, -0.075], [-0.33, -0.31, -0.075]], radius: 0.034, taper: 0.35, count: n(70), shell: 1 }),
    ...ellipsoid(rand, { count: n(14), rx: 0.035, ry: 0.014, rz: 0.028, at: [-0.345, -0.315, -0.075], shell: 1 }),
    ...tube(rand, { path: [[0.19, -0.05, -0.06], [0.28, -0.16, -0.075], [0.3, -0.31, -0.075]], radius: 0.036, taper: 0.35, count: n(70), shell: 1 }),
    ...ellipsoid(rand, { count: n(14), rx: 0.035, ry: 0.014, rz: 0.028, at: [0.285, -0.315, -0.075], shell: 1 }),
  ];
  points.push(...side, ...mirror(side), ...legs);
  return { points, lean: 0.45, fit: 0.92 };
}

/** 06 · Wolf — standing square and staring you down, a mane of flame-tipped fur. */
function buildWolf(rand, n) {
  /* Fur: streaks of denser dots, lighter underside. */
  const fur = (p, d) => (d.y < -0.5 ? 1 : Math.sin(p.y * 34 + p.x * 18) * Math.cos(p.z * 26) > 0.35 ? 0 : rand() < 0.3 ? 0 : 1);
  /* Tail radius along its length: widens to a full brush, then converges to a point. */
  const brush = (t) => (t < 0.5 ? 0.45 + 0.55 * (t / 0.5) : Math.pow((1 - t) / 0.5, 0.55));
  const points = [
    ...ellipsoid(rand, { count: n(200), rx: 0.15, ry: 0.13, rz: 0.13, at: [-0.46, 0.22, 0], paint: fur }),
    ...ellipsoid(rand, { count: n(60), rx: 0.11, ry: 0.1, rz: 0.1, at: [-0.46, 0.22, 0], shell: 1, fill: true }),
    ...tube(rand, { path: [[-0.55, 0.18, 0], [-0.7, 0.14, 0]], radius: 0.062, taper: 0.35, count: n(110), shell: 0 }),
    ...ellipsoid(rand, { count: n(30), rx: 0.03, ry: 0.024, rz: 0.03, at: [-0.71, 0.145, 0], shell: 0, fill: true }),
    ...ellipsoid(rand, { count: n(320), rx: 0.2, ry: 0.22, rz: 0.22, at: [-0.28, 0.06, 0], paint: fur }),
    ...ellipsoid(rand, { count: n(90), rx: 0.16, ry: 0.18, rz: 0.18, at: [-0.28, 0.06, 0], shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(320), rx: 0.34, ry: 0.17, rz: 0.16, at: [0.06, 0.02, 0], paint: fur }),
    ...ellipsoid(rand, { count: n(90), rx: 0.3, ry: 0.14, rz: 0.13, at: [0.06, 0.02, 0], shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(120), rx: 0.14, ry: 0.15, rz: 0.14, at: [0.3, 0.02, 0], paint: fur }),
    /* Tail: a paintbrush, full through the middle and converging to a soft point. */
    ...tube(rand, { path: [[0.42, 0.02, 0], [0.5, -0.08, 0.03], [0.55, -0.22, 0.05], [0.58, -0.4, 0.06], [0.6, -0.5, 0.06]], radius: 0.062, count: n(240), profile: brush, paint: () => (rand() < 0.65 ? 0 : 1) }),
    ...tube(rand, { path: [[0.44, -0.01, 0.005], [0.55, -0.22, 0.05], [0.59, -0.46, 0.06]], radius: 0.078, count: n(60), shell: 2, profile: brush }),
  ];
  /* Soft under-ruff below the chest and a low crest of hackles along the shoulders. */
  points.push(...ellipsoid(rand, { count: n(70), rx: 0.16, ry: 0.06, rz: 0.2, at: [-0.28, -0.13, 0], shell: 1, fill: true }));
  const crest = n(14);
  for (let i = 0; i < crest; i += 1) {
    const x = -0.3 + rand() * 0.42;
    const y = 0.19 - (x + 0.3) * 0.15;
    const z = (rand() - 0.5) * 0.12;
    const len = 0.03 + rand() * 0.03;
    points.push(...line(rand, { from: [x, y, z], to: [x + len * 0.5, y + len, z * 1.1], count: n(3), shell: 1, jitter: 0.004 }));
  }
  const side = [
    /* Ear: a broad cupped triangle, leaning slightly forward, with a faint inner ear. */
    ...petal(rand, { count: n(70), shell: 0, yaw: -0.7, tilt: Math.PI / 2 + 0.12, r0: 0, length: 0.13, width: 0.05, profile: (u) => 1 - u * 0.92, cross: 0.35, thickness: 0.006, at: [-0.43, 0.31, 0.085] }),
    ...petal(rand, { count: n(24), shell: 2, yaw: -0.7, tilt: Math.PI / 2 + 0.12, r0: 0.01, length: 0.1, width: 0.03, profile: (u) => 1 - u * 0.9, thickness: 0.004, at: [-0.43, 0.31, 0.085] }),
    /* Eye: a lit ring with a pupil, under a brow angled down toward the nose. */
    ...ring(rand, { count: n(11), radius: 0.02, at: [-0.575, 0.255, 0.066], shell: 0, jitter: 0.002, normal: [-0.8, 0.15, 0.55] }),
    ...ellipsoid(rand, { count: n(8), rx: 0.008, ry: 0.008, rz: 0.008, at: [-0.585, 0.255, 0.07], shell: 0, fill: true }),
    ...tube(rand, { path: [[-0.6, 0.3, 0.1], [-0.55, 0.31, 0.03]], radius: 0.01, count: n(16), shell: 0 }),
    ...line(rand, { from: [-0.7, 0.1, 0], to: [-0.58, 0.09, 0.06], count: n(6), shell: 1 }),
    /* Legs: front planted wide, hind set back. */
    ...tube(rand, { path: [[-0.26, -0.08, 0.11], [-0.28, -0.28, 0.135], [-0.3, -0.47, 0.145]], radius: 0.04, taper: 0.25, count: n(80), shell: 0 }),
    ...ellipsoid(rand, { count: n(16), rx: 0.05, ry: 0.02, rz: 0.04, at: [-0.32, -0.48, 0.145], shell: 0 }),
    ...tube(rand, { path: [[0.28, -0.08, 0.1], [0.34, -0.27, 0.11], [0.3, -0.47, 0.12]], radius: 0.04, taper: 0.25, count: n(70), shell: 1 }),
    ...ellipsoid(rand, { count: n(14), rx: 0.05, ry: 0.02, rz: 0.04, at: [0.28, -0.48, 0.12], shell: 1 }),
  ];
  /* Cheek ruff: a dense wedge of fur widening the face. */
  side.push(
    ...ellipsoid(rand, { count: n(70), rx: 0.07, ry: 0.08, rz: 0.045, at: [-0.45, 0.13, 0.125], paint: fur }),
    ...ellipsoid(rand, { count: n(20), rx: 0.05, ry: 0.06, rz: 0.03, at: [-0.45, 0.13, 0.125], shell: 1, fill: true }),
  );
  points.push(...side, ...mirror(side));
  /* Turned to face you at the default rest yaw, body receding behind. */
  transform(points, (p) => rotY(p, -1.77));
  return { points, lean: 0.15, fit: 0.92 };
}

/** 07 · Cobra — coiled, hood spread, tongue out. */
function buildSnake(rand, n) {
  const path = [[-0.06, 0.36, 0.06], [0, 0.3, 0.03], [0.07, 0.14, 0], [0.11, -0.06, 0.02], [0.13, -0.16, 0.05]];
  for (let i = 0; i <= 44; i += 1) {
    const t = i / 44;
    const a = t * TAU * 2.35 + 0.6;
    const r = 0.13 + t * 0.3;
    path.push([Math.cos(a) * r + 0.02, -0.17 - t * 0.07, Math.sin(a) * r]);
  }
  const bands = (t) => (Math.floor(t * 46) % 3 === 0 ? 0 : rand() < 0.35 ? 0 : 1);
  const spectacle = (p, d) => {
    if (d.x < 0) return 1;
    const dz = Math.abs(p.z - 0.02) - 0.05;
    const dist = Math.hypot((p.y - 0.25) * 1.2, dz);
    return dist < 0.028 && dist > 0.016 ? 0 : rand() < 0.4 ? 0 : 1;
  };
  const points = [
    ...tube(rand, { path, radius: 0.05, taper: 0.8, count: n(1300), paint: bands }),
    ...ellipsoid(rand, { count: n(110), rx: 0.075, ry: 0.04, rz: 0.06, at: [-0.11, 0.38, 0.09], shell: 0 }),
    ...ellipsoid(rand, { count: n(150), rx: 0.05, ry: 0.15, rz: 0.12, at: [0.03, 0.23, 0.02], paint: spectacle }),
    ...ring(rand, { count: n(8), radius: 0.009, at: [-0.14, 0.4, 0.14], shell: 0, jitter: 0.001, normal: [-0.3, 0.3, 0.9] }),
    ...ring(rand, { count: n(8), radius: 0.009, at: [-0.14, 0.4, 0.04], shell: 0, jitter: 0.001, normal: [-0.3, 0.3, -0.9] }),
    ...line(rand, { from: [-0.18, 0.37, 0.11], to: [-0.26, 0.36, 0.13], count: n(5), shell: 1 }),
    ...line(rand, { from: [-0.26, 0.36, 0.13], to: [-0.29, 0.38, 0.15], count: n(3), shell: 1 }),
    ...line(rand, { from: [-0.26, 0.36, 0.13], to: [-0.29, 0.34, 0.14], count: n(3), shell: 1 }),
  ];
  return { points, lean: 0.55, fit: 0.92 };
}

/** 08 · Stag — standing, head up, a full rack of antlers. */
function buildStag(rand, n) {
  const points = [
    ...ellipsoid(rand, { count: n(340), rx: 0.3, ry: 0.14, rz: 0.13, at: [0.06, 0, 0], shell: 0 }),
    ...ellipsoid(rand, { count: n(120), rx: 0.27, ry: 0.11, rz: 0.1, at: [0.06, 0, 0], shell: 1, fill: true }),
    ...ellipsoid(rand, { count: n(90), rx: 0.12, ry: 0.13, rz: 0.12, at: [-0.16, 0.02, 0], shell: 0 }),
    ...tube(rand, { path: [[-0.22, 0.08, 0], [-0.38, 0.3, 0]], radius: 0.07, taper: 0.3, count: n(120), shell: 0 }),
    ...ellipsoid(rand, { count: n(100), rx: 0.09, ry: 0.065, rz: 0.06, at: [-0.45, 0.36, 0], shell: 0 }),
    ...tube(rand, { path: [[-0.5, 0.34, 0], [-0.62, 0.31, 0]], radius: 0.035, taper: 0.5, count: n(40), shell: 0 }),
    ...ellipsoid(rand, { count: n(10), rx: 0.014, ry: 0.012, rz: 0.014, at: [-0.63, 0.31, 0], shell: 0, fill: true }),
    ...tube(rand, { path: [[0.35, 0.03, 0], [0.42, -0.04, 0]], radius: 0.02, taper: 0.6, count: n(16), shell: 1 }),
  ];
  const side = [
    ...tube(rand, { path: [[-0.42, 0.41, 0.05], [-0.45, 0.47, 0.11]], radius: 0.022, taper: 0.7, count: n(20), shell: 0 }),
    ...ring(rand, { count: n(8), radius: 0.01, at: [-0.5, 0.38, 0.05], shell: 0, jitter: 0.001, normal: [-0.5, 0.2, 0.85] }),
    ...tube(rand, { path: [[-0.43, 0.42, 0.04], [-0.42, 0.6, 0.09], [-0.36, 0.76, 0.13], [-0.27, 0.88, 0.11]], radius: 0.013, taper: 0.45, count: n(70), shell: 0 }),
    ...tube(rand, { path: [[-0.43, 0.48, 0.05], [-0.54, 0.57, 0.06]], radius: 0.009, taper: 0.6, count: n(16), shell: 0 }),
    ...tube(rand, { path: [[-0.41, 0.61, 0.09], [-0.51, 0.72, 0.12]], radius: 0.009, taper: 0.6, count: n(16), shell: 0 }),
    ...tube(rand, { path: [[-0.36, 0.76, 0.13], [-0.41, 0.9, 0.2]], radius: 0.009, taper: 0.6, count: n(16), shell: 0 }),
    ...tube(rand, { path: [[-0.27, 0.88, 0.11], [-0.19, 0.97, 0.08]], radius: 0.009, taper: 0.7, count: n(14), shell: 0 }),
    ...tube(rand, { path: [[-0.27, 0.88, 0.11], [-0.3, 0.99, 0.17]], radius: 0.009, taper: 0.7, count: n(14), shell: 0 }),
    ...tube(rand, { path: [[-0.14, -0.1, 0.07], [-0.17, -0.3, 0.075], [-0.16, -0.5, 0.07]], radius: 0.026, taper: 0.4, count: n(60), shell: 0 }),
    ...tube(rand, { path: [[0.24, -0.1, 0.07], [0.32, -0.28, 0.075], [0.28, -0.5, 0.07]], radius: 0.028, taper: 0.4, count: n(60), shell: 0 }),
    ...ellipsoid(rand, { count: n(10), rx: 0.03, ry: 0.014, rz: 0.024, at: [-0.165, -0.51, 0.07], shell: 0 }),
    ...ellipsoid(rand, { count: n(10), rx: 0.03, ry: 0.014, rz: 0.024, at: [0.275, -0.51, 0.07], shell: 0 }),
  ];
  points.push(...side, ...mirror(side));
  return { points, lean: 0.3, fit: 0.92 };
}

Object.assign(SPECIES, {
  hummingbird: { index: 1, name: 'Hummingbird', latin: 'Archilochus colubris', kind: 'bird', build: buildHummingbird },
  swallow: { index: 2, name: 'Swallow', latin: 'Hirundo rustica', kind: 'bird', build: buildSwallow },
  bear: { index: 3, name: 'Brown bear', latin: 'Ursus arctos', kind: 'mammal', build: buildBear },
  crane: { index: 4, name: 'Crane', latin: 'Grus grus', kind: 'bird', build: buildCrane },
  panther: { index: 5, name: 'Panther', latin: 'Panthera pardus', kind: 'mammal', build: buildPanther },
  wolf: { index: 6, name: 'Wolf', latin: 'Canis lupus', kind: 'mammal', build: buildWolf },
  snake: { index: 7, name: 'Cobra', latin: 'Naja naja', kind: 'reptile', build: buildSnake },
  stag: { index: 8, name: 'Stag', latin: 'Cervus elaphus', kind: 'mammal', build: buildStag },
});

return { VERSION, TAU, GOLDEN, PRODUCT, SPECIES, LAYERS, DEFAULTS, FACES, geometry, petal, fermat, ring, line, tube, ellipsoid, stem, mirror, transform, finish, rotX, rotY, rotZ, unitSphere, normalize, basis, PROFILES, mulberry32, createSpecimen, mount, faceCycle, createBestiary };
});
