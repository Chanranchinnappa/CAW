import * as THREE from 'three';
import { Ctx, V, add, bar, seat, steering } from './shell';
import { P2, panelGeometry, rbox, roundedPolygon } from './geo';
import { ArmorOption, TopOption } from '../types';

/* ----------------------------------------------------------------- windscreen */

export function windscreen(c: Ctx, g: THREE.Group) {
  const { spec, mats } = c;
  const W = spec.width;
  const zz = W / 2 - 0.07;
  const base = V(spec.cowlX - 0.02, spec.hoodH - 0.02, 0);
  const top = V(spec.cowlX - spec.screenRake, spec.roofH - (spec.kind === 'jeep' ? 0.0 : 0.0), 0);
  for (const s of [1, -1]) {
    bar(g, base.clone().setZ(s * zz), top.clone().setZ(s * zz), 0.045, mats.black);
  }
  bar(g, top.clone().setZ(-zz), top.clone().setZ(zz), 0.045, mats.black);
  bar(g, base.clone().setZ(-zz), base.clone().setZ(zz), 0.04, mats.black);
  const len = base.distanceTo(top) - 0.06;
  const glass = add(g, new THREE.BoxGeometry(0.008, len, W - 0.2), mats.glass);
  glass.castShadow = false;
  glass.position.copy(base).add(top).multiplyScalar(0.5);
  glass.quaternion.setFromUnitVectors(V(0, 1, 0), top.clone().sub(base).normalize());
  // wiper arms
  for (const dz of [-0.3, 0.3]) bar(g, V(base.x + 0.02, base.y + 0.02, dz), V(base.x + 0.02, base.y + 0.02, dz + 0.4), 0.012, mats.black);
}

/* ------------------------------------------------------------------ roll hoop */

export function rollHoop(c: Ctx, g: THREE.Group, x: number) {
  const { spec, mats } = c;
  const zz = spec.width / 2 - 0.1;
  const y0 = spec.beltH - 0.05;
  const y1 = spec.roofH - 0.12;
  for (const s of [1, -1]) {
    bar(g, V(x, y0, s * zz), V(x, y1, s * zz), 0.05, mats.darkSteel, true);
    bar(g, V(x, y1, s * zz), V(x - 0.5, y0 + 0.05, s * zz), 0.04, mats.darkSteel, true);
  }
  bar(g, V(x, y1, -zz), V(x, y1, zz), 0.05, mats.darkSteel, true);
}

/* ------------------------------------------------------------------ soft top */

function softTop(c: Ctx, g: THREE.Group, light: boolean) {
  const { spec, mats } = c;
  const W = spec.width;
  const fabric = light ? 0xb8a77b : 0x4f5a3c;
  mats.canvas.color.setHex(fabric);
  mats.canvasDark.color.setHex(light ? 0x8f805a : 0x394230);
  const x0 = spec.cowlX - spec.screenRake - 0.02;
  const x1 = spec.cabinRearX + 0.12;
  const len = x0 - x1;
  const y = spec.roofH;
  add(g, rbox(len, 0.04, W - 0.1, 0.018), mats.canvas, (x0 + x1) / 2, y + 0.02, 0);
  add(g, rbox(0.1, 0.07, W - 0.1, 0.03), mats.canvasDark, x0 + 0.03, y + 0.0, 0);
  const rearH = y - spec.beltH - 0.04;
  const curtain = add(g, rbox(0.035, rearH, W - 0.1, 0.012), mats.canvas, x1 - 0.015, spec.beltH + 0.04 + rearH / 2, 0);
  curtain.rotation.z = -0.06;
  for (const px of [x0 - 0.35, (x0 + x1) / 2, x1 + 0.25]) {
    bar(g, V(px, y - 0.012, -(W / 2 - 0.07)), V(px, y - 0.012, W / 2 - 0.07), 0.028, mats.darkSteel, true);
  }
  for (const s of [1, -1]) {
    const zz = s * (W / 2 - 0.06);
    bar(g, V(x1 + 0.04, spec.beltH, zz), V(x1 + 0.04, y, zz), 0.035, mats.darkSteel, true);
    bar(g, V((x0 + x1) / 2, spec.beltH, zz), V((x0 + x1) / 2, y, zz), 0.035, mats.darkSteel, true);
    const roll = add(g, new THREE.CylinderGeometry(0.04, 0.04, len - 0.14, 14).rotateZ(Math.PI / 2), mats.canvasDark, (x0 + x1) / 2, y - 0.07, zz);
    roll.castShadow = true;
    for (const bx of [x0 - 0.3, (x0 + x1) / 2, x1 + 0.3]) {
      add(g, rbox(0.04, 0.09, 0.1, 0.01), mats.black, bx, y - 0.07, zz);
    }
  }
}

