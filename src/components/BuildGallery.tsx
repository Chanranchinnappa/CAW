/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { VEHICLE_PLATFORMS } from '../data/cawData';
import { MediaBuild, mediaUrl, useMediaManifest } from '../lib/media';

const platformName = (id: string) =>
  VEHICLE_PLATFORMS.find((p) => p.id === id)?.name.replace(/\s*\(.*?\)\s*/g, ' ').trim() || 'Custom build';

const Lightbox: React.FC<{ build: MediaBuild; start: number; onClose: () => void }> = ({ build, start, onClose }) => {
  const [i, setI] = useState(start);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = build.media.length;
  const go = useCallback((d: number) => setI((n) => (n + d + count) % count), [count]);

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  const item = build.media[i];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={build.title}
      className="on-dark fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <div className="font-semibold truncate">{build.title}</div>
          <div className="text-xs text-neutral-400">{i + 1} of {count}</div>
        </div>
        <button ref={closeRef} onClick={onClose} aria-label="Close gallery" className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center px-2 sm:px-14 relative" onClick={(e) => e.stopPropagation()}>
        {count > 1 && (
          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-2 sm:left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {item.type === 'video' ? (
          <video key={item.path} src={mediaUrl(item.path)} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg" />
        ) : (
          <img key={item.path} src={mediaUrl(item.path)} alt={item.caption || build.title} className="max-h-full max-w-full object-contain rounded-lg" />
        )}
        {count > 1 && (
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-2 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="p-4 text-sm text-neutral-300 max-w-3xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
        {item.caption || build.story}
      </div>
    </div>
  );
};

/** Real finished builds uploaded by the workshop. Renders nothing until at least one build has media. */
export const BuildGallery: React.FC = () => {
  const manifest = useMediaManifest();
  const [open, setOpen] = useState<{ build: MediaBuild; index: number } | null>(null);
  const builds = (manifest?.builds || []).filter((b) => b.media.length > 0);
  if (builds.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="font-display font-bold text-xl text-[color:var(--t-fg)] mb-1">Recent builds from the workshop</h3>
      <p className="text-sm text-[color:var(--t-muted)] mb-5">Photos and videos from vehicles we finished at the workshop.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {builds.map((b) => {
          const cover = b.media.find((m) => m.type === 'image') || b.media[0];
          const videos = b.media.filter((m) => m.type === 'video').length;
          return (
            <button
              key={b.id}
              onClick={() => setOpen({ build: b, index: Math.max(0, b.media.indexOf(cover)) })}
              className="group text-left rounded-xl overflow-hidden border border-[color:var(--t-border)] bg-[color:var(--t-panel)] hover:border-[color:var(--t-borderstrong)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--t-accent)]"
            >
              <div className="relative aspect-[4/3] bg-[color:var(--t-card)] overflow-hidden">
                {cover.type === 'image' ? (
                  <img src={mediaUrl(cover.path)} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none" />
                ) : (
                  <video src={mediaUrl(cover.path)} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                )}
                {cover.type === 'video' && <Play className="absolute inset-0 m-auto w-10 h-10 text-white drop-shadow" aria-hidden />}
                <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-black/70 text-white">
                  {[
                    b.media.length - videos > 0 ? `${b.media.length - videos} ${b.media.length - videos === 1 ? 'photo' : 'photos'}` : '',
                    videos > 0 ? `${videos} ${videos === 1 ? 'video' : 'videos'}` : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
              <div className="p-4">
                <div className="text-xs text-[color:var(--t-accent)] mb-1">
                  {platformName(b.platform)}
                  {b.year ? `, ${b.year}` : ''}
                </div>
                <div className="font-semibold text-[color:var(--t-fg)] leading-snug">{b.title}</div>
                {b.story && <p className="mt-1.5 text-[13px] text-[color:var(--t-muted)] line-clamp-2">{b.story}</p>}
              </div>
            </button>
          );
        })}
      </div>
      {open && <Lightbox build={open.build} start={open.index} onClose={() => setOpen(null)} />}
    </div>
  );
};
