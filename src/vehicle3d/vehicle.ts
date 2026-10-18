import * as THREE from 'three';
import { ConfiguratorState } from '../types';
import { ARMOR_OPTIONS, PAINT_OPTIONS, SUSPENSION_OPTIONS, TOP_OPTIONS, WHEEL_OPTIONS } from '../data/cawData';
import { Mats } from './mats';
import { FINISHES, SPECS, parseTyre, seatStyle, wheelStyle } from './specs';
import { Ctx, add, buildJeepShell, buildSuvShell } from './shell';
import { Chassis, buildArmor, buildChassis, buildInterior, buildTop, leafFor } from './extras';
import { buildWheel } from './wheel';
import { disposeTree } from './geo';

interface Slot {
  key: string;
  obj: THREE.Object3D | null;
  host: THREE.Object3D;
}

/** A configurable vehicle. Parts are rebuilt only when the option behind them changes. */
export class VehicleModel {
  readonly root = new THREE.Group();
  readonly mats = new Mats();
  private ground = new THREE.Group();
  private body = new THREE.Group();
  private slots = new Map<string, Slot>();
  private chassis: Chassis | null = null;

  private targetY = 0;
  private curY = 0;
  private leafA = -1;
  private paintTarget = new THREE.Color('#2e3a2b');
  private finishTarget = { ...FINISHES['Satin Estate'] };
  private snap = true;

  constructor() {
    this.root.add(this.ground, this.body);
  }

  private setSlot(name: string, key: string, host: THREE.Object3D, build: () => THREE.Object3D | null) {
    const cur = this.slots.get(name);
    if (cur && cur.key === key && cur.host === host) return;
    if (cur?.obj) {
      cur.host.remove(cur.obj);
      disposeTree(cur.obj);
    }
    const obj = build();
    if (obj) host.add(obj);
    this.slots.set(name, { key, obj, host });
  }

  apply(cfg: ConfiguratorState, instant = false) {
    const spec = SPECS[cfg.platformId];
    const wheel = WHEEL_OPTIONS.find((w) => w.id === cfg.wheelId) || WHEEL_OPTIONS[0];
    const susp = SUSPENSION_OPTIONS.find((s) => s.id === cfg.suspensionId) || SUSPENSION_OPTIONS[0];
    const top = TOP_OPTIONS.find((t) => t.id === cfg.topId) || TOP_OPTIONS[0];
    const paint = PAINT_OPTIONS.find((p) => p.id === cfg.paintId) || PAINT_OPTIONS[0];
    const armor = ARMOR_OPTIONS.filter((a) => cfg.selectedArmorIds.includes(a.id));

    const tyre = parseTyre(wheel.tyreSpec, wheel.rimSpec);
    const style = wheelStyle(wheel.id, wheel.rimSpec);
    const r = tyre.dia / 2;
    const ctx: Ctx = { spec, r, wy0: spec.stockTyreR - spec.baseClear, ar: r + 0.07, mats: this.mats, tyre, style };

    // ride height: bigger tyres and lift both raise the body
    this.targetY = spec.baseClear + (r - spec.stockTyreR) + susp.liftInches * 0.0254;
    if (instant || this.snap) {
      this.curY = this.targetY;
      this.snap = false;
    }

    // paint eases toward its target in tick()
    this.paintTarget.set(paint.hex);
    this.finishTarget = { ...(FINISHES[paint.finish] || FINISHES['Satin Estate']) };
    if (instant) this.mats.paint.color.copy(this.paintTarget);

    // seats
    const ss = seatStyle(cfg.interiorId);
    this.mats.seat.color.set(ss.base);
    this.mats.seat.roughness = ss.rough;
    this.mats.seatAccent.color.set(ss.accent);

    const pk = `${cfg.platformId}|${r.toFixed(3)}`;
    this.setSlot('shell', pk, this.body, () => (spec.kind === 'jeep' ? buildJeepShell(ctx) : buildSuvShell(ctx)));
    this.setSlot('chassis', pk, this.ground, () => {
      this.chassis = buildChassis(ctx);
      this.leafA = -1;
      return this.chassis.ground;
    });
    this.setSlot('frame', pk, this.body, () => this.chassis?.frame ?? null);
    this.setSlot('wheels', `${cfg.platformId}|${wheel.id}`, this.ground, () => {
      const g = new THREE.Group();
      for (const ax of [spec.wheelbase / 2, -spec.wheelbase / 2]) {
        for (const s of [1, -1]) {
          const w = buildWheel(tyre, style, this.mats);
          w.position.set(ax, r, s * (spec.track / 2));
          if (s < 0) w.rotation.y = Math.PI;
          g.add(w);
        }
      }
      return g;
    });
    this.setSlot('spare', `${cfg.platformId}|${wheel.id}`, this.body, () => {
      if (spec.spare === 'none') return null;
      const w = buildWheel(tyre, style, this.mats);
      w.rotation.y = -Math.PI / 2;
      w.position.set(-spec.length / 2 - 0.1 - tyre.width / 2, spec.beltH - 0.02, 0);
      const holder = new THREE.Group();
      holder.add(w);
      add(holder, new THREE.BoxGeometry(0.03, 0.1, 0.3), this.mats.darkSteel, -spec.length / 2 - 0.045, spec.beltH - 0.02, 0);
      return holder;
    });
    this.setSlot('top', `${cfg.platformId}|${top.id}`, this.body, () => buildTop(ctx, top));
    this.setSlot('interior', `${cfg.platformId}`, this.body, () => buildInterior(ctx));
    this.setSlot('armor', `${cfg.platformId}|${armor.map((a) => a.id).sort().join(',')}|${r.toFixed(3)}`, this.body, () =>
      buildArmor(ctx, armor),
    );
  }

