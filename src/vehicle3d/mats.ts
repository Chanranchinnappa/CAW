import * as THREE from 'three';

const std = (color: number | string, roughness: number, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

/** Shared materials. The paint material is edited in place so colour changes can ease. */
export class Mats {
  paint = new THREE.MeshPhysicalMaterial({ color: '#2e3a2b', roughness: 0.5, metalness: 0.08, clearcoat: 0.35, clearcoatRoughness: 0.35 });
  black = std(0x0f1012, 0.6);
  plastic = std(0x1a1c1f, 0.78);
  steel = std(0x9aa0a6, 0.38, 1);
  darkSteel = std(0x2b2e33, 0.5, 0.85);
  chrome = std(0xe6e9ed, 0.1, 1);
  rubber = std(0x0d0d0e, 0.96);
  underbody = std(0x151618, 0.9, 0.2);
  floor = std(0x22252a, 0.95);
  headlight = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xffe9b0, emissiveIntensity: 0.9, roughness: 0.12 });
  amber = new THREE.MeshStandardMaterial({ color: 0xff9a1f, emissive: 0xff7a00, emissiveIntensity: 0.55, roughness: 0.25 });
  tail = new THREE.MeshStandardMaterial({ color: 0xc41a1a, emissive: 0x7a0000, emissiveIntensity: 0.5, roughness: 0.25 });
  glass = new THREE.MeshPhysicalMaterial({
    color: 0x9fb4bf,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.28,
    envMapIntensity: 1.6,
    depthWrite: false,
  });
  canvas = new THREE.MeshStandardMaterial({ color: 0x5b6446, roughness: 1 });
  canvasDark = new THREE.MeshStandardMaterial({ color: 0x2f3526, roughness: 1 });
  seat = new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.6 });
  seatAccent = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.7 });
  rimDisc = std(0x4c5258, 0.5, 0.6);
  rimDark = std(0x1c1e21, 0.45, 0.7);
  tyre = new THREE.MeshStandardMaterial({ color: 0x151516, roughness: 0.92 });
  rope = std(0xd04a1a, 0.7);
  alu = std(0xb9bec4, 0.45, 1);

  dispose() {
    Object.values(this).forEach((v) => {
      if (v instanceof THREE.Material) v.dispose();
    });
    this.tyre.bumpMap?.dispose();
  }
}

const treadCache = new Map<string, THREE.CanvasTexture>();

/** Greyscale height map for a tyre tread: lighter is raised. */
export function treadTexture(kind: 'mud' | 'allterrain' | 'bar'): THREE.CanvasTexture {
  const cached = treadCache.get(kind);
  if (cached) return cached;
  const W = 1024;
  const H = 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#6a6a6a';
  g.fillRect(0, 0, W, H);
  const y0 = H * 0.34;
  const y1 = H * 0.66;
  g.fillStyle = '#1d1d1d';
  g.fillRect(0, y0, W, y1 - y0);
  g.fillStyle = '#f2f2f2';
  if (kind === 'mud') {
    const n = 26;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W;
      const w = (W / n) * 0.55;
      // centre lug and two shoulder lugs, offset against each other
      g.fillRect(x + 4, y0 + 6, w, (y1 - y0) * 0.42);
      g.fillRect(x + W / n / 2 + 4, y1 - (y1 - y0) * 0.5, w, (y1 - y0) * 0.44);
      g.fillRect(x + 4, y0 - 10, w * 0.8, 18);
      g.fillRect(x + W / n / 2 + 4, y1 - 8, w * 0.8, 18);
    }
  } else if (kind === 'allterrain') {
    const n = 40;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W;
      const w = (W / n) * 0.62;
      g.fillRect(x + 2, y0 + 4, w, (y1 - y0) - 8);
      g.fillStyle = '#9a9a9a';
      g.fillRect(x + 2 + w * 0.45, y0 + 4, 2, (y1 - y0) - 8);
      g.fillStyle = '#f2f2f2';
    }
    g.fillStyle = '#2a2a2a';
    g.fillRect(0, (y0 + y1) / 2 - 2, W, 4);
  } else {
    // chevron bars
    const n = 30;
    const mid = (y0 + y1) / 2;
    g.lineWidth = 14;
    g.strokeStyle = '#f2f2f2';
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W;
      g.beginPath();
      g.moveTo(x, y0 + 4);
      g.lineTo(x + 22, mid);
      g.lineTo(x, y1 - 4);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  treadCache.set(kind, tex);
  return tex;
}
