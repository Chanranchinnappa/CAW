/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ConfiguratorState } from '../types';
import {
  VEHICLE_PLATFORMS,
  PAINT_OPTIONS,
  TOP_OPTIONS,
  SUSPENSION_OPTIONS,
  WHEEL_OPTIONS,
  ARMOR_OPTIONS,
  WORKSHOP_INFO,
} from '../data/cawData';
import {
  Box,
  Layers,
  RotateCw,
  Eye,
  Maximize2,
  Sliders,
  Sparkles,
  Info,
  Shield,
  Compass,
} from 'lucide-react';

interface ChassisVisualizer3DProps {
  config: ConfiguratorState;
  className?: string;
}

export type ViewAngleMode = 'isometric' | 'side-profile';
export type DisplayLayerMode = 'full-vehicle' | 'chassis-xray' | 'chassis-only';

export const ChassisVisualizer3D: React.FC<ChassisVisualizer3DProps> = ({
  config,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewAngleMode>('isometric');
  const [displayLayer, setDisplayLayer] = useState<DisplayLayerMode>('full-vehicle');
  const [yawAngle, setYawAngle] = useState<number>(-34); // Horizontal rotation in degrees
  const [pitchAngle, setPitchAngle] = useState<number>(22); // Vertical tilt in degrees
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  // Fit the fixed-size 3D model into narrow containers (phones)
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<number>(1);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      setFit(Math.max(0.45, Math.min(1, entry.contentRect.width / 620)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const platform =
    VEHICLE_PLATFORMS.find((p) => p.id === config.platformId) || VEHICLE_PLATFORMS[0];
  const paint = PAINT_OPTIONS.find((p) => p.id === config.paintId) || PAINT_OPTIONS[0];
  const top = TOP_OPTIONS.find((t) => t.id === config.topId) || TOP_OPTIONS[0];
  const suspension =
    SUSPENSION_OPTIONS.find((s) => s.id === config.suspensionId) || SUSPENSION_OPTIONS[0];
  const wheel = WHEEL_OPTIONS.find((w) => w.id === config.wheelId) || WHEEL_OPTIONS[0];

  const hasWinchBumper =
    config.selectedArmorIds.includes('winch-bumper-warn') ||
    config.selectedArmorIds.includes('winch-bumper-warn-bolero');
  const hasRockSliders =
    config.selectedArmorIds.includes('rock-sliders') ||
    config.selectedArmorIds.includes('rock-sliders-hd');
  const hasSnorkel =
    config.selectedArmorIds.includes('snorkel-safari') ||
    config.selectedArmorIds.includes('snorkel-safari-bolero');
  const hasRallyPods = config.selectedArmorIds.includes('rally-hella-pods');

  // Suspension lift physical elevation translation (pixels in 3D model space)
  const liftPx = Math.round((suspension.liftInches || 0) * 6); // +0px, +12px, +21px

  // Computed 3D Transform based on selected view mode
  const currentTransform =
    viewMode === 'isometric'
      ? `perspective(1200px) rotateX(${pitchAngle}deg) rotateY(${yawAngle}deg) scale3d(${zoomLevel * fit}, ${zoomLevel * fit}, ${zoomLevel * fit})`
      : `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(${zoomLevel * fit}, ${zoomLevel * fit}, ${zoomLevel * fit})`;

  // Preset camera angle switches
  const handleSetPreset = (pitch: number, yaw: number) => {
    setViewMode('isometric');
    setPitchAngle(pitch);
    setYawAngle(yaw);
  };

  return (
    <div
      className={`relative w-full aspect-[16/11] sm:aspect-[16/10] flex flex-col justify-between select-none overflow-hidden rounded-2xl border border-neutral-800 bg-[#090c12] shadow-2xl ${className}`}
    >
      {/* Top Controls Bar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 bg-gradient-to-b from-[#07090e]/95 via-[#07090e]/80 to-transparent backdrop-blur-md border-b border-neutral-800/70">
        {/* Left: Platform Indicator & Color Chip */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500/50" />
          <span className="text-xs font-mono-num font-bold tracking-wider text-white uppercase">
            {platform.name}
          </span>
          <span className="text-xs text-neutral-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-neutral-800 text-[11px] font-mono-num text-neutral-300">
            <span
              className="w-2 h-2 rounded-full border border-white/40"
              style={{ backgroundColor: paint.hex }}
            />
            <span className="truncate max-w-[110px]">{paint.name}</span>
          </div>
        </div>

        {/* Center: THE VIEW MODE TOGGLE (Isometric 3D vs Side Profile) */}
        <div className="flex items-center bg-black/80 p-1 rounded-xl border border-neutral-700/80 shadow-inner">
          <button
            onClick={() => {
              setViewMode('isometric');
              if (pitchAngle === 0 && yawAngle === 0) {
                setPitchAngle(22);
                setYawAngle(-34);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'isometric'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Isometric 3D View</span>
          </button>

          <button
            onClick={() => {
              setViewMode('side-profile');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'side-profile'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side Profile View</span>
          </button>
        </div>

        {/* Right: Layer Filter (Full Body vs Chassis X-Ray) */}
        <div className="flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 rounded-lg p-1 text-[11px] font-mono-num">
          <button
            onClick={() => setDisplayLayer('full-vehicle')}
            className={`px-2 py-1 rounded transition-colors ${
              displayLayer === 'full-vehicle'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Show completed vehicle exterior"
          >
            Body
          </button>
          <button
            onClick={() => setDisplayLayer('chassis-xray')}
            className={`px-2 py-1 rounded transition-colors ${
              displayLayer === 'chassis-xray'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Inspect ladder frame and suspension through semi-transparent body"
          >
            Chassis X-Ray
          </button>
          <button
            onClick={() => setDisplayLayer('chassis-only')}
            className={`px-2 py-1 rounded transition-colors ${
              displayLayer === 'chassis-only'
                ? 'bg-neutral-800 text-amber-400 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Show bare frame, axles, differentials, and springs"
          >
            Bare Frame
          </button>
        </div>
      </div>

      {/* Main 3D Stage Canvas */}
      <div ref={stageRef} className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden [perspective:1200px]">
        {/* Background Grid & Studio Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#182030]/40 via-[#0a0d14] to-[#05070a] pointer-events-none" />

        {/* 3D Model Root Container */}
        <div
          className="relative w-[500px] h-[300px] sm:w-[580px] sm:h-[340px] flex items-center justify-center transition-transform duration-700 ease-out"
          style={{
            transform: currentTransform,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ============================================================ */}
          {/* 1. STUDIO TURNTABLE FLOOR PLANE IN 3D SPACE */}
          {/* ============================================================ */}
          <div
            className="absolute w-[560px] h-[560px] rounded-full border border-neutral-700/40 pointer-events-none flex items-center justify-center"
            style={{
              transform: 'rotateX(90deg) translateZ(-110px)',
              background:
                'radial-gradient(circle, rgba(217,119,6,0.08) 0%, rgba(20,26,38,0.5) 45%, transparent 70%)',
            }}
          >
            {/* Concentric turntable rings */}
            <div className="w-[440px] h-[440px] rounded-full border border-dashed border-amber-500/20" />
            <div className="absolute w-[320px] h-[320px] rounded-full border border-neutral-800" />
            <div className="absolute w-[180px] h-[180px] rounded-full border border-neutral-800/60" />

            {/* Chassis Drop Shadow */}
            <div
              className="absolute w-[380px] h-[140px] rounded-[50px] bg-black/90 blur-xl transition-all duration-300"
              style={{
                opacity: 0.85,
              }}
            />

            {/* Turntable Crosshair Coordinates */}
            <div className="absolute inset-x-0 h-[1px] bg-neutral-800/80" />
            <div className="absolute inset-y-0 w-[1px] bg-neutral-800/80" />
            <span className="absolute bottom-6 text-[9px] font-mono-num text-neutral-600 tracking-widest uppercase">
              COORG AUTO WORKS · MATTURU 4X4 DEPOT
            </span>
          </div>

          {/* ============================================================ */}
          {/* 2. MM540 CHASSIS LADDER FRAME (The Engineering Backbone) */}
          {/* ============================================================ */}
          <div
            className="absolute transition-all duration-500 ease-out"
            style={{
              transform: `translateY(${-liftPx}px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Left Longitudinal Chassis Rail (Heavy C-Channel Steel) */}
            <div
              className={`absolute h-4 rounded-sm border transition-colors duration-300 ${
                displayLayer !== 'full-vehicle'
                  ? 'bg-amber-500/90 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-neutral-800 border-neutral-700'
              }`}
              style={{
                width: '370px',
                left: '-185px',
                top: '55px',
                transform: 'translateZ(-45px)',
              }}
            >
              {/* Rail Rivets & Lightening Holes */}
              <div className="w-full h-full flex items-center justify-around px-4 opacity-60">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
              </div>
            </div>

            {/* Right Longitudinal Chassis Rail */}
            <div
              className={`absolute h-4 rounded-sm border transition-colors duration-300 ${
                displayLayer !== 'full-vehicle'
                  ? 'bg-amber-500/90 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-neutral-800 border-neutral-700'
              }`}
              style={{
                width: '370px',
                left: '-185px',
                top: '55px',
                transform: 'translateZ(45px)',
              }}
            >
              <div className="w-full h-full flex items-center justify-around px-4 opacity-60">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-600" />
              </div>
            </div>

            {/* Front Tubular Cross Member & Winch Base */}
            <div
              className="absolute w-3 h-3 rounded-full bg-neutral-700 border border-amber-500/60"
              style={{
                width: '12px',
                height: '92px',
                left: '175px',
                top: '56px',
                transform: 'rotateX(90deg) translateZ(0px)',
              }}
            />

            {/* Center Transmission Support Cross Member */}
            <div
              className="absolute bg-neutral-800 border border-neutral-700"
              style={{
                width: '20px',
                height: '90px',
                left: '20px',
                top: '57px',
                transform: 'rotateX(90deg) translateZ(0px)',
              }}
            />

            {/* Rear Fuel Tank / Bumper Cross Member */}
            <div
              className="absolute bg-neutral-800 border border-neutral-700"
              style={{
                width: '14px',
                height: '90px',
                left: '-180px',
                top: '57px',
                transform: 'rotateX(90deg) translateZ(0px)',
              }}
            />

            {/* Fuel Tank (Polyurethane / Galvanized Steel) */}
            <div
              className="absolute bg-neutral-900 border border-neutral-700 rounded-sm"
              style={{
                width: '60px',
                height: '24px',
                left: '-160px',
                top: '64px',
                transform: 'translateZ(0px)',
              }}
            />

            {/* Gearbox & Transfer Case Unit in Center */}
            <div
              className={`absolute rounded-sm border transition-colors duration-300 ${
                displayLayer !== 'full-vehicle'
                  ? 'bg-amber-600/80 border-amber-400'
                  : 'bg-neutral-700 border-neutral-600'
              }`}
              style={{
                width: '70px',
                height: '28px',
                left: '-10px',
                top: '54px',
                transform: 'translateZ(0px)',
              }}
            >
              <span className="text-[7px] text-neutral-300 font-mono-num font-bold absolute inset-0 flex items-center justify-center">
                4WD T-CASE
              </span>
            </div>

            {/* Propeller Driveshaft to Rear Axle */}
            <div
              className="absolute h-2 bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-700 rounded-full"
              style={{
                width: '95px',
                left: '-110px',
                top: '70px',
                transform: 'rotateZ(8deg) translateZ(0px)',
              }}
            />

            {/* Propeller Driveshaft to Front Axle */}
            <div
              className="absolute h-2 bg-gradient-to-r from-neutral-700 via-neutral-400 to-neutral-600 rounded-full"
              style={{
                width: '90px',
                left: '45px',
                top: '70px',
                transform: 'rotateZ(-7deg) translateZ(0px)',
              }}
            />
          </div>

          {/* ============================================================ */}
          {/* 3. SOLID LIVE AXLES & LEAF SPRINGS (Dana 44 Front & Rear) */}
          {/* ============================================================ */}
          {/* Front Solid Live Axle with Differential Pumpkin */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '120px',
              top: '75px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front Axle Tube (Dana 44 Tube) */}
            <div
              className="absolute bg-neutral-700 border border-neutral-600 rounded-full"
              style={{
                width: '10px',
                height: '140px',
                transform: 'rotateX(90deg) translateZ(0px)',
              }}
            />
            {/* Front Differential Pumpkin */}
            <div
              className={`absolute w-7 h-7 rounded-full border shadow-md flex items-center justify-center ${
                displayLayer !== 'full-vehicle'
                  ? 'bg-amber-600 border-amber-300'
                  : 'bg-neutral-800 border-neutral-600'
              }`}
              style={{
                transform: 'translateZ(10px)',
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-500" />
            </div>

            {/* Front Left & Right Leaf Spring Stacks with Shackles */}
            <div
              className="absolute w-20 h-4 border-b-2 border-neutral-400 rounded-b-full"
              style={{
                transform: `translateZ(-45px) translateY(${-liftPx / 2}px)`,
              }}
            />
            <div
              className="absolute w-20 h-4 border-b-2 border-neutral-400 rounded-b-full"
              style={{
                transform: `translateZ(45px) translateY(${-liftPx / 2}px)`,
              }}
            />
          </div>

          {/* Rear Solid Live Axle with Heavy Pumpkin */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '-125px',
              top: '75px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Rear Axle Tube */}
            <div
              className="absolute bg-neutral-700 border border-neutral-600 rounded-full"
              style={{
                width: '10px',
                height: '140px',
                transform: 'rotateX(90deg) translateZ(0px)',
              }}
            />
            {/* Rear Differential Pumpkin */}
            <div
              className={`absolute w-8 h-8 rounded-full border shadow-md flex items-center justify-center ${
                displayLayer !== 'full-vehicle'
                  ? 'bg-amber-600 border-amber-300'
                  : 'bg-neutral-800 border-neutral-600'
              }`}
              style={{
                transform: 'translateZ(0px)',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-500" />
            </div>

            {/* Rear Left & Right Leaf Spring Stacks */}
            <div
              className="absolute w-24 h-5 border-b-2 border-neutral-400 rounded-b-full"
              style={{
                transform: `translateZ(-45px) translateY(${-liftPx / 2}px)`,
              }}
            />
            <div
              className="absolute w-24 h-5 border-b-2 border-neutral-400 rounded-b-full"
              style={{
                transform: `translateZ(45px) translateY(${-liftPx / 2}px)`,
              }}
            />
          </div>

          {/* ============================================================ */}
          {/* 4. FOUR RUGGED OFF-ROAD WHEELS (Offset in 3D Depth) */}
          {/* ============================================================ */}
          {/* Helper render for off-road wheel */}
          {([
            { id: 'FL', x: '120px', z: '72px' },
            { id: 'FR', x: '120px', z: '-72px' },
            { id: 'RL', x: '-125px', z: '72px' },
            { id: 'RR', x: '-125px', z: '-72px' },
          ] as const).map((w) => (
            <div
              key={w.id}
              className="absolute flex items-center justify-center transition-all duration-300"
              style={{
                left: w.x,
                top: '75px',
                transform: `translateZ(${w.z})`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Outer Rubber Tyre with Knobby Treads */}
              <div className="w-16 h-16 rounded-full bg-[#111317] border-4 border-[#222733] shadow-lg flex items-center justify-center relative">
                {/* Tread Notches */}
                <div className="absolute inset-0 rounded-full border border-dashed border-neutral-600 opacity-60" />

                {/* Rim Core */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-800 via-neutral-700 to-neutral-900 border-2 border-neutral-600 flex items-center justify-center shadow-inner">
                  {/* Wheel Lug Nuts */}
                  <div className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ============================================================ */}
          {/* 5. MAHINDRA MM540 BODY SHELL (With Paint, Canopy & Armor) */}
          {/* ============================================================ */}
          {displayLayer !== 'chassis-only' && (
            <div
              className={`absolute transition-all duration-500 ease-out ${
                displayLayer === 'chassis-xray' ? 'opacity-25' : 'opacity-100'
              }`}
              style={{
                transform: `translateY(${-liftPx}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Main MM540 Tub / Cargo Body */}
              <div
                className="absolute rounded-t-sm shadow-xl border border-white/20 transition-colors duration-500"
                style={{
                  width: '210px',
                  height: '56px',
                  left: '-170px',
                  top: '-4px',
                  backgroundColor: paint.hex,
                  transform: 'translateZ(0px)',
                  backgroundImage:
                    paint.finish === 'Matte Military'
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.3) 100%)'
                      : paint.finish === 'Gloss Metallic'
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(0,0,0,0.2) 50%, rgba(255,255,255,0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.25) 100%)',
                }}
              >
                {/* Rear Tailgate & CAW Badge */}
                <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-mono-num text-neutral-300">
                  CAW 4X4
                </div>

                {/* Door Opening & Cutout */}
                <div className="absolute right-6 top-3 bottom-0 w-24 border-r border-t border-black/30 rounded-tr-lg" />
              </div>

              {/* MM540 Signature Curved Bonnet (Engine Hood) */}
              <div
                className="absolute rounded-tr-2xl rounded-tl-sm border-t border-r border-white/25 shadow-md transition-colors duration-500"
                style={{
                  width: '120px',
                  height: '46px',
                  left: '40px',
                  top: '6px',
                  backgroundColor: paint.hex,
                  transform: 'translateZ(0px)',
                  backgroundImage:
                    'linear-gradient(to right, rgba(0,0,0,0.15), rgba(255,255,255,0.18) 50%, rgba(0,0,0,0.2))',
                }}
              >
                {/* Hood Cooling Louvers (Signature MM540 feature) */}
                <div className="absolute top-2 left-4 flex flex-col gap-1 opacity-70">
                  <div className="w-8 h-[1.5px] bg-black/50" />
                  <div className="w-8 h-[1.5px] bg-black/50" />
                  <div className="w-8 h-[1.5px] bg-black/50" />
                </div>
                {/* Hood Rubber Tie-Down Catch */}
                <div className="absolute right-3 bottom-1 w-2.5 h-3 bg-neutral-900 border border-neutral-600 rounded-sm" />
              </div>

              {/* Iconic 7-Slot Front Grille Fascia & Round Headlamps */}
              <div
                className="absolute flex items-center justify-between px-2 bg-neutral-900 border-2 border-neutral-700 rounded-sm shadow-md"
                style={{
                  width: '18px',
                  height: '42px',
                  left: '158px',
                  top: '8px',
                  transform: 'rotateY(90deg) translateZ(0px)',
                }}
              >
                {/* Round Headlamp Right */}
                <div className="w-5 h-5 rounded-full bg-amber-100 border-2 border-neutral-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>

                {/* 7 Vertical Jeep Grille Slots */}
                <div className="flex gap-0.5 items-center justify-center">
                  <div className="w-[1.5px] h-6 bg-black" />
                  <div className="w-[1.5px] h-6 bg-black" />
                  <div className="w-[1.5px] h-6 bg-black" />
                  <div className="w-[1.5px] h-6 bg-black" />
                  <div className="w-[1.5px] h-6 bg-black" />
                </div>

                {/* Round Headlamp Left */}
                <div className="w-5 h-5 rounded-full bg-amber-100 border-2 border-neutral-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>

              {/* Foldable MM540 Windshield Frame & Glass */}
              <div
                className="absolute border-2 border-neutral-800 rounded-t-sm bg-cyan-950/40 backdrop-blur-[1px] shadow-sm flex flex-col justify-between"
                style={{
                  width: '64px',
                  height: '48px',
                  left: '20px',
                  top: '-42px',
                  transform: 'rotateZ(12deg) translateZ(0px)',
                }}
              >
                {/* Windshield Twin Glass Divider */}
                <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-neutral-800" />
                {/* Wiper Arms */}
                <div className="w-4 h-0.5 bg-neutral-400 self-end m-1 rotate-12" />
              </div>

              {/* CANOPY / ROOF CONFIGURATION */}
              {top.type === 'canvas' && (
                <div
                  className="absolute rounded-t-md shadow-md border-t border-neutral-700/80"
                  style={{
                    width: '185px',
                    height: '52px',
                    left: '-165px',
                    top: '-54px',
                    backgroundColor: top.id.includes('sand') ? '#a89476' : '#2d382e',
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(0,0,0,0.3))',
                    transform: 'translateZ(0px)',
                  }}
                >
                  {/* Canvas Window Roll-up Straps */}
                  <div className="absolute inset-x-4 top-3 bottom-2 rounded border border-dashed border-white/20 bg-black/30 flex items-center justify-around">
                    <span className="w-1 h-3 bg-neutral-900 rounded-sm" />
                    <span className="w-1 h-3 bg-neutral-900 rounded-sm" />
                  </div>
                </div>
              )}

              {top.type === 'bimini' && (
                <div
                  className="absolute rounded-t shadow-md border-b-2 border-amber-600/60"
                  style={{
                    width: '180px',
                    height: '8px',
                    left: '-160px',
                    top: '-52px',
                    backgroundColor: '#1f251f',
                    transform: 'translateZ(0px)',
                  }}
                >
                  {/* Thin Canvas Shade Top Supported by Roll Cage */}
                  <div className="w-full h-full bg-neutral-900/80" />
                </div>
              )}

              {top.type === 'open-tub' && (
                /* Pure Open-Top with Full DOM Tubular Roll Cage */
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: '180px',
                    height: '52px',
                    left: '-160px',
                    top: '-52px',
                  }}
                >
                  {/* Main Roll B-Pillar Hoop */}
                  <div className="absolute left-24 top-0 w-2 h-full border-2 border-amber-500 rounded-t-lg bg-neutral-900 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  {/* Rear Diagonal Kickers */}
                  <div className="absolute left-6 top-1 w-20 h-1 bg-amber-500 rotate-[22deg] origin-top-left" />
                </div>
              )}

              {/* HEAVY RECOVERY ARMOR: Winch Bumper & Recovery Hooks */}
              {hasWinchBumper && (
                <div
                  className="absolute bg-neutral-900 border border-neutral-600 rounded-sm shadow-xl flex items-center justify-between px-2"
                  style={{
                    width: '32px',
                    height: '24px',
                    left: '172px',
                    top: '46px',
                    transform: 'translateZ(0px)',
                  }}
                >
                  {/* Winch Drum & Cable */}
                  <div className="w-3 h-3 rounded-full bg-amber-600 border border-amber-400" />
                  <div className="w-2 h-3.5 bg-neutral-800 border border-neutral-500 rounded-sm" />
                </div>
              )}

              {/* CHASSIS MOUNTED ROCK SLIDERS */}
              {hasRockSliders && (
                <div
                  className="absolute h-3 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 border border-amber-500/50 shadow-md"
                  style={{
                    width: '180px',
                    left: '-110px',
                    top: '52px',
                    transform: 'translateZ(58px)',
                  }}
                />
              )}

              {/* SAFARI SNORKEL */}
              {hasSnorkel && (
                <div
                  className="absolute w-2.5 bg-neutral-900 border border-neutral-700 rounded-t-md"
                  style={{
                    height: '54px',
                    left: '32px',
                    top: '-46px',
                    transform: 'translateZ(38px)',
                  }}
                >
                  {/* Snorkel Ram Intake Head */}
                  <div className="w-5 h-3 bg-neutral-950 border border-neutral-600 rounded-r-md -ml-1 mt-0" />
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. DIMENSION LABELS IN SIDE-PROFILE MODE */}
          {/* ============================================================ */}
          {viewMode === 'side-profile' && showDimensions && (
            <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-300">
              {/* Wheelbase Dimension Line */}
              <div
                className="absolute flex items-center justify-between"
                style={{
                  left: '-125px',
                  width: '245px',
                  top: '115px',
                }}
              >
                <div className="w-2 h-2 border-l-2 border-b-2 border-amber-500" />
                <div className="flex-1 border-b border-dashed border-amber-500/60 mx-1 flex items-center justify-center">
                  <span className="bg-[#090c12] px-2 py-0.5 text-[10px] font-mono-num font-bold text-amber-400">
                    WHEELBASE 2,430 MM (95.5&quot;)
                  </span>
                </div>
                <div className="w-2 h-2 border-r-2 border-b-2 border-amber-500" />
              </div>

              {/* Ground Clearance Indicator */}
              <div
                className="absolute flex flex-col items-center"
                style={{
                  left: '0px',
                  top: '80px',
                }}
              >
                <div className="w-[1px] h-6 bg-emerald-400" />
                <span className="bg-emerald-950 px-1.5 py-0.5 rounded text-[9px] font-mono-num font-bold text-emerald-300 border border-emerald-700">
                  {platform.stockSpecs.groundClearance} +{suspension.liftInches}&quot;
                </span>
              </div>

              {/* Approach Angle Notice */}
              <div
                className="absolute text-[10px] font-mono-num text-neutral-400"
                style={{
                  left: '165px',
                  top: '85px',
                }}
              >
                Approach: 44°
              </div>

              {/* Departure Angle Notice */}
              <div
                className="absolute text-[10px] font-mono-num text-neutral-400"
                style={{
                  left: '-195px',
                  top: '85px',
                }}
              >
                Departure: 38°
              </div>
            </div>
          )}
        </div>

        {/* Floating Quick Camera Angles (When in Isometric Mode) */}
        {viewMode === 'isometric' && (
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] font-mono-num text-neutral-400 px-2 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-amber-500" />
              <span>Turntable Angles:</span>
            </span>
            <button
              onClick={() => handleSetPreset(20, -35)}
              className={`px-2 py-1 text-[11px] font-mono-num rounded transition-colors ${
                yawAngle === -35
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
              }`}
            >
              Front 3/4
            </button>
            <button
              onClick={() => handleSetPreset(18, -75)}
              className={`px-2 py-1 text-[11px] font-mono-num rounded transition-colors ${
                yawAngle === -75
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
              }`}
            >
              Side Angle
            </button>
            <button
              onClick={() => handleSetPreset(22, 145)}
              className={`px-2 py-1 text-[11px] font-mono-num rounded transition-colors ${
                yawAngle === 145
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
              }`}
            >
              Rear 3/4
            </button>
            <button
              onClick={() => handleSetPreset(50, -35)}
              className={`px-2 py-1 text-[11px] font-mono-num rounded transition-colors ${
                pitchAngle === 50
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
              }`}
            >
              Top Aerial
            </button>

            {/* Turntable Slider */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-800 ml-1">
              <span className="text-[10px] font-mono-num text-neutral-500">Yaw:</span>
              <input
                type="range"
                min="-180"
                max="180"
                value={yawAngle}
                onChange={(e) => setYawAngle(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
              />
            </div>
          </div>
        )}

        {/* Side Profile Technical Badges */}
        {viewMode === 'side-profile' && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-mono-num">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-200">Orthographic Workshop Elevation</span>
            <span className="text-neutral-500">·</span>
            <span className="text-amber-400">1:1 Chassis Scale Ratio</span>
          </div>
        )}

        {/* Top-Right Blueprint Status Watermark */}
        <div className="absolute top-16 right-4 z-20 hidden sm:flex flex-col items-end gap-1 text-[10px] font-mono-num text-neutral-500 pointer-events-none">
          <div className="px-2 py-1 rounded bg-black/60 border border-neutral-800/80 backdrop-blur-sm text-neutral-300">
            CHASSIS: BOXED CHANNEL LADDER
          </div>
          <div className="px-2 py-0.5 rounded bg-black/40 text-amber-500/80">
            AXLES: DANA 44 FULL-FLOATING
          </div>
        </div>
      </div>

      {/* Bottom Technical Status Bar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-950/90 border-t border-neutral-800 text-[11px] font-mono-num text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {platform.name}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-amber-400 font-semibold">{wheel.name.split(' ')[0]} {wheel.name.split(' ')[1]}</span>
          <span className="text-neutral-600">·</span>
          <span>+{suspension.liftInches}&quot; Suspension Lift</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-500">
          <span>MATTURU WORKSHOP PERSPECTIVE RIG</span>
        </div>
      </div>
    </div>
  );
};