function bimini(c: Ctx, g: THREE.Group) {
  const { spec, mats } = c;
  const W = spec.width;
  mats.canvas.color.setHex(0xc4b58a);
  const x0 = spec.cowlX - spec.screenRake - 0.03;
  const len = 1.35;
  const y = spec.roofH;
  add(g, rbox(len, 0.025, W - 0.14, 0.012), mats.canvas, x0 - len / 2, y + 0.02, 0);
  for (const s of [1, -1]) {
    const zz = s * (W / 2 - 0.09);
    bar(g, V(x0 - len + 0.05, spec.beltH, zz), V(x0 - len + 0.05, y, zz), 0.035, mats.darkSteel, true);
    bar(g, V(x0, y, zz), V(x0 - len, y, zz), 0.03, mats.darkSteel, true);
  }
  bar(g, V(x0 - len + 0.05, y, -(W / 2 - 0.09)), V(x0 - len + 0.05, y, W / 2 - 0.09), 0.03, mats.darkSteel, true);
}

/* ---------------------------------------------------------------- hard cabin */

function greenhouse(c: Ctx, g: THREE.Group, roofMat: THREE.Material, windscreenToo: boolean) {
  const { spec, mats } = c;
  const W = spec.width;
  const belt = spec.beltH;
  const roofY = spec.roofH;
  const x0 = spec.cowlX - 0.02;
  const xt0 = spec.cowlX - spec.screenRake;
  const xr = spec.cabinRearX;
  const xt1 = xr + (spec.kind === 'suv' ? 0.1 : 0.05);
  const pts: P2[] = [
    [x0, belt],
    [xt0, roofY],
    [xt1, roofY],
    [xr, belt],
  ];
  const gShape = roundedPolygon(pts, 0.02);
  const gd = W - 0.18;
  add(g, panelGeometry(gShape, gd, -gd / 2, 0.004), mats.glass).castShadow = false;

  const zz = W / 2 - 0.09;
  for (const s of [1, -1]) {
    // roof rail and pillars
    bar(g, V(xt0, roofY, s * zz), V(xt1, roofY, s * zz), 0.05, roofMat === mats.paint ? mats.paint : mats.black);
    bar(g, V(x0, belt, s * zz), V(xt0, roofY, s * zz), 0.06, mats.paint);
    bar(g, V(xr, belt, s * zz), V(xt1, roofY, s * zz), 0.07, mats.paint);
    const bx = (x0 + xr) / 2 - 0.05;
    bar(g, V(bx, belt, s * zz), V(bx - 0.02, roofY, s * zz), 0.055, mats.black);
    if (spec.kind === 'suv') {
      const cx = bx - (bx - xr) * 0.5;
      bar(g, V(cx, belt, s * zz), V(cx - 0.01, roofY, s * zz), 0.045, mats.black);
    }
  }
  // roof slab
  add(g, rbox(xt0 - xt1 + 0.06, 0.05, W - 0.08, 0.022), roofMat, (xt0 + xt1) / 2, roofY + 0.025, 0);
  bar(g, V(xt1 - 0.02, roofY + 0.01, -zz), V(xt1 - 0.02, roofY + 0.01, zz), 0.04, mats.black);
  if (windscreenToo) {
    bar(g, V(x0, belt + 0.005, -zz), V(x0, belt + 0.005, zz), 0.045, mats.black);
  }
}

