import * as THREE from 'three';
import { Mats } from './mats';
import { VehicleSpec } from './specs';
import { P2, archNotch, panelGeometry, rbox, roundedPolygon } from './geo';
import { buildWheel } from './wheel';
import { TyreDims, WheelStyle } from './specs';

export interface Ctx {
  spec: VehicleSpec;
  /** Tyre radius. */
  r: number;
  /** Height of the wheel centre above the sill underside (negative: below it). */
  wy0: number;
  /** Wheel arch radius. */
  ar: number;
  mats: Mats;
  tyre: TyreDims;
  style: WheelStyle;
}

export function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

/** A square-section bar between two points. */
export function bar(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, t: number, mat: THREE.Material, round = false): THREE.Mesh {
  const len = a.distanceTo(b);
  const g = round ? new THREE.CylinderGeometry(t / 2, t / 2, len, 12) : new THREE.BoxGeometry(t, len, t);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function archTrim(parent: THREE.Object3D, cx: number, cy: number, r: number, z: number, mat: THREE.Material, w = 0.026) {
  const pts: THREE.Vector3[] = [];
  const a0 = Math.asin(Math.max(-0.98, Math.min(0.98, cy / r)));
  const from = Math.PI + a0;
  const to = -a0;
  for (let i = 0; i <= 24; i++) {
    const t = from + ((to - from) * i) / 24;
    pts.push(V(cx + (r + 0.004) * Math.cos(t), cy + (r + 0.004) * Math.sin(t), z));
  }
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, w, 8, false);
  add(parent, tube, mat);
}

export function seat(parent: THREE.Object3D, x: number, y: number, z: number, w: number, mats: Mats, tall = true) {
  const g = new THREE.Group();
  add(g, rbox(0.46, 0.13, w, 0.04), mats.seat, 0, 0, 0);
  const back = add(g, rbox(0.1, tall ? 0.52 : 0.44, w - 0.02, 0.04), mats.seat, -0.22, 0.26, 0);
  back.rotation.z = 0.12;
  if (tall) add(g, rbox(0.07, 0.15, w * 0.6, 0.03), mats.seatAccent, -0.26, 0.58, 0).rotation.z = 0.12;
  add(g, rbox(0.4, 0.04, w - 0.1, 0.015), mats.seatAccent, 0.01, 0.075, 0);
  g.position.set(x, y, z);
  parent.add(g);
}

export function steering(parent: THREE.Object3D, x: number, y: number, z: number, mats: Mats) {
  const g = new THREE.Group();
  const ring = new THREE.TorusGeometry(0.17, 0.022, 10, 36);
  const w = add(g, ring, mats.black);
  w.rotation.y = Math.PI / 2;
  const hub = add(g, new THREE.CylinderGeometry(0.04, 0.05, 0.04, 14), mats.black);
  hub.rotation.z = Math.PI / 2;
  for (const a of [0, 2.1, 4.2]) {
    const sp = add(g, new THREE.BoxGeometry(0.012, 0.17, 0.02), mats.black);
    sp.position.set(0, 0, 0);
    sp.rotation.x = a;
    sp.rotation.set(a, 0, 0);
    sp.position.set(0, Math.cos(a) * 0.0, 0);
  }
  g.rotation.z = -0.5;
  g.position.set(x, y, z);
  parent.add(g);
  const col = add(parent, new THREE.CylinderGeometry(0.025, 0.03, 0.4, 10), mats.black, x + 0.18, y - 0.15, z);
  col.rotation.z = -1.0;
}

/* ===========================================================================
   Open jeep-style tub with separate fenders (MM540, Commander, Major, Gypsy)
   ======================================================================== */
