/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Play, Plus, Trash2, TriangleAlert, Check } from 'lucide-react';
import { VEHICLE_PLATFORMS } from '../data/cawData';
import { MediaBuild, MediaManifest, mediaUrl, prepareFile } from '../lib/media';
import {
  ApiError,
  fetchStaffManifest,
  removeBuild,
  removeMedia,
  saveBuild,
  uploadMedia,
} from '../lib/staffApi';

interface Props {
  onSignedOut: () => void;
}

interface QueueItem {
  key: string;
  name: string;
  state: 'preparing' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

const field =
  'w-full px-3 py-2 text-sm bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] rounded-lg text-[color:var(--t-fg)] placeholder:text-[color:var(--t-dim)] focus:outline-none focus:border-amber-500';
const label = 'block text-xs font-medium text-[color:var(--t-muted)] mb-1';

/** Thumbnail that explains itself while GitHub Pages is still publishing a new file */
const Thumb: React.FC<{ item: MediaBuild['media'][number]; onRemove: () => void; busy: boolean }> = ({ item, onRemove, busy }) => {
  const [failed, setFailed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border border-[color:var(--t-border)] bg-[color:var(--t-card)] group">
      {item.type === 'image' && !failed ? (
        <img src={mediaUrl(item.path)} alt={item.caption || 'Build photo'} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover" />
      ) : item.type === 'video' && !failed ? (
        <>
          <video src={mediaUrl(item.path)} preload="metadata" muted onError={() => setFailed(true)} className="w-full h-full object-cover" />
          <Play className="absolute inset-0 m-auto w-8 h-8 text-white drop-shadow" aria-hidden />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center text-[11px] text-[color:var(--t-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Publishing. This takes 1 to 2 minutes.
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-1.5 flex justify-end bg-gradient-to-t from-black/70 to-transparent">
        {confirm ? (
          <span className="flex gap-1">
            <button disabled={busy} onClick={onRemove} className="px-2 py-1 text-[11px] font-semibold rounded bg-red-600 text-white">
              Remove
            </button>
            <button onClick={() => setConfirm(false)} className="px-2 py-1 text-[11px] rounded bg-black/60 text-white">
              Keep
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            aria-label="Remove this file"
            className="p-1.5 rounded bg-black/60 text-white hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const StaffMediaManager: React.FC<Props> = ({ onSignedOut }) => {
  const [manifest, setManifest] = useState<MediaManifest | null>(null);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState<string | 'new'>('new');
  const [draft, setDraft] = useState({ title: '', platform: 'mm540', year: '', story: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const justSaved = useRef(false);

  const handleError = (e: unknown, fallback: string) => {
    if (e instanceof ApiError && e.status === 401) {
      onSignedOut();
      return;
    }
    setMessage({ kind: 'error', text: e instanceof Error ? e.message : fallback });
  };

  useEffect(() => {
    fetchStaffManifest()
      .then((m) => {
        setManifest(m);
        if (m.builds[0]) setSelectedId(m.builds[0].id);
      })
      .catch((e) => (e instanceof ApiError && e.status === 401 ? onSignedOut() : setLoadError(e.message)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = manifest?.builds.find((b) => b.id === selectedId) || null;

  useEffect(() => {
    if (selected) {
      setDraft({
        title: selected.title,
        platform: selected.platform,
        year: selected.year ? String(selected.year) : '',
        story: selected.story,
      });
    } else {
      setDraft({ title: '', platform: 'mm540', year: '', story: '' });
    }
    if (justSaved.current) {
      justSaved.current = false; // keep the "saved" message after selecting the new build
      return;
    }
    setMessage(null);
    setQueue([]);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const yearNum = parseInt(draft.year, 10);
      const r = await saveBuild({
        id: selected?.id,
        title: draft.title,
        platform: draft.platform,
        year: Number.isInteger(yearNum) ? yearNum : null,
        story: draft.story,
      });
      setManifest(r.manifest);
      if (r.id !== selectedId) justSaved.current = true;
      setSelectedId(r.id);
      setMessage({ kind: 'ok', text: 'Build saved. Add photos and videos below.' });
    } catch (err) {
      handleError(err, 'Could not save the build.');
    } finally {
      setSaving(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length || !selected) return;
    setBusy(true);
    setMessage(null);
    const list = Array.from(files);
    const items: QueueItem[] = list.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, state: 'preparing', progress: 0 }));
    setQueue(items);
    const patch = (key: string, p: Partial<QueueItem>) => setQueue((q) => q.map((x) => (x.key === key ? { ...x, ...p } : x)));

    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const key = items[i].key;
      try {
        const blob = await prepareFile(f);
        patch(key, { state: 'uploading' });
        const r = await uploadMedia(selected.id, blob, '', (p) => patch(key, { progress: p }));
        setManifest(r.manifest);
        patch(key, { state: 'done', progress: 1 });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onSignedOut();
          return;
        }
        patch(key, { state: 'error', error: err instanceof Error ? err.message : 'Upload failed.' });
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemoveFile = async (path: string) => {
    if (!selected) return;
    setBusy(true);
    try {
      const r = await removeMedia(selected.id, path);
      setManifest(r.manifest);
    } catch (err) {
      handleError(err, 'Could not remove that file.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveBuild = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const r = await removeBuild(selected.id);
      setManifest(r.manifest);
      setSelectedId(r.manifest.builds[0]?.id || 'new');
    } catch (err) {
      handleError(err, 'Could not delete the build.');
    } finally {
      setBusy(false);
    }
  };

  if (loadError)
    return (
      <div className="p-6 text-sm text-[color:var(--t-muted)] flex items-start gap-2">
        <TriangleAlert className="w-4 h-4 text-[color:var(--t-accent)] mt-0.5 shrink-0" />
        <span>Could not load builds: {loadError}</span>
      </div>
    );
  if (!manifest)
    return (
      <div className="p-6 text-sm text-[color:var(--t-muted)] flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading builds
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)] gap-6">
      {/* Build list */}
      <div>
        <button
          onClick={() => setSelectedId('new')}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-3 text-sm font-semibold rounded-lg transition-colors ${
            selectedId === 'new' ? 'bg-amber-500 text-black' : 'border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] hover:bg-[color:var(--t-raised)]'
          }`}
        >
          <Plus className="w-4 h-4" /> New finished build
        </button>
        <ul className="space-y-1.5">
          {manifest.builds.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => setSelectedId(b.id)}
                aria-current={selectedId === b.id}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedId === b.id
                    ? 'border-amber-500 bg-[color:var(--t-cardsel)]'
                    : 'border-[color:var(--t-border)] hover:bg-[color:var(--t-card)]'
                }`}
              >
                <span className="block font-medium text-[color:var(--t-fg)] truncate">{b.title}</span>
                <span className="block text-xs text-[color:var(--t-dim)]">{b.media.length} files</span>
              </button>
            </li>
          ))}
          {manifest.builds.length === 0 && (
            <li className="text-xs text-[color:var(--t-dim)] px-1">No builds yet. Add the first one.</li>
          )}
        </ul>
      </div>

      {/* Editor */}
      <div className="min-w-0 space-y-6">
        <form onSubmit={handleSave} className="space-y-3">
          <h4 className="font-display font-bold text-lg text-[color:var(--t-fg)]">
            {selected ? 'Build details' : 'New finished build'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_12rem_6rem] gap-3">
            <div>
              <label className={label} htmlFor="mb-title">Title</label>
              <input id="mb-title" required minLength={3} maxLength={80} className={field} value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="1996 MM540 rebuild for a Kutta estate" />
            </div>
            <div>
              <label className={label} htmlFor="mb-platform">Vehicle</label>
              <select id="mb-platform" className={field} value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })}>
                {VEHICLE_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="mb-year">Year done</label>
              <input id="mb-year" inputMode="numeric" maxLength={4} className={field} value={draft.year}
                onChange={(e) => setDraft({ ...draft, year: e.target.value.replace(/\D/g, '') })} placeholder="2026" />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="mb-story">What was done (shown to visitors)</label>
            <textarea id="mb-story" rows={3} maxLength={600} className={field} value={draft.story}
              onChange={(e) => setDraft({ ...draft, story: e.target.value })}
              placeholder="Di Turbo engine swap, shackle reversal, new 31 inch mud tyres." />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50">
              {saving ? 'Saving' : selected ? 'Save changes' : 'Create build'}
            </button>
            {selected && <DeleteBuild disabled={busy} onConfirm={handleRemoveBuild} />}
            {message && (
              <span role="status" className={`text-sm flex items-center gap-1.5 ${message.kind === 'ok' ? 'text-[color:var(--t-good)]' : 'text-red-500'}`}>
                {message.kind === 'ok' ? <Check className="w-4 h-4" /> : <TriangleAlert className="w-4 h-4" />}
                {message.text}
              </span>
            )}
          </div>
        </form>

        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-display font-bold text-lg text-[color:var(--t-fg)]">Photos and videos</h4>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-amber-500 text-[color:var(--t-accent)] hover:bg-[color:var(--t-cardsel)] disabled:opacity-50"
              >
                <ImagePlus className="w-4 h-4" /> Add photos or videos
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*,video/mp4,video/webm" className="sr-only"
                onChange={(e) => handleFiles(e.target.files)} aria-label="Choose photos or videos" />
            </div>
            <p className="text-xs text-[color:var(--t-dim)]">
              Photos are shrunk automatically. Videos: MP4 or WebM, up to 10 MB (about 15 to 20 seconds from a phone). New files appear on the website 1 to 2 minutes after upload.
            </p>

            {queue.length > 0 && (
              <ul className="space-y-1.5" aria-live="polite">
                {queue.map((q) => (
                  <li key={q.key} className="text-sm rounded-lg border border-[color:var(--t-border)] px-3 py-2 bg-[color:var(--t-card)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[color:var(--t-fg2)]">{q.name}</span>
                      <span className={`text-xs shrink-0 ${q.state === 'error' ? 'text-red-500' : q.state === 'done' ? 'text-[color:var(--t-good)]' : 'text-[color:var(--t-muted)]'}`}>
                        {q.state === 'preparing' ? 'Preparing' : q.state === 'uploading' ? `Uploading ${Math.round(q.progress * 100)}%` : q.state === 'done' ? 'Uploaded' : 'Failed'}
                      </span>
                    </div>
                    {q.state === 'uploading' && (
                      <div className="mt-1.5 h-1 rounded bg-[color:var(--t-raised)] overflow-hidden">
                        <div className="h-full bg-amber-500 transition-[width]" style={{ width: `${q.progress * 100}%` }} />
                      </div>
                    )}
                    {q.error && <div className="mt-1 text-xs text-red-500">{q.error}</div>}
                  </li>
                ))}
              </ul>
            )}

            {selected.media.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[color:var(--t-borderstrong)] p-8 text-center text-sm text-[color:var(--t-muted)]">
                No files yet. Add the first photo of the finished vehicle.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {selected.media.map((m) => (
                  <Thumb key={m.path} item={m} busy={busy} onRemove={() => handleRemoveFile(m.path)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteBuild: React.FC<{ onConfirm: () => void; disabled: boolean }> = ({ onConfirm, disabled }) => {
  const [ask, setAsk] = useState(false);
  return ask ? (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-[color:var(--t-muted)]">Delete this build and its files?</span>
      <button type="button" disabled={disabled} onClick={onConfirm} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50">Delete</button>
      <button type="button" onClick={() => setAsk(false)} className="px-3 py-1.5 rounded-lg border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] text-sm">Keep</button>
    </span>
  ) : (
    <button type="button" onClick={() => setAsk(true)} className="px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-500/10">
      Delete build
    </button>
  );
};