  /** Advance eased values. Returns true while anything is still moving. */
  tick(dt: number): boolean {
    let moving = false;
    const k = 1 - Math.exp(-dt * 5);
    if (Math.abs(this.targetY - this.curY) > 0.0004) {
      this.curY += (this.targetY - this.curY) * k;
      moving = true;
    } else this.curY = this.targetY;
    this.body.position.y = this.curY;

    const kp = 1 - Math.exp(-dt * 7);
    const p = this.mats.paint;
    const dc = Math.abs(p.color.r - this.paintTarget.r) + Math.abs(p.color.g - this.paintTarget.g) + Math.abs(p.color.b - this.paintTarget.b);
    if (dc > 0.002) {
      p.color.lerp(this.paintTarget, kp);
      moving = true;
    } else p.color.copy(this.paintTarget);
    const f = this.finishTarget;
    p.roughness += (f.roughness - p.roughness) * kp;
    p.metalness += (f.metalness - p.metalness) * kp;
    p.clearcoat += (f.clearcoat - p.clearcoat) * kp;
    p.clearcoatRoughness += (f.clearcoatRoughness - p.clearcoatRoughness) * kp;

    const ch = this.chassis;
    if (ch) {
      const a = Math.max(0.03, this.curY - 0.12 - ch.leafY - 0.05);
      if (Math.abs(a - this.leafA) > 0.004) {
        this.leafA = a;
        for (const leaf of ch.leaves) {
          leaf.geometry.dispose();
          leaf.geometry = leafFor(a);
        }
      }
      for (const s of ch.shocks) {
        const top = new THREE.Vector3(s.top.x, s.top.y + this.curY, s.top.z);
        const dir = top.clone().sub(s.bottom);
        const len = dir.length();
        s.mesh.position.copy(s.bottom).add(top).multiplyScalar(0.5);
        s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        s.mesh.scale.set(1, len, 1);
        const [bodyM, rodM] = s.mesh.children;
        bodyM.scale.set(1, 0.55, 1);
        bodyM.position.y = -0.225;
        rodM.scale.set(1, 0.55, 1);
        rodM.position.y = 0.225;
      }
    }
    return moving;
  }

  dispose() {
    disposeTree(this.root);
    this.mats.dispose();
  }
}
