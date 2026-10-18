/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useRef, useState } from 'react';
import { Hand } from 'lucide-react';
import { ConfiguratorState } from '../types';
import { PAINT_OPTIONS } from '../data/cawData';
import type { StageHandle, ViewPreset } from './VehicleStage';

// three.js is large, so it loads only when the configurator is on screen.
const VehicleStage = lazy(() => import('./VehicleStage').then((m) => ({ default: m.VehicleStage })));

interface Props {
  config: ConfiguratorState;
  className?: string;
}

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: 'angle', label: 'Angle' },
  { id: 'side', label: 'Side' },
  { id: 'front', label: 'Front' },
  { id: 'rear', label: 'Rear' },
  { id: 'top', label: 'Top' },
];

export const ChassisVisualizer3D: React.FC<Props> = ({ config, className = '' }) => {
  const stage = useRef<StageHandle>(null);
  const [view, setView] = useState<ViewPreset | null>('angle');
  const [touched, setTouched] = useState(false);
  const [failed, setFailed] = useState(false);
  const paint = PAINT_OPTIONS.find((p) => p.id === config.paintId) || PAINT_OPTIONS[0];

  return (
    <div className={`on-dark relative overflow-hidden rounded-2xl border border-[color:var(--t-border)] ${className}`}>
      <div
        className="relative aspect-[4/3] w-full sm:aspect-[16/10]"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 62%, ${paint.hex}59 0%, transparent 70%), linear-gradient(180deg, #151a23 0%, #0b0e14 100%)`,
          transition: 'background 0.8s ease',
        }}
      >
        {failed ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-neutral-300">
            This browser can't show the 3D model. Switch to Photos to see the reference pictures.
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">Loading the 3D model...</div>
            }
          >
            <VehicleStage
              ref={stage}
              config={config}
              onFail={() => setFailed(true)}
              onInteract={() => {
                setTouched(true);
                setView(null);
              }}
            />
          </Suspense>
        )}

        {!failed && (
          <>
            <div
              className={`pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-neutral-200 backdrop-blur transition-opacity duration-700 ${
                touched ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <Hand className="h-3.5 w-3.5 text-amber-400" />
              Drag to rotate
            </div>

            <div role="radiogroup" aria-label="Camera view" className="absolute inset-x-3 bottom-3 flex justify-center">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    role="radio"
                    aria-checked={view === v.id}
                    onClick={() => {
                      setView(v.id);
                      stage.current?.setView(v.id);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      view === v.id ? 'bg-amber-500 text-black' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
