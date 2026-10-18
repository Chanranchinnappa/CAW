/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConfiguratorState } from '../types';
import {
  VEHICLE_PLATFORMS,
  PAINT_OPTIONS,
  TOP_OPTIONS,
  SUSPENSION_OPTIONS,
  WHEEL_OPTIONS,
  WORKSHOP_INFO,
} from '../data/cawData';
import { ChassisVisualizer3D } from './ChassisVisualizer3D';
import { Camera, Image as ImageIcon, Box, Send, Upload, Sparkles } from 'lucide-react';

interface VisualizerProps {
  config: ConfiguratorState;
  className?: string;
}

export type VisualizerMode = '3d-chassis' | 'photo-gallery';
export type PhotoAngle = 'hero' | 'front' | 'side' | 'interior';

export const VehicleBlueprintVisualizer: React.FC<VisualizerProps> = ({
  config,
  className = '',
}) => {
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('3d-chassis');
  const [activePhotoAngle, setActivePhotoAngle] = useState<PhotoAngle>('hero');
  const [imgError, setImgError] = useState(false);

  const platform =
    VEHICLE_PLATFORMS.find((p) => p.id === config.platformId) || VEHICLE_PLATFORMS[0];
  const paint = PAINT_OPTIONS.find((p) => p.id === config.paintId) || PAINT_OPTIONS[0];
  const top = TOP_OPTIONS.find((t) => t.id === config.topId) || TOP_OPTIONS[0];
  const suspension =
    SUSPENSION_OPTIONS.find((s) => s.id === config.suspensionId) || SUSPENSION_OPTIONS[0];
  const wheel = WHEEL_OPTIONS.find((w) => w.id === config.wheelId) || WHEEL_OPTIONS[0];

  // Pick the real photograph URL based on the angle
  const currentImageUrl =
    activePhotoAngle === 'hero'
      ? platform.realPhotos.hero
      : activePhotoAngle === 'front'
      ? platform.realPhotos.front
      : activePhotoAngle === 'side'
      ? platform.realPhotos.side
      : platform.realPhotos.interior;

  const angleLabels: Record<PhotoAngle, string> = {
    hero: 'Estate Hero View',
    front: 'Front Fascia',
    side: 'Side Profile',
    interior: 'Cabin & Trim',
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Studio Header Mode Switcher (3D Chassis Model vs Reference Photos) */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs font-mono-num text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-white font-semibold uppercase">{platform.name}</span>
          <span className="text-neutral-600">·</span>
          <span className="text-amber-400">{paint.name}</span>
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setVisualizerMode('3d-chassis')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              visualizerMode === '3d-chassis'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Perspective &amp; Chassis</span>
          </button>
          <button
            onClick={() => setVisualizerMode('photo-gallery')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              visualizerMode === 'photo-gallery'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Reference Photos</span>
          </button>
        </div>
      </div>

      {/* Primary Display */}
      {visualizerMode === '3d-chassis' ? (
        <ChassisVisualizer3D config={config} />
      ) : (
        /* Real Photo Viewer */
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] flex flex-col justify-between select-none overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e1219] shadow-2xl">
          {/* Top Bar for Photo Viewer */}
          <div className="relative z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-[#0b0e14]/90 via-[#0b0e14]/60 to-transparent backdrop-blur-sm border-b border-neutral-800/60">
            <span className="text-xs font-mono-num text-neutral-300">
              {platform.name} · {angleLabels[activePhotoAngle]}
            </span>

            {/* Photo Angle Selector */}
            <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded-lg p-1 backdrop-blur-md">
              {(['hero', 'front', 'side', 'interior'] as PhotoAngle[]).map((angle) => (
                <button
                  key={angle}
                  onClick={() => {
                    setActivePhotoAngle(angle);
                    setImgError(false);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all whitespace-nowrap ${
                    activePhotoAngle === angle
                      ? 'bg-amber-500 text-black font-semibold shadow-sm'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {angleLabels[angle]}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Display */}
          <div className="relative flex-1 w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center">
            {!imgError ? (
              <img
                src={currentImageUrl}
                alt={`${platform.name} ${angleLabels[activePhotoAngle]}`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#131924] to-[#0a0d13] text-center">
                <Camera className="w-12 h-12 text-amber-500/70 mb-3" />
                <h4 className="text-base font-bold text-white font-display">
                  {platform.name} · {angleLabels[activePhotoAngle]}
                </h4>
                <p className="mt-1 text-xs text-neutral-400 max-w-md">
                  Waiting for actual workshop photos from Coorg Auto Works. Upload your real build pictures to feature here.
                </p>
              </div>
            )}

            {/* Paint Tint Matrix Scrim */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color opacity-30 transition-colors duration-500"
              style={{ backgroundColor: paint.hex }}
            />

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

            {/* Submit Photos Banner */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <a
                href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=Hello%20Coorg%20Auto%20Works!%20I%20have%20actual%20high-res%20photos%20of%20our%20MM540%20/%20workshop%20builds%20to%20update%20the%20website%20configurator.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-[#121622]/95 border border-amber-500/40 hover:border-amber-500 backdrop-blur-md transition-all shadow-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Upload className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-xs truncate">
                    <span className="text-white font-semibold">Updating with Real MM540 Photos:</span>{' '}
                    <span className="text-neutral-400 hidden sm:inline">
                      Click here to share actual high-res photos of your builds directly via WhatsApp.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-400 group-hover:text-amber-300 whitespace-nowrap shrink-0 flex items-center gap-1">
                  <span>Submit Photos</span>
                  <Send className="w-3 h-3" />
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