function roofRack(c: Ctx, g: THREE.Group, tent: boolean) {
  const { spec, mats } = c;
  const W = spec.width;
  const y = spec.roofH + 0.1;
  const x0 = spec.cowlX - spec.screenRake - 0.15;
  const x1 = spec.cabinRearX + 0.1;
  const zz = W / 2 - 0.2;
  for (const s of [1, -1]) {
    bar(g, V(x0, y, s * zz), V(x1, y, s * zz), 0.04, mats.darkSteel, true);
    for (const px of [x0 - 0.05, (x0 + x1) / 2, x1 + 0.05]) {
      bar(g, V(px, spec.roofH + 0.04, s * zz), V(px, y, s * zz), 0.03, mats.darkSteel, true);
    }
  }
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const px = x0 + ((x1 - x0) * i) / n;
    bar(g, V(px, y + 0.002, -zz), V(px, y + 0.002, zz), 0.03, mats.darkSteel, true);
  }
  bar(g, V(x0, y, -zz), V(x0, y, zz), 0.04, mats.darkSteel, true);
  if (tent) {
    const len = Math.min(1.5, x0 - x1 - 0.2);
    const cx = (x0 + x1) / 2 - 0.08;
    add(g, rbox(len, 0.05, 1.18, 0.02), mats.darkSteel, cx, y + 0.055, 0);
    add(g, rbox(len, 0.24, 1.18, 0.1), mats.canvasDark, cx, y + 0.2, 0);
    mats.canvasDark.color.setHex(0x2e3328);
    bar(g, V(cx - len / 2, y + 0.06, 0.62), V(cx - len / 2 - 0.5, y - 0.7, 0.62), 0.03, mats.alu, true);
  }
}

/** Roof / cabin treatment for the chosen top option. */
export function buildTop(c: Ctx, top: TopOption): THREE.Group {
  const { spec, mats } = c;
  const g = new THREE.Group();
  const isJeep = spec.kind === 'jeep';
  const light = /sand/i.test(top.name);

  switch (top.type) {
    case 'hardtop':
      greenhouse(c, g, mats.paint, !isJeep || true);
      break;
    case 'expedition':
      greenhouse(c, g, mats.paint, true);
      roofRack(c, g, true);
      break;
    case 'canvas':
      if (isJeep) {
        windscreen(c, g);
        softTop(c, g, light);
      } else {
        mats.canvas.color.setHex(light ? 0xb8a77b : 0x4f5a3c);
        greenhouse(c, g, mats.canvas, true);
      }
      break;
    case 'bimini':
      windscreen(c, g);
      bimini(c, g);
      rollHoop(c, g, spec.cowlX - 1.0);
      break;
    case 'open-tub':
    default:
      windscreen(c, g);
      rollHoop(c, g, spec.cowlX - 1.0);
      break;
  }
  return g;
}

/* ----------------------------------------------------------------- interior */

export function buildInterior(c: Ctx): THREE.Group {
  const { spec, mats } = c;
  const g = new THREE.Group();
  const W = spec.width;
  const sy = spec.kind === 'jeep' ? 0.3 : 0.34;
  const fx = spec.cowlX - 0.52;
  seat(g, fx, sy, 0.34, 0.5, mats);
  seat(g, fx, sy, -0.34, 0.5, mats);
  steering(g, spec.cowlX - 0.34, spec.hoodH - 0.13, 0.34, mats);
  if (spec.rearSeat) {
    const rx = spec.kind === 'jeep' ? spec.cabinRearX + 0.5 : spec.cowlX - 1.7;
    seat(g, rx, sy, 0, W - 0.5, mats, false);
  }
  // gear levers
  add(g, new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), mats.black, fx + 0.22, 0.28, 0).rotation.z = 0.2;
  add(g, new THREE.CylinderGeometry(0.014, 0.014, 0.28, 8), mats.black, fx + 0.22, 0.26, 0.1).rotation.z = 0.35;
  return g;
}

/* -------------------------------------------------------------------- armour */