export function buildJeepShell(c: Ctx): THREE.Group {
  const { spec, mats, ar, wy0 } = c;
  const g = new THREE.Group();
  const W = spec.width;
  const front = spec.length / 2;
  const rear = -spec.length / 2;
  const axF = spec.wheelbase / 2;
  const axR = -spec.wheelbase / 2;
  const belt = spec.beltH;
  const hoodH = spec.hoodH;
  const cowl = spec.cowlX;
  const fw = spec.fenderWidth;

  // ----- tub sides with the rear wheel arch cut out -----
  const pts: P2[] = [[rear + 0.02, 0], ...archNotch(axR, wy0, ar), [cowl, 0], [cowl, belt], [rear + 0.02, belt]];
  const radii = pts.map((_, i) => (i === 0 || i >= pts.length - 3 ? 0.03 : 0));
  const side = roundedPolygon(pts, radii);
  for (const s of [1, -1]) {
    const z0 = s > 0 ? W / 2 - 0.06 : -W / 2;
    add(g, panelGeometry(side, 0.06, z0, 0.006), mats.paint);
    archTrim(g, axR, wy0, ar, s * (W / 2 + 0.002), mats.plastic);
    // rolled top rail
    add(g, new THREE.CylinderGeometry(0.02, 0.02, cowl - rear - 0.06, 10).rotateZ(Math.PI / 2), mats.paint, (cowl + rear) / 2, belt, s * (W / 2 - 0.03));
    // side step
    add(g, rbox(0.62, 0.025, 0.12, 0.01), mats.darkSteel, cowl - 0.5, -0.045, s * (W / 2 - 0.02));
  }
  // rear panel + floor + wheel humps
  add(g, rbox(0.06, belt, W - 0.01, 0.015), mats.paint, rear + 0.03, belt / 2, 0);
  add(g, rbox(cowl - rear, 0.05, W - 0.1, 0.01), mats.floor, (cowl + rear) / 2, 0.02, 0);
  for (const s of [1, -1]) {
    add(g, rbox(ar * 1.7, wy0 + ar + 0.03 > 0.05 ? wy0 + ar + 0.03 : 0.05, 0.26, 0.04), mats.paint, axR, (wy0 + ar + 0.03) / 2, s * (W / 2 - 0.19));
  }
  add(g, rbox(0.06, 0.12, W - 0.01, 0.02), mats.paint, rear + 0.03, belt + 0.005, 0);

  // ----- cowl / dash -----
  add(g, rbox(0.32, hoodH - 0.08, W - 0.06, 0.04), mats.seatAccent, cowl - 0.16, (hoodH - 0.08) / 2, 0);
  add(g, rbox(0.34, 0.06, W - 0.08, 0.03), mats.paint, cowl - 0.15, hoodH - 0.08, 0);
  for (const s of [1, -1]) {
    add(g, rbox(0.1, 0.1, 0.26, 0.02), mats.black, cowl - 0.24, hoodH - 0.04, s * 0.34); // gauge pod
  }

  // ----- hood, fenders, engine bay -----
  const hoodLen = front - 0.1 - cowl;
  const hoodW = W - 2 * fw + 0.04;
  add(g, rbox(hoodLen, 0.15, hoodW, spec.hoodRound), mats.paint, cowl + hoodLen / 2, hoodH - 0.075, 0);
  add(g, rbox(hoodLen - 0.04, hoodH - 0.2, W - 2 * fw + 0.02, 0.01), mats.underbody, cowl + hoodLen / 2, (hoodH - 0.2) / 2 + 0.03, 0);
  // hood latch and centre ridge
  add(g, rbox(hoodLen * 0.96, 0.02, 0.05, 0.01), mats.paint, cowl + hoodLen / 2, hoodH + 0.005, 0);

  const x0 = axF - Math.sqrt(Math.max(0.01, ar * ar - wy0 * wy0)) - 0.03;
  const fPts: P2[] = [
    [x0, 0],
    ...archNotch(axF, wy0, ar),
    [front - 0.05, 0],
    [front - 0.05, hoodH - 0.04],
    [cowl + 0.02, hoodH - 0.04],
    [x0, wy0 + ar + 0.08],
  ];
  const fRadii = fPts.map((_, i) => (i === 0 ? 0.02 : i > fPts.length - 5 ? 0.05 : 0));
  const fenderShape = roundedPolygon(fPts, fRadii);
  for (const s of [1, -1]) {
    const z0 = s > 0 ? W / 2 - fw : -W / 2;
    add(g, panelGeometry(fenderShape, fw, z0, 0.012), mats.paint);
    archTrim(g, axF, wy0, ar, s * (W / 2 + 0.002), mats.plastic);
    archTrim(g, axF, wy0, ar, s * (W / 2 - fw - 0.002), mats.underbody, 0.012);
    // headlamp bucket
    const hz = s * (W / 2 - 0.2);
    const hy = hoodH - 0.22;
    const bucket = add(g, new THREE.CylinderGeometry(0.095, 0.095, 0.1, 28).rotateZ(Math.PI / 2), mats.chrome, front - 0.0, hy, hz);
    bucket.castShadow = false;
    add(g, new THREE.SphereGeometry(0.082, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(-Math.PI / 2), mats.headlight, front + 0.035, hy, hz);
    add(g, new THREE.TorusGeometry(0.093, 0.011, 8, 28).rotateY(Math.PI / 2), mats.chrome, front + 0.052, hy, hz);
    // indicator
    add(g, rbox(0.04, 0.06, 0.1, 0.015), mats.amber, front - 0.03, hoodH - 0.2 - 0.14, s * (W / 2 - 0.2 + 0.0));
    add(g, rbox(0.03, 0.05, 0.08, 0.01), mats.amber, front - 0.04, hoodH - 0.11, s * (W / 2 - 0.05));
  }

  // ----- grille and nose -----
  const gw = W - 2 * fw + 0.04;
  const gh = hoodH - 0.28;
  const gx = front - 0.06;
  add(g, rbox(0.07, gh, gw, 0.015), mats.paint, gx, 0.2 + gh / 2, 0);
  if (spec.grille === 'slots') {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const z = ((i - (n - 1) / 2) * (gw - 0.12)) / (n - 1);
      add(g, rbox(0.012, gh * 0.72, 0.03, 0.005), mats.black, gx + 0.037, 0.2 + gh / 2, z);
    }
  } else {
    for (let i = 0; i < 6; i++) {
      add(g, rbox(0.012, 0.03, gw - 0.1, 0.005), mats.black, gx + 0.037, 0.26 + (i * (gh - 0.16)) / 5 + 0.04, 0);
    }
  }
  add(g, rbox(0.1, 0.18, W - 0.02, 0.015), mats.underbody, front - 0.12, 0.09, 0);

  // ----- bumpers -----
  add(g, rbox(0.1, 0.16, W + 0.04, 0.03), mats.darkSteel, front + 0.04, 0.055, 0);
  add(g, rbox(0.09, 0.14, W + 0.04, 0.03), mats.darkSteel, rear - 0.045, 0.06, 0);
  for (const s of [1, -1]) {
    add(g, new THREE.TorusGeometry(0.035, 0.01, 8, 16).rotateY(Math.PI / 2), mats.darkSteel, front + 0.09, 0.02, s * 0.32);
    add(g, rbox(0.04, 0.1, 0.12, 0.01), mats.tail, rear + 0.0, belt - 0.14, s * (W / 2 - 0.07)); // tail lamp
  }
  // number plate
  add(g, rbox(0.01, 0.12, 0.34, 0.005), mats.chrome, rear - 0.003, belt - 0.2, 0);

  return g;
}

