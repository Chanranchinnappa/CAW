import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type P2 = [number, number];

/** Polygon with every corner rounded by `radius` (a number, or one value per corner). */
export function roundedPolygon(pts: P2[], radius: number | number[]): THREE.Shape {
  const n = pts.length;
  const corners = pts.map((p, i) => {
    const a = pts[(i + n - 1) % n];
    const b = pts[(i + 1) % n];
    const rr = Array.isArray(radius) ? radius[i] : radius;
    const da = Math.hypot(a[0] - p[0], a[1] - p[1]);
    const db = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const r = Math.max(0, Math.min(rr, da * 0.5, db * 0.5));
    return {
      p,
      s: [p[0] + ((a[0] - p[0]) / da) * r, p[1] + ((a[1] - p[1]) / da) * r] as P2,
      e: [p[0] + ((b[0] - p[0]) / db) * r, p[1] + ((b[1] - p[1]) / db) * r] as P2,
    };
  });
  const shape = new THREE.Shape();
  shape.moveTo(corners[0].e[0], corners[0].e[1]);
  for (let i = 1; i < n; i++) {
    const c = corners[i];
    shape.lineTo(c.s[0], c.s[1]);
    shape.quadraticCurveTo(c.p[0], c.p[1], c.e[0], c.e[1]);
  }
  shape.lineTo(corners[0].s[0], corners[0].s[1]);
  shape.quadraticCurveTo(corners[0].p[0], corners[0].p[1], corners[0].e[0], corners[0].e[1]);
  shape.closePath();
  return shape;
}

/** Points on the upper half of a wheel arch cut into a flat bottom edge at y = 0, travelling +x. */
export function archNotch(cx: number, cy: number, r: number, steps = 22): P2[] {
  const a0 = Math.asin(Math.max(-0.98, Math.min(0.98, cy / r)));
  const from = Math.PI + a0;
  const to = -a0;
  const out: P2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

/** Extrude an x/y profile across z, from z0 to z0 + depth. */
export function panelGeometry(shape: THREE.Shape, depth: number, z0: number, bevel = 0.008): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 10,
  });
  g.translate(0, 0, z0 + bevel);
  return g;
}

export function rbox(w: number, h: number, d: number, r = 0.012): THREE.BufferGeometry {
  const rr = Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005);
  return rr > 0.001 ? new RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d);
}

export function disposeTree(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}
