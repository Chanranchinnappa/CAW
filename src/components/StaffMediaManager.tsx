/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Archive, ArchiveRestore, Check, Eye, EyeOff, ImagePlus, Loader2, Play, Plus, Star, Trash2, TriangleAlert } from 'lucide-react';
import { VEHICLE_PLATFORMS } from '../data/cawData';
import { MediaBuild, MediaManifest, MediaStatus, mediaUrl, prepareFile } from '../lib/media';
import {
  ApiError,
  fetchStaffManifest,
  getToken,
  updateMedia,
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

const statusOf = (x: { status?: MediaStatus }): MediaStatus => x.status || 'shown';

const BUILD_STATUS_LABEL: Record<MediaStatus, string> = {
  shown: 'On the website',
  hidden: 'Hidden from the website',
  archived: 'Archived (kept, not shown)',
};

const IconButton: React.FC<{ label: string; onClick: () => void; disabled?: boolean; danger?: boolean; active?: boolean; children: React.ReactNode }> = ({
  label, onClick, disabled, danger, active, children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={`p-1.5 rounded text-white transition-colors disabled:opacity-40 ${
      danger ? 'bg-black/60 hover:bg-red-600' : active ? 'bg-amber-500 text-black' : 'bg-black/60 hover:bg-black/80'
    }`}
  >
    {children}
  </button>
);

/** One photo or video with its show, hide, archive, cover and delete controls. */
const Thumb: React.FC<{
  item: MediaBuild['media'][number];
  isCover: boolean;
  busy: boolean;
  onStatus: (s: MediaStatus) => void;
  onCover: () => void;
  onDelete: () => void;
}> = ({ item, isCover, busy, onStatus, onCover, onDelete }) => {
  const [failed, setFailed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const status = statusOf(item);
  const src = mediaUrl(item.path, getToken());
  return (
    <div className={`relative aspect-square rounded-lg overflow-hidden border bg-[color:var(--t-card)] ${status === 'shown' ? 'border-[color:var(--t-border)]' : 'border-dashed border-[color:var(--t-borderstrong)]'}`}>
      <div className={status === 'shown' ? '' : 'opacity-50'}>
        {item.type === 'image' && !failed ? (
          <img src={src} alt={item.caption || 'Build photo'} loading="lazy" onError={() => setFailed(true)} className="w-full h-full aspect-square object-cover" />
        ) : item.type === 'video' && !failed ? (
          <>
            <video src={src} preload="metadata" muted onError={() => setFailed(true)} className="w-full h-full aspect-square object-cover" />
            <Play className="absolute inset-0 m-auto w-8 h-8 text-white drop-shadow" aria-hidden />
          </>
        ) : (
          <div className="w-full h-full aspect-square flex flex-col items-center justify-center gap-1 p-2 text-center text-[11px] text-[color:var(--t-muted)]">
            <TriangleAlert className="w-4 h-4" />
            Preview not available
          </div>
        )}
      </div>
      {status !== 'shown' && (
        <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {status === 'hidden' ? 'Hidden' : 'Archived'}
        </span>
      )}
      {isCover && status === 'shown' && (
        <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">Cover</span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-1.5 flex flex-wrap justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent">
        {confirm ? (
          <span className="flex gap-1">
            <button disabled={busy} onClick={onDelete} className="px-2 py-1 text-[11px] font-semibold rounded bg-red-600 text-white">
              Delete for good
            </button>
            <button onClick={() => setConfirm(false)} className="px-2 py-1 text-[11px] rounded bg-black/60 text-white">
              Keep
            </button>
          </span>
        ) : (
          <>
            {status !== 'archived' && (
              <>
                <IconButton label={status === 'shown' ? 'Hide from the website' : 'Show on the website'} onClick={() => onStatus(status === 'shown' ? 'hidden' : 'shown')} disabled={busy}>
                  {status === 'shown' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </IconButton>
                {item.type === 'image' && status === 'shown' && (
                  <IconButton label="Use as the cover photo" onClick={onCover} disabled={busy || isCover} active={isCover}>
                    <Star className="w-3.5 h-3.5" />
                  </IconButton>
                )}
              </>
            )}
            <IconButton label={status === 'archived' ? 'Restore' : 'Archive'} onClick={() => onStatus(status === 'archived' ? 'hidden' : 'archived')} disabled={busy}>
              {status === 'archived' ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            </IconButton>
            <IconButton label="Delete for good" danger onClick={() => setConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
};

export const StaffMediaManager: React.FC<Props> = ({ onSignedOut }) => {
  const [manifest, setManifest] = useState<MediaManifest | null>(null);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState<string | 'new'>('new');
  const [draft, setDraft] = useState<{ title: string; platform: string; year: string; story: string; status: MediaStatus }>({ title: '', platform: 'mm540', year: '', story: '', status: 'shown' });
  const [view, setView] = useState<'active' | 'archived'>('active');
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
        status: statusOf(selected),
      });
    } else {
      setDraft({ title: '', platform: 'mm540', year: '', story: '', status: 'shown' });
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
        status: draft.status,
      });
      setManifest(r.manifest);
      if (r.id !== selectedId) justSaved.current = true;
      setSelectedId(r.id);
      setMessage({ kind: 'ok', text: draft.status === 'shown' ? 'Saved.' : `Saved. ${BUILD_STATUS_LABEL[draft.status]}.` });
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
        let blob = await prepareFile(f);
        if (!blob.type) {
          const ext = f.name.split('.').pop()?.toLowerCase() || '';
          const guess: Record<string, string> = { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
          blob = new Blob([blob], { type: guess[ext] || '' });
        }
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

  const handleFileStatus = async (path: string, status: MediaStatus) => {
    if (!selected) return;
    setBusy(true);
    try {
      const r = await updateMedia(selected.id, path, { status });
      setManifest(r.manifest);
    } catch (err) {
      handleError(err, 'Could not change that file.');
    } finally {
      setBusy(false);
    }
  };

  const handleCover = async (path: string) => {
    if (!selected) return;
    setBusy(true);
    try {
      const r = await updateMedia(selected.id, path, { cover: true });
      setManifest(r.manifest);
    } catch (err) {
      handleError(err, 'Could not set the cover.');
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
        <span>
          {/not set up/i.test(loadError)
            ? 'Photo and video storage is not connected yet. Staff login works; this page will work once the R2 bucket is created and the staff API is redeployed (see docs/MEDIA_R2.md).'
            : `Could not load builds: ${loadError}`}
        </span>
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
                <span className="block text-xs text-[color:var(--t-dim)]">
                  {b.media.length} files{statusOf(b) !== 'shown' ? ` · ${statusOf(b) === 'hidden' ? 'hidden' : 'archived'}` : ''}
                </span>
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
          <div>
            <label className={label} htmlFor="mb-status">Visibility on the website</label>
            <select id="mb-status" className={field} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as MediaStatus })}>
              {(Object.keys(BUILD_STATUS_LABEL) as MediaStatus[]).map((k) => (
                <option key={k} value={k}>{BUILD_STATUS_LABEL[k]}</option>
              ))}
            </select>
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
              Photos are shrunk automatically. Videos can be full quality: MP4, MOV or WebM, up to 1 GB each. Large videos upload in pieces, so keep this page open until the bar finishes. Files show on the website right away unless you hide them.
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

            {(() => {
              const active = selected.media.filter((m) => statusOf(m) !== 'archived');
              const archived = selected.media.filter((m) => statusOf(m) === 'archived');
              const list = view === 'active' ? active : archived;
              const coverPath = selected.media.find((m) => statusOf(m) === 'shown' && m.type === 'image')?.path;
              return (
                <>
                  <div className="flex gap-2" role="tablist" aria-label="Files">
                    {([['active', `Active (${active.length})`], ['archived', `Archived (${archived.length})`]] as const).map(([k, text]) => (
                      <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${view === k ? 'bg-amber-500 text-black' : 'bg-[color:var(--t-card)] text-[color:var(--t-muted)]'}`}>
                        {text}
                      </button>
                    ))}
                  </div>
                  {list.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[color:var(--t-borderstrong)] p-8 text-center text-sm text-[color:var(--t-muted)]">
                      {view === 'active' ? 'No files yet. Add the first photo of the finished vehicle.' : 'Nothing archived. Archived files are kept but never shown on the website.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {list.map((m) => (
                        <Thumb
                          key={m.path}
                          item={m}
                          busy={busy}
                          isCover={m.path === coverPath}
                          onStatus={(st) => handleFileStatus(m.path, st)}
                          onCover={() => handleCover(m.path)}
                          onDelete={() => handleRemoveFile(m.path)}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
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