export function buildArmor(c: Ctx, selected: ArmorOption[]): THREE.Group {
  const { spec, mats } = c;
  const g = new THREE.Group();
  const W = spec.width;
  const front = spec.length / 2;
  const has = (cat: ArmorOption['category']) => selected.some((a) => a.category === cat);

  if (has('bumper')) {
    const x = front + 0.1;
    add(g, rbox(0.15, 0.22, W + 0.08, 0.025), mats.black, x, 0.07, 0);
    add(g, rbox(0.17, 0.045, W + 0.08, 0.02), mats.black, x + 0.01, 0.2, 0);
    for (const s of [1, -1]) {
      // wings with D-ring shackles
      const w = add(g, rbox(0.18, 0.26, 0.1, 0.02), mats.black, x - 0.02, 0.16, s * (W / 2 + 0.01));
      w.rotation.y = s * -0.15;
      add(g, new THREE.TorusGeometry(0.035, 0.009, 8, 20).rotateY(Math.PI / 2), mats.rope, x + 0.1, 0.02, s * (W / 2 - 0.2));
      add(g, rbox(0.03, 0.12, 0.05, 0.01), mats.rope, x + 0.095, 0.05, s * (W / 2 - 0.2));
    }
    // winch + fairlead
    add(g, rbox(0.2, 0.17, 0.44, 0.03), mats.darkSteel, x - 0.02, 0.1, 0);
    add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.32, 20).rotateX(Math.PI / 2), mats.steel, x + 0.02, 0.1, 0);
    add(g, rbox(0.04, 0.1, 0.28, 0.01), mats.steel, x + 0.1, 0.05, 0);
    for (const dz of [-0.07, 0.07]) add(g, new THREE.CylinderGeometry(0.014, 0.014, 0.09, 10), mats.black, x + 0.13, 0.05, dz);
    add(g, new THREE.TorusGeometry(0.03, 0.008, 8, 16), mats.steel, x + 0.14, 0.09, 0);
  }

  if (has('sliders')) {
    const x0 = -spec.wheelbase / 2 + 0.25;
    const x1 = spec.wheelbase / 2 - 0.25;
    for (const s of [1, -1]) {
      const z = s * (W / 2 - 0.045);
      bar(g, V(x0, -0.065, z), V(x1, -0.065, z), 0.095, mats.darkSteel, true);
      for (const x of [x0, x1]) add(g, new THREE.SphereGeometry(0.0475, 14, 10), mats.darkSteel, x, -0.065, z);
      for (const x of [x0 + 0.3, (x0 + x1) / 2, x1 - 0.3]) bar(g, V(x, -0.065, z), V(x, 0.03, s * (W / 2 - 0.12)), 0.035, mats.darkSteel, true);
    }
  }

  if (has('snorkel')) {
    const x = spec.cowlX + 0.07;
    const z = W / 2 - 0.05;
    const top = spec.roofH + (spec.kind === 'jeep' ? -0.02 : 0.05);
    bar(g, V(x, spec.hoodH - 0.1, z), V(x, top, z), 0.07, mats.black, true);
    add(g, new THREE.SphereGeometry(0.035, 10, 8), mats.black, x, top, z);
    const head = add(g, new THREE.CylinderGeometry(0.058, 0.07, 0.15, 18).rotateZ(Math.PI / 2), mats.black, x + 0.07, top + 0.01, z);
    head.castShadow = true;
    add(g, new THREE.CircleGeometry(0.055, 16).rotateY(Math.PI / 2), mats.underbody, x + 0.1475, top + 0.01, z);
    bar(g, V(x, spec.hoodH - 0.1, z - 0.03), V(x, spec.hoodH - 0.2, z - 0.1), 0.025, mats.black, true);
  }

  if (has('lighting')) {
    const y = has('bumper') ? 0.3 : 0.27;
    const x = front + (has('bumper') ? 0.12 : 0.04);
    for (const s of [1, -1]) {
      const z = s * 0.36;
      bar(g, V(x - 0.02, y - 0.1, z), V(x - 0.02, y, z), 0.025, mats.black, true);
      add(g, new THREE.CylinderGeometry(0.075, 0.075, 0.1, 24).rotateZ(Math.PI / 2), mats.black, x, y + 0.05, z);
      add(g, new THREE.CylinderGeometry(0.066, 0.066, 0.01, 24).rotateZ(Math.PI / 2), mats.headlight, x + 0.052, y + 0.05, z);
    }
  }

  if (has('skidplate')) {
    add(g, rbox(1.25, 0.032, W - 0.72, 0.012), mats.alu, 0.3, -0.16, 0);
    add(g, rbox(0.8, 0.032, W - 0.9, 0.012), mats.alu, -0.85, -0.14, 0);
  }
  return g;
}

