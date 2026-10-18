/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ConfiguratorState } from '../types';
import { VehicleModel } from '../vehicle3d/vehicle';

export type ViewPreset = 'angle' | 'side' | 'front' | 'rear' | 'top';

/** Camera positions as [azimuth, polar, distance]. Azimuth 0 looks at the right-hand side, +90 deg at the front. */
const PRESETS: Record<ViewPreset, [number, number, number]> = {
  angle: [0.78, 1.33, 8.4],
  side: [0.0, 1.5, 9.4],
  front: [Math.PI / 2, 1.45, 8.6],
  rear: [-Math.PI / 2, 1.42, 8.8],
  top: [0.5, 0.2, 10.5],
};

export interface StageHandle {
  setView: (v: ViewPreset) => void;
}

interface Props {
  config: ConfiguratorState;
  onFail?: () => void;
  onInteract?: () => void;
}

const angleDelta = (a: number, b: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export const VehicleStage = forwardRef<StageHandle, Props>(function VehicleStage({ config, onFail, onInteract }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<VehicleModel | null>(null);
  const goalRef = useRef<{ az: number; polar: number; dist: number } | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const interactRef = useRef(onInteract);
  interactRef.current = onInteract;
  const dirtyRef = useRef(true);

  useImperativeHandle(ref, () => ({
    setView(v) {
      const [az, polar, dist] = PRESETS[v];
      goalRef.current = { az, polar, dist };
      dirtyRef.current = true;
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      onFail?.();
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.85;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    const target = new THREE.Vector3(0, 0.85, 0);
    const [az0, pol0, dist0] = PRESETS.angle;
    const sph = new THREE.Spherical(dist0, pol0, az0);
    camera.position.setFromSpherical(sph).add(target);
    camera.lookAt(target);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.rotateSpeed = 0.7;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.7;
    controls.update();

    let idleTimer: number | undefined;
    controls.addEventListener('start', () => {
      goalRef.current = null;
      controls.autoRotate = false;
      window.clearTimeout(idleTimer);
      interactRef.current?.();
      dirtyRef.current = true;
    });
    controls.addEventListener('end', () => {
      window.clearTimeout(idleTimer);
      if (!reduce) idleTimer = window.setTimeout(() => (controls.autoRotate = true), 6000);
    });
    controls.addEventListener('change', () => (dirtyRef.current = true));

    // lights
    const key = new THREE.DirectionalLight(0xfff1de, 2.4);
    key.position.set(5, 8, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 22;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcd2ff, 0.7);
    fill.position.set(-6, 3, -3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffc27a, 0.9);
    rim.position.set(-3, 4, 7);
    scene.add(rim);

    // ground: soft contact shadow and a faint turntable ring
    const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.38 }));
    floor.receiveShadow = true;
    scene.add(floor);
    const blobTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d')!;
      const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
      grd.addColorStop(0, 'rgba(0,0,0,0.62)');
      grd.addColorStop(0.55, 'rgba(0,0,0,0.28)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    })();
    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 3.4).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }),
    );
    blob.position.y = 0.004;
    scene.add(blob);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.55, 4.575, 128).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 }),
    );
    ring.position.y = 0.006;
    scene.add(ring);

    const model = new VehicleModel();
    model.root.traverse(() => undefined);
    model.apply(configRef.current, true);
    scene.add(model.root);
    modelRef.current = model;

    const size = () => {
      const w = host.clientWidth || 600;
      const h = host.clientHeight || 400;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the whole vehicle in frame on narrow stages
      camera.fov = w / h < 1.25 ? 30 + (1.25 - w / h) * 28 : 30;
      camera.updateProjectionMatrix();
      dirtyRef.current = true;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.01 });
    io.observe(host);

    let last = performance.now();
    renderer.setAnimationLoop((now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      const moving = model.tick(dt);
      const goal = goalRef.current;
      if (goal) {
        sph.setFromVector3(camera.position.clone().sub(controls.target));
        const k = 1 - Math.exp(-dt * 4.5);
        sph.theta += angleDelta(sph.theta, goal.az) * k;
        sph.phi += (goal.polar - sph.phi) * k;
        sph.radius += (goal.dist - sph.radius) * k;
        camera.position.setFromSpherical(sph).add(controls.target);
        if (Math.abs(angleDelta(sph.theta, goal.az)) < 0.002 && Math.abs(goal.polar - sph.phi) < 0.002) goalRef.current = null;
        dirtyRef.current = true;
      }
      const ctl = controls.update(dt);
      if (moving || dirtyRef.current || controls.autoRotate || ctl) {
        renderer.render(scene, camera);
        dirtyRef.current = moving || goalRef.current !== null || controls.autoRotate;
      }
    });

    return () => {
      window.clearTimeout(idleTimer);
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      model.dispose();
      blobTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    modelRef.current?.apply(config);
    dirtyRef.current = true;
  }, [config]);

  return <div ref={hostRef} className="absolute inset-0" />;
});
