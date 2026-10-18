import * as THREE from 'three';
import { Mats, treadTexture } from './mats';
import { TyreDims, WheelStyle } from './specs';

const cyl = (rt: number, rb: number, h: number, seg = 32) => new THREE.CylinderGeometry(rt, rb, h, seg);

function mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D) {
  const o = new THREE.Mesh(g, m);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}

/**
 * Tyre and wheel with its axis along z and its face toward +z.
 * The tyre touches the ground when the group sits at y = dia / 2.
 */
export function buildWheel(dims: TyreDims, style: WheelStyle, mats: Mats): THREE.Group {
  const g = new THREE.Group();
  const R = dims.dia / 2;
  const rimR = dims.rim / 2;
  const hw = dims.width / 2;

  // ---- tyre ----
  const prof: [number, number][] = [
    [rimR + 0.004, -hw * 0.7],
    [rimR + (R - rimR) * 0.3, -hw * 0.97],
    [rimR + (R - rimR) * 0.66, -hw * 1.0],
    [R - 0.05, -hw * 0.94],
    [R - 0.014, -hw * 0.76],
    [R, -hw * 0.5],
    [R, hw * 0.5],
    [R - 0.014, hw * 0.76],
    [R - 0.05, hw * 0.94],
    [rimR + (R - rimR) * 0.66, hw * 1.0],
    [rimR + (R - rimR) * 0.3, hw * 0.97],
    [rimR + 0.004, hw * 0.7],
  ];
  const lathe = new THREE.LatheGeometry(
    prof.map(([r, y]) => new THREE.Vector2(r, y)),
    96,
  );
  lathe.rotateX(Math.PI / 2);
  const tyreMat = mats.tyre.clone();
  tyreMat.bumpMap = treadTexture(dims.tread);
  tyreMat.bumpScale = dims.tread === 'bar' ? 2.2 : 3.2;
  mesh(lathe, tyreMat, g);

  // ---- real tread blocks, so the silhouette is chunky and not just a painted texture ----
  if (dims.tread !== 'bar') {
    const mud = dims.tread === 'mud';
    const n = mud ? 30 : 44;
    const bw = dims.width * (mud ? 0.3 : 0.22);
    const bh = mud ? 0.03 : 0.016;
    const bt = ((Math.PI * 2 * R) / n) * (mud ? 0.5 : 0.58);
    const block = new THREE.BoxGeometry(bt, bh, bw);
    const rows = mud ? [-1, 0, 1] : [-1, 1];
    const inst = new THREE.InstancedMesh(block, mats.tyre, n * rows.length);
    inst.castShadow = true;
    const o = new THREE.Object3D();
    let k = 0;
    for (const row of rows) {
      for (let i = 0; i < n; i++) {
        const a = ((i + (row === 0 ? 0.5 : 0)) / n) * Math.PI * 2;
        const zc = row * dims.width * (mud ? 0.31 : 0.26);
        o.position.set(Math.cos(a) * (R + bh / 2 - 0.004), Math.sin(a) * (R + bh / 2 - 0.004), zc);
        o.rotation.set(0, 0, a + Math.PI / 2 - 0.0);
        o.rotateY(row * (mud ? 0.28 : 0.12));
        o.updateMatrix();
        inst.setMatrixAt(k++, o.matrix);
      }
    }
    g.add(inst);
    // shoulder lugs wrap round the corner of the tyre
    if (mud) {
      const sh = new THREE.InstancedMesh(new THREE.BoxGeometry(bt * 0.9, 0.05, 0.022), mats.tyre, n * 2);
      let j = 0;
      for (const side of [-1, 1]) {
        for (let i = 0; i < n; i++) {
          const a = ((i + 0.25) / n) * Math.PI * 2;
          const rr = R - 0.022;
          o.position.set(Math.cos(a) * rr, Math.sin(a) * rr, side * hw * 0.9);
          o.rotation.set(0, 0, a + Math.PI / 2);
          o.updateMatrix();
          sh.setMatrixAt(j++, o.matrix);
        }
      }
      g.add(sh);
    }
  }

  // ---- rim barrel ----
  const barrel = cyl(rimR * 0.985, rimR * 0.985, hw * 1.5, 48);
  barrel.rotateX(Math.PI / 2);
  mesh(barrel, mats.steel, g);

  // brake disc behind the face
  const disc = cyl(rimR * 0.72, rimR * 0.72, 0.022, 40);
  disc.rotateX(Math.PI / 2);
  const d = mesh(disc, mats.darkSteel, g);
  d.position.z = -hw * 0.22;

  const faceZ = hw * 0.34;
  const lugs = (rad: number, count = 6) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const l = cyl(0.014, 0.014, 0.02, 10);
      l.rotateX(Math.PI / 2);
      const m = mesh(l, mats.chrome, g);
      m.position.set(Math.cos(a) * rad, Math.sin(a) * rad, faceZ + 0.026);
    }
  };

  if (style === 'alloy') {
    // dark ten-spoke alloy with a machined lip
    const lip = new THREE.TorusGeometry(rimR * 0.97, 0.014, 10, 56);
    mesh(lip, mats.alu, g).position.z = hw * 0.74;
    const hub = cyl(0.07, 0.07, 0.04, 28);
    hub.rotateX(Math.PI / 2);
    mesh(hub, mats.rimDark, g).position.z = faceZ + 0.02;
    const spokes = 10;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      const len = rimR * 0.9 - 0.05;
      const s = new THREE.BoxGeometry(len, 0.042, 0.03);
      s.translate(len / 2 + 0.05, 0, 0);
      const m = mesh(s, mats.rimDark, g);
      m.rotation.z = a;
      m.position.z = faceZ;
    }
    const cap = cyl(0.034, 0.034, 0.016, 20);
    cap.rotateX(Math.PI / 2);
    mesh(cap, mats.alu, g).position.z = faceZ + 0.042;
    lugs(0.056, 5);
  } else if (style === 'beadlock') {
    // painted steel centre with a bolted beadlock ring
    const face = cyl(rimR * 0.9, rimR * 0.9, 0.022, 44);
    face.rotateX(Math.PI / 2);
    mesh(face, mats.rimDisc, g).position.z = faceZ;
    const dish = cyl(0.11, 0.1, 0.034, 28);
    dish.rotateX(Math.PI / 2);
    mesh(dish, mats.rimDisc, g).position.z = faceZ + 0.02;
    const ring = new THREE.TorusGeometry(rimR * 0.935, 0.03, 12, 64);
    mesh(ring, mats.black, g).position.z = hw * 0.72;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const b = cyl(0.012, 0.012, 0.022, 8);
      b.rotateX(Math.PI / 2);
      const m = mesh(b, mats.chrome, g);
      m.position.set(Math.cos(a) * rimR * 0.935, Math.sin(a) * rimR * 0.935, hw * 0.72 + 0.026);
    }
    // oval cut-outs read as shaded holes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const h = new THREE.CircleGeometry(0.036, 18);
      const m = mesh(h, mats.black, g);
      m.position.set(Math.cos(a) * rimR * 0.58, Math.sin(a) * rimR * 0.58, faceZ + 0.0125);
    }
    lugs(0.07, 6);
  } else {
    // stamped steel wheel with a rolled lip
    const face = cyl(rimR * 0.93, rimR * 0.93, 0.022, 44);
    face.rotateX(Math.PI / 2);
    mesh(face, mats.rimDisc, g).position.z = faceZ;
    const lip = new THREE.TorusGeometry(rimR * 0.965, 0.016, 10, 60);
    mesh(lip, mats.rimDisc, g).position.z = hw * 0.74;
    const dish = cyl(0.1, 0.085, 0.04, 28);
    dish.rotateX(Math.PI / 2);
    mesh(dish, mats.rimDisc, g).position.z = faceZ + 0.026;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const h = new THREE.CircleGeometry(0.03, 16);
      const m = mesh(h, mats.black, g);
      m.position.set(Math.cos(a) * rimR * 0.6, Math.sin(a) * rimR * 0.6, faceZ + 0.0115);
    }
    const cap = cyl(0.04, 0.04, 0.02, 20);
    cap.rotateX(Math.PI / 2);
    mesh(cap, mats.chrome, g).position.z = faceZ + 0.056;
    lugs(0.068, 6);
  }
  return g;
}