/* ===========================================================================
   Closed SUV body (Bolero, Safari)
   ======================================================================== */
export function buildSuvShell(c: Ctx): THREE.Group {
  const { spec, mats, ar, wy0 } = c;
  const g = new THREE.Group();
  const W = spec.width;
  const front = spec.length / 2;
  const rear = -spec.length / 2;
  const axF = spec.wheelbase / 2;
  const axR = -spec.wheelbase / 2;
  const belt = spec.beltH;
  const hoodH = spec.hoodH;
  const cowl = spec.cowlX;

  const pts: P2[] = [
    [rear, 0.0],
    ...archNotch(axR, wy0, ar),
    ...archNotch(axF, wy0, ar),
    [front, 0.0],
    [front, hoodH - 0.1],
    [front - 0.12, hoodH],
    [cowl, hoodH],
    [cowl - 0.04, belt],
    [rear, belt],
  ];
  const nA = archNotch(0, 0, 1).length;
  const radii = pts.map((_, i) => {
    const inArch = (i >= 1 && i <= nA) || (i >= 1 + nA && i <= 2 * nA);
    return inArch ? 0 : 0.045;
  });
  const bodyShape = roundedPolygon(pts, radii);
  add(g, panelGeometry(bodyShape, W - 0.02, -W / 2 + 0.01, 0.012), mats.paint);

  // arch flares, sill cladding
  for (const s of [1, -1]) {
    archTrim(g, axR, wy0, ar, s * (W / 2 - 0.006), mats.plastic, 0.03);
    archTrim(g, axF, wy0, ar, s * (W / 2 - 0.006), mats.plastic, 0.03);
    add(g, rbox(spec.wheelbase - 2 * ar + 0.1, 0.14, 0.02, 0.01), mats.plastic, 0, 0.1, s * (W / 2 + 0.002));
    // door lines
    for (const dx of [cowl - 0.62, cowl - 1.28, rear + 0.28]) {
      add(g, new THREE.BoxGeometry(0.006, belt - 0.2, 0.004), mats.black, dx, belt / 2 + 0.06, s * (W / 2 + 0.004));
    }
    // handles
    for (const dx of [cowl - 0.78, cowl - 1.15]) {
      add(g, rbox(0.14, 0.022, 0.03, 0.008), mats.black, dx, belt - 0.12, s * (W / 2 + 0.01));
    }
    // mirror
    add(g, rbox(0.05, 0.12, 0.2, 0.02), mats.plastic, cowl - 0.08, belt + 0.12, s * (W / 2 + 0.17));
    add(g, new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6).rotateX(Math.PI / 2), mats.plastic, cowl - 0.1, belt + 0.1, s * (W / 2 + 0.06));
    // headlamps
    add(g, rbox(0.04, 0.15, 0.3, 0.025), mats.headlight, front + 0.001, hoodH - 0.22, s * (W / 2 - 0.26));
    add(g, rbox(0.045, 0.16, 0.34, 0.025), mats.chrome, front - 0.012, hoodH - 0.22, s * (W / 2 - 0.26)).scale.set(1, 1, 1);
    add(g, rbox(0.04, 0.05, 0.1, 0.015), mats.amber, front + 0.0, hoodH - 0.36, s * (W / 2 - 0.12));
    // fog lamps
    add(g, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16).rotateZ(Math.PI / 2), mats.headlight, front + 0.12, 0.2, s * (W / 2 - 0.3));
    // tail lamps
    add(g, rbox(0.04, 0.36, 0.1, 0.02), mats.tail, rear - 0.0, belt - 0.2, s * (W / 2 - 0.07));
  }

  // grille
  const gw = W - 0.7;
  add(g, rbox(0.05, 0.3, gw, 0.02), mats.black, front + 0.0, hoodH - 0.2, 0);
  if (spec.grille === 'mesh') {
    for (let i = 0; i < 5; i++) add(g, rbox(0.012, 0.012, gw - 0.04, 0.004), mats.chrome, front + 0.03, hoodH - 0.32 + i * 0.058, 0);
    for (let i = 0; i < 12; i++) add(g, rbox(0.012, 0.28, 0.01, 0.003), mats.chrome, front + 0.03, hoodH - 0.2, -gw / 2 + 0.03 + (i * (gw - 0.06)) / 11);
  } else {
    for (let i = 0; i < 4; i++) add(g, rbox(0.014, 0.034, gw - 0.04, 0.006), mats.chrome, front + 0.03, hoodH - 0.31 + i * 0.075, 0);
  }

  // bumpers (plastic)
  add(g, rbox(0.17, 0.24, W + 0.02, 0.06), mats.plastic, front + 0.05, 0.16, 0);
  add(g, rbox(0.16, 0.24, W + 0.02, 0.06), mats.plastic, rear - 0.05, 0.16, 0);
  add(g, rbox(0.01, 0.12, 0.38, 0.005), mats.chrome, rear - 0.12, 0.2, 0);

  // lower front valance hides the underside
  add(g, rbox(0.04, 0.2, W - 0.6, 0.01), mats.underbody, front - 0.06, 0.1, 0);
  // wipers
  for (const dz of [-0.28, 0.28]) {
    add(g, rbox(0.01, 0.008, 0.42, 0.003), mats.black, cowl + 0.02, hoodH + 0.015, dz).rotation.y = 0.0;
  }
  return g;
}
