/**
 * Bestiary — Interactive point-cloud birds and beasts
 * Type declarations for dist/bestiary.esm.js and dist/bestiary.umd.js.
 */

export type Point = { x: number; y: number; z: number; shell?: number };

/** A seeded random generator, 0 ≤ n < 1. */
export type Rand = () => number;
/** Scales a point count by the `density` option. */
export type Count = (count: number) => number;
export type Vec3 = [number, number, number];

export interface SpeciesBuild {
  points: Point[];
  /** Camera pitch in radians: how far the viewer looks down onto the specimen. */
  lean?: number;
  /** Radius of the farthest point after scaling; the canvas shows ±1. */
  fit?: number;
  center?: 'bounds' | 'centroid';
}

export interface SpeciesDef {
  index?: number;
  name?: string;
  latin?: string;
  kind?: string;
  /** Extra specimen shipped outside the numbered set. */
  bonus?: boolean;
  /** Grow the specimen from a seeded random source. */
  build?: (rand: Rand, n: Count) => SpeciesBuild;
  /** Or hand over finished points. */
  points?: Point[];
  lean?: number;
  fit?: number;
  center?: 'bounds' | 'centroid';
}

export type SpeciesKey = 'hummingbird' | 'swallow' | 'bear' | 'crane' | 'panther' | 'wolf' | 'snake' | 'stag';

export interface Layer {
  /** Dot radius in CSS pixels at the center of the specimen. */
  size: number;
  alpha: number;
}

export interface SpecimenOptions {
  species?: SpeciesKey | SpeciesDef;
  seed?: number;
  density?: number;
  /** Any CSS color, or 'auto' to read --sp-dot off the canvas. */
  ink?: string;
  background?: string | null;
  layers?: Layer[];
  dotScale?: number;
  dotResponsive?: boolean;
  scale?: number;
  perspective?: number;
  /** Radians per millisecond. */
  spin?: number;
  restYaw?: number;
  pitch?: number;
  tilt?: number;
  scatter?: boolean;
  scatterRadius?: number;
  scatterForce?: number;
  spring?: number;
  damping?: number;
  scatterMax?: number;
  hoverScatter?: boolean;
  reducedMotion?: 'auto' | boolean;
  pauseOffscreen?: boolean;
  maxDpr?: number;
}

export interface FaceCycle {
  stop(): void;
}

export interface FaceCycleOptions {
  faces?: string[];
  /** Milliseconds each face is held. */
  hold?: number;
  /** Milliseconds for the fade. */
  fade?: number;
  outClass?: string;
  reducedMotion?: 'auto' | boolean;
}

export interface SpecimenInstance {
  readonly canvas: HTMLCanvasElement;
  readonly options: Required<SpecimenOptions>;
  readonly pointCount: number;
  /** Set by mount() when the plate contains a [data-sp-faces] element. */
  faces?: FaceCycle;
  setOptions(next: SpecimenOptions): SpecimenInstance;
  setSpecies(species: SpeciesKey | SpeciesDef): SpecimenInstance;
  /** Re-read the --sp-dot color, e.g. after a theme switch. */
  refresh(): SpecimenInstance;
  /** Scatter from a point in canvas CSS pixels. Defaults to the center. */
  scatter(x?: number, y?: number, strength?: number): SpecimenInstance;
  settle(): SpecimenInstance;
  pause(): SpecimenInstance;
  resume(): SpecimenInstance;
  render(): SpecimenInstance;
  snapshot(type?: string, quality?: number): string;
  destroy(): void;
}

export type Profile = 'ovate' | 'round' | 'lanceolate' | 'ray' | 'leaf' | 'oval' | 'wing' | ((u: number) => number);

export interface PetalOptions {
  count?: number;
  shell?: number;
  yaw?: number;
  tilt?: number;
  r0?: number;
  length?: number;
  width?: number;
  profile?: Profile;
  curl?: number;
  bow?: number;
  cross?: number;
  twist?: number;
  rise?: number;
  ruffle?: number;
  thickness?: number;
  veins?: number;
  veinShell?: number;
  veinDots?: number;
  at?: Vec3 | null;
  paint?: ((u: number, v: number) => number) | null;
}

export interface Geometry {
  petal(rand: Rand, options?: PetalOptions): Point[];
  fermat(rand: Rand, options?: { count?: number; radius?: number; dome?: number; y?: number; shell?: number; jitter?: number; start?: number; shellRule?: ((i: number, t: number) => number) | null; at?: Vec3 | null }): Point[];
  ring(rand: Rand, options?: { count?: number; radius?: number; y?: number; shell?: number; jitter?: number; at?: Vec3 | null; normal?: Vec3 | null }): Point[];
  line(rand: Rand, options?: { from?: Vec3; to?: Vec3; count?: number; shell?: number; jitter?: number }): Point[];
  tube(rand: Rand, options?: { path?: Vec3[]; radius?: number; count?: number; shell?: number; taper?: number; profile?: ((t: number) => number) | null; jitter?: number; paint?: ((t: number, angle: number) => number) | null }): Point[];
  ellipsoid(rand: Rand, options?: { count?: number; rx?: number; ry?: number; rz?: number; at?: Vec3; shell?: number; fill?: boolean; paint?: ((p: Point, d: Point) => number) | null }): Point[];
  stem(rand: Rand, options?: { count?: number; top?: number; length?: number; radius?: number; bend?: number; shell?: number; taper?: number }): Point[];
  mirror(points: Point[], axis?: 'x' | 'y' | 'z'): Point[];
  transform(points: Point[], fn: (p: Point) => { x: number; y: number; z: number }): Point[];
  finish(points: Point[], options?: { fit?: number; center?: 'bounds' | 'centroid' }): Point[];
  rotX(p: Point, a: number): Point;
  rotY(p: Point, a: number): Point;
  rotZ(p: Point, a: number): Point;
  unitSphere(rand: Rand): { x: number; y: number; z: number };
  normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number };
  basis(d: { x: number; y: number; z: number }): { u: { x: number; y: number; z: number }; v: { x: number; y: number; z: number } };
  PROFILES: Record<'ovate' | 'round' | 'lanceolate' | 'ray' | 'leaf' | 'oval' | 'wing', (u: number) => number>;
  GOLDEN: number;
  TAU: number;
}

export interface ProductInfo {
  name: string;
  slug: string;
  attr: string;
  version: string;
  description?: string;
}

export const VERSION: string;
export const PRODUCT: ProductInfo;
export const SPECIES: Record<SpeciesKey, Required<Pick<SpeciesDef, 'index' | 'name' | 'latin' | 'build'>> & Pick<SpeciesDef, 'kind' | 'bonus'>>;
export const LAYERS: Layer[];
export const DEFAULTS: Required<SpecimenOptions>;
export const FACES: string[];
export const geometry: Geometry;

export function createSpecimen(canvas: HTMLCanvasElement, options?: SpecimenOptions): SpecimenInstance;
/** The product's own name for createSpecimen. */
export function createBestiary(canvas: HTMLCanvasElement, options?: SpecimenOptions): SpecimenInstance;
export function mount(target?: string | Element | ArrayLike<Element> | null, options?: SpecimenOptions): SpecimenInstance[];
export function faceCycle(el: Element | null, options?: FaceCycleOptions): FaceCycle;