/* ------------------------------------------------------------------ chassis */

export interface Shock {
  mesh: THREE.Group;
  /** Mount on the body, in body space. */
  top: THREE.Vector3;
  /** Mount on the axle, in world space. */
  bottom: THREE.Vector3;
}

export interface Chassis {
  ground: THREE.Group;
  frame: THREE.Group;
  leaves: THREE.Mesh[];
  shocks: Shock[];
  leafY: number;
}

function leafGeometry(a: number, halfLen: number, depth: number): THREE.BufferGeometry {
  const t = 0.05;
  const n = 14;
  const top: P2[] = [];
  const bot: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = -halfLen + (2 * halfLen * i) / n;
    const u = x / halfLen;
    const y = a * (1 - u * u);
    top.push([x, y + t]);
    bot.push([x, y]);
  }
  const shape = new THREE.Shape([...top, ...bot.reverse()].map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}

export function leafFor(a: number) {
  return leafGeometry(Math.max(0.02, a), 0.55, 0.07);
}

export function buildChassis(c: Ctx): Chassis {
  const { spec, mats, r } = c;
  const ground = new THREE.Group();
  const frame = new THREE.Group();
  const leaves: THREE.Mesh[] = [];
  const shocks: Shock[] = [];
  const WB = spec.wheelbase;
  const T = spec.track;

  for (const ax of [WB / 2, -WB / 2]) {
    const axle = add(ground, new THREE.CylinderGeometry(0.055, 0.055, T - 0.2, 16).rotateX(Math.PI / 2), mats.darkSteel, ax, r, 0);
    axle.castShadow = true;
    add(ground, new THREE.SphereGeometry(0.13, 18, 14), mats.darkSteel, ax, r, 0.14).scale.set(1, 1, 0.8);
    for (const s of [1, -1]) {
      add(ground, new THREE.CylinderGeometry(0.085, 0.085, 0.14, 18).rotateX(Math.PI / 2), mats.darkSteel, ax, r, s * (T / 2 - 0.14));
      // leaf spring pack
      const leaf = add(ground, leafFor(0.06), mats.darkSteel, ax, r + 0.055, s * (T / 2 - 0.3));
      leaves.push(leaf);
      // spring plate and U-bolts
      add(ground, rbox(0.2, 0.03, 0.12, 0.008), mats.black, ax, r + 0.07, s * (T / 2 - 0.3));
      // shock absorber
      const sg = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 10), mats.steel);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), mats.chrome);
      body.castShadow = true;
      sg.add(body, rod);
      ground.add(sg);
      shocks.push({
        mesh: sg,
        top: V(ax + 0.02, -0.04, s * (T / 2 - 0.4)),
        bottom: V(ax + 0.06, r + 0.06, s * (T / 2 - 0.4)),
      });
    }
  }
  bar(ground, V(WB / 2, r + 0.08, 0.1), V(-WB / 2, r + 0.08, -0.1), 0.075, mats.darkSteel, true);
  add(ground, rbox(0.42, 0.22, 0.34, 0.04), mats.darkSteel, 0.1, r + 0.2, 0);

  // body-mounted ladder frame
  for (const s of [1, -1]) {
    add(frame, rbox(spec.length - 0.5, 0.1, 0.07, 0.015), mats.darkSteel, 0, -0.06, s * 0.4);
  }
  for (const x of [-1.2, -0.3, 0.55, 1.15]) {
    add(frame, rbox(0.06, 0.07, 0.86, 0.01), mats.darkSteel, x * (spec.length / 3.9), -0.055, 0);
  }
  return { ground, frame, leaves, shocks, leafY: r + 0.055 };
}

export { buildWheel };
import { buildWheel } from './wheel';
