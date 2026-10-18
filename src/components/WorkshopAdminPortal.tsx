/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { PipelineBuild } from '../types';
import { StaffMediaManager } from './StaffMediaManager';
import { ErrorBoundary } from './ErrorBoundary';

// Staff-only for now: the 4x4 configurator is still being built and is not shown to customers.
const ConfiguratorStudio = lazy(() => import('./ConfiguratorStudio').then((m) => ({ default: m.ConfiguratorStudio })));
import { ApiError, getToken, login, signOut, staffApiConfigured } from '../lib/staffApi';
import { WORKSHOP_INFO } from '../data/cawData';
import {
  Lock,
  Unlock,
  Wrench,
  Mic,
  MicOff,
  Camera,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  LogOut,
  X,
  Send,
  Clock,
  Sparkles,
  Sliders,
  Images,
  ChevronDown,
} from 'lucide-react';

type StaffTab = 'pipeline' | 'media' | 'configurator';

/** Turn a section on when it is ready for staff. Sections that are off show "Coming soon". */
const STAFF_SECTIONS: { id: StaffTab; label: string; short: string; ready: boolean }[] = [
  { id: 'pipeline', label: 'Live pipeline and bays', short: 'Pipeline', ready: true },
  { id: 'media', label: 'Finished builds: photos and videos', short: 'Finished builds', ready: true },
  { id: 'configurator', label: '4x4 configurator', short: 'Configurator', ready: false },
];

interface AdminPortalProps {
  /** Leaves the staff page and returns to the public site. */
  onClose: () => void;
  pipeline: PipelineBuild[];
  onUpdatePipeline: (newPipeline: PipelineBuild[]) => void;
}

export const WorkshopAdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  pipeline,
  onUpdatePipeline,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getToken());
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  // Admin Active Tab: 'pipeline' | 'media' | 'configurator'
  const [activeTab, setActiveTab] = useState<StaffTab>('pipeline');

  // Currently selected Bay to edit
  const [selectedBayId, setSelectedBayId] = useState<string>(pipeline[0]?.id || '');
  const selectedBay = pipeline.find((b) => b.id === selectedBayId) || pipeline[0];

  // Editable Form fields for selected bay
  const [editTitle, setEditTitle] = useState('');
  const [editEstate, setEditEstate] = useState('');
  const [editPhase, setEditPhase] = useState('');
  const [editProgress, setEditProgress] = useState(50);
  const [editTarget, setEditTarget] = useState('');
  const [editChecklist, setEditChecklist] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Photo Upload State for Bay
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when selected bay changes
  useEffect(() => {
    if (selectedBay) {
      setEditTitle(selectedBay.vehicleTitle);
      setEditEstate(selectedBay.ownerEstate);
      setEditPhase(selectedBay.currentPhase);
      setEditProgress(selectedBay.progressPercent);
      setEditTarget(selectedBay.targetDelivery);
      setEditChecklist(selectedBay.keyWorkItems || []);
      setAttachedPhotos(selectedBay.photos || []);
      setVoiceText('');
    }
  }, [selectedBayId, pipeline]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError('');
    try {
      await login(passwordInput);
      setIsAuthenticated(true);
      setPasswordInput('');
      try {
        localStorage.removeItem('caw_staff_authenticated'); // old browser-only flag
      } catch {
        // ignore
      }
    } catch (err) {
      setLoginError(err instanceof ApiError || err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = () => {
    signOut();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Toggle Voice Input
  const toggleRecording = () => {
    if (!voiceSupported) {
      alert('Speech recognition is not supported in this browser. You can type directly in the log notes.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  // Save changes to current Bay
  const handleSaveBay = () => {
    const updatedPipeline = pipeline.map((bay) => {
      if (bay.id === selectedBayId) {
        const newVoiceNotes = voiceText.trim()
          ? [...(bay.voiceNotes || []), `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${voiceText.trim()}`]
          : bay.voiceNotes || [];

        return {
          ...bay,
          vehicleTitle: editTitle,
          ownerEstate: editEstate,
          currentPhase: editPhase,
          progressPercent: editProgress,
          targetDelivery: editTarget,
          keyWorkItems: editChecklist,
          photos: attachedPhotos,
          voiceNotes: newVoiceNotes,
          lastUpdated: 'Just now by staff',
        };
      }
      return bay;
    });

    onUpdatePipeline(updatedPipeline);
    setVoiceText('');
    alert(`Bay 0${selectedBay.bayNumber} (${editTitle}) updated successfully on live site!`);
  };

  // Add new checklist item
  const handleAddChecklist = () => {
    if (newChecklistText.trim()) {
      setEditChecklist([...editChecklist, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  // Remove checklist item
  const handleRemoveChecklist = (index: number) => {
    setEditChecklist(editChecklist.filter((_, i) => i !== index));
  };

  // Photo Upload Handler (Local file to Data URL preview)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedPhotos([...attachedPhotos, event.target.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--t-page)] sm:p-6 flex justify-center items-start caw-fade-in">
      <div className={`relative w-full ${activeTab === 'configurator' ? 'max-w-7xl' : 'max-w-6xl'} bg-[color:var(--t-panel)] flex flex-col min-h-screen sm:min-h-[calc(100vh-3rem)] sm:rounded-2xl sm:border sm:border-[color:var(--t-borderstrong)] sm:shadow-xl overflow-hidden`}>
        {/* Top Operations Header */}
        <div className="p-4 sm:p-6 border-b border-[color:var(--t-border)] bg-[color:var(--t-panel)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[color:var(--t-accent)]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-num font-bold text-[color:var(--t-accent)] tracking-wider uppercase">
                  WORKSHOP OPERATIONS &amp; MAINTAINER PORTAL
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[color:var(--t-fg)] font-display">
                Coorg Auto Works Internal Control
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[color:var(--t-raised)] hover:bg-[color:var(--t-raisedhover)] text-[color:var(--t-fg2)] rounded-lg text-xs font-medium border border-[color:var(--t-borderstrong)] transition-colors"
                title="Log Out Staff Session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[color:var(--t-fg2)] rounded-lg bg-[color:var(--t-cardsel)] hover:bg-[color:var(--t-raised)] border border-[color:var(--t-borderstrong)] transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Back to site</span>
            </button>
          </div>
        </div>

        {/* ----------------- LOGIN GATE SCREEN ----------------- */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-[color:var(--t-accent2)] flex items-center justify-center mb-4 border border-amber-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-[color:var(--t-fg)] font-display">
              Workshop Staff Authorization
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-[color:var(--t-muted)] leading-relaxed">
              Enter the staff password to update bays, add photos and videos of finished builds.
            </p>

            {!staffApiConfigured() && (
              <div className="mt-4 p-2.5 bg-[color:var(--t-warnbg)] border border-[color:var(--t-warnborder)] rounded-lg text-xs text-[color:var(--t-warnfg)] w-full">
                Staff sign-in is not set up on this site yet. See docs/STAFF_MEDIA_SETUP.md.
              </div>
            )}
            {loginError && (
              <div role="alert" className="mt-4 p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 w-full">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 w-full space-y-3 text-left">
              <div>
                <label htmlFor="staff-pass" className="block text-xs font-medium text-[color:var(--t-muted)] mb-1">Staff password</label>
                <input
                  id="staff-pass"
                  type="password"
                  required
                  autoComplete="current-password"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] rounded-xl text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loginBusy || !staffApiConfigured()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition-colors shadow-md"
              >
                {loginBusy ? 'Signing in' : 'Sign in'}
              </button>
            </form>
          </div>
        ) : (
          /* ----------------- AUTHENTICATED STAFF OPERATIONS CONSOLE ----------------- */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Section picker: a drop-down on phones, buttons on larger screens */}
            <div className="border-b border-[color:var(--t-border)] bg-[color:var(--t-bg)] px-4 sm:px-6 pt-4 pb-3">
              <label htmlFor="staff-section" className="sr-only">Section</label>
              <div className="relative md:hidden">
                <select
                  id="staff-section"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as StaffTab)}
                  className="w-full appearance-none rounded-xl border border-[color:var(--t-borderstrong)] bg-[color:var(--t-card)] px-4 py-3 pr-10 text-sm font-semibold text-[color:var(--t-fg)] focus:border-amber-500 focus:outline-none"
                >
                  {STAFF_SECTIONS.map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.ready}>
                      {t.label}{t.ready ? '' : ' (coming soon)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--t-muted)]" />
              </div>
              <div className="hidden md:flex items-center gap-2" role="tablist" aria-label="Staff sections">
                {STAFF_SECTIONS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={activeTab === t.id}
                    disabled={!t.ready}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      activeTab === t.id
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'text-[color:var(--t-muted)] hover:text-[color:var(--t-fg)] bg-[color:var(--t-card)]'
                    }`}
                  >
                    <span>{t.label}</span>
                    {!t.ready && <span className="rounded bg-[color:var(--t-raised)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--t-dim)]">Soon</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: PIPELINE & BAYS MANAGER */}
            {activeTab === 'pipeline' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Column: Bay Selector */}
                <div className="w-full md:w-64 bg-[color:var(--t-bg)] border-r border-[color:var(--t-border)] p-3 space-y-2 overflow-y-auto">
                  <div className="text-[10px] font-mono-num uppercase text-[color:var(--t-dim)] px-2 py-1">
                    Select Active Bay
                  </div>
                  {pipeline.map((bay) => (
                    <button
                      key={bay.id}
                      onClick={() => setSelectedBayId(bay.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedBayId === bay.id
                          ? 'bg-[color:var(--t-raised)] text-[color:var(--t-fg)] font-semibold border border-[color:var(--t-borderstrong)] shadow-sm'
                          : 'text-[color:var(--t-muted)] hover:text-[color:var(--t-fg)] hover:bg-[color:var(--t-card)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-[color:var(--t-accent2)] border border-amber-500/40">
                          BAY 0{bay.bayNumber}
                        </span>
                        <span className="text-[10px] font-mono-num text-[color:var(--t-muted)]">
                          {bay.progressPercent}%
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[color:var(--t-fg)] truncate">
                        {bay.vehicleTitle}
                      </div>
                      <div className="text-[11px] text-[color:var(--t-muted)] truncate mt-0.5">
                        {bay.ownerEstate}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right Column: Editable Bay Details */}
                <div className="flex-1 p-6 overflow-y-auto bg-[color:var(--t-panel)] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[color:var(--t-border)]">
                    <div>
                      <span className="text-xs font-mono-num text-[color:var(--t-accent)] uppercase">
                        Editing Bay 0{selectedBay.bayNumber}
                      </span>
                      <h4 className="text-lg font-bold text-[color:var(--t-fg)] font-display">
                        {editTitle || 'Untitled Build'}
                      </h4>
                    </div>

                    <button
                      onClick={handleSaveBay}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save &amp; Update Live Site</span>
                    </button>
                  </div>

                  {/* Primary Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[color:var(--t-muted)] font-medium mb-1">
                        Vehicle Make &amp; Model Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. 1994 Mahindra MM540 4x4"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[color:var(--t-muted)] font-medium mb-1">
                        Owner / Client Estate Location
                      </label>
                      <input
                        type="text"
                        value={editEstate}
                        onChange={(e) => setEditEstate(e.target.value)}
                        placeholder="e.g. Cauvery River Valley Estate, Balale"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[color:var(--t-muted)] font-medium mb-1">
                        Current Fabrication / Mechanical Phase
                      </label>
                      <input
                        type="text"
                        value={editPhase}
                        onChange={(e) => setEditPhase(e.target.value)}
                        placeholder="e.g. Chassis Rust Inversion & Shackle Reversal"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[color:var(--t-muted)] font-medium mb-1">
                        Target Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={editTarget}
                        onChange={(e) => setEditTarget(e.target.value)}
                        placeholder="e.g. End of Month / Next Week"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Progress Percent Slider */}
                  <div className="p-4 rounded-xl bg-[color:var(--t-card)] border border-[color:var(--t-border)]">
                    <div className="flex items-center justify-between text-xs font-mono-num mb-2">
                      <span className="text-[color:var(--t-fg2)] font-medium">Build Progress</span>
                      <span className="text-[color:var(--t-accent2)] font-bold text-sm">{editProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editProgress}
                      onChange={(e) => setEditProgress(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* VOICE INPUT FEATURE: Dictate Build Updates with greasy hands */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 to-[#161c28] border border-[color:var(--t-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-[color:var(--t-accent)]'}`} />
                        <span className="text-xs font-bold text-[color:var(--t-fg)]">
                          Voice Input / Mechanic Audio Log
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                            : 'bg-amber-500 hover:bg-amber-400 text-black'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isRecording ? 'Stop Recording' : 'Start Voice Dictation'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[color:var(--t-muted)] mb-2">
                      Mechanics can speak directly to describe machining, torque settings, or parts installed. It transcribes automatically into project log notes.
                    </p>

                    <textarea
                      rows={2}
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      placeholder={
                        isRecording
                          ? 'Listening to speech... Speak clearly about this build.'
                          : 'Dictate or type daily build update log note...'
                      }
                      className="w-full px-3 py-2 text-xs bg-[color:var(--t-page2)] border border-[color:var(--t-borderstrong)] rounded-lg text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 resize-none"
                    />

                    {selectedBay.voiceNotes && selectedBay.voiceNotes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[color:var(--t-border)] space-y-1.5">
                        <span className="text-[10px] font-mono-num uppercase text-[color:var(--t-dim)] block">
                          Recent Voice Log History
                        </span>
                        {selectedBay.voiceNotes.map((note, idx) => (
                          <div key={idx} className="text-xs text-[color:var(--t-fg2)] bg-[color:var(--t-card)] p-2 rounded border border-[color:var(--t-border)]">
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE WORK ITEMS CHECKLIST */}
                  <div className="p-4 rounded-xl bg-[color:var(--t-card)] border border-[color:var(--t-border)]">
                    <span className="text-xs font-bold text-[color:var(--t-fg)] block mb-2">
                      Active Checklist Tasks (Visible on Public Pipeline)
                    </span>

                    <div className="space-y-2 mb-3">
                      {editChecklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded bg-[color:var(--t-card)] border border-[color:var(--t-border)] text-xs text-[color:var(--t-fg2)]"
                        >
                          <span className="truncate">{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklist(idx)}
                            className="text-[color:var(--t-dim)] hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        placeholder="Add new task (e.g. Torque U-bolts, bleed brake lines)..."
                        className="flex-1 px-3 py-2 rounded-lg bg-[color:var(--t-page2)] border border-[color:var(--t-borderstrong)] text-xs text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddChecklist();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddChecklist}
                        className="px-3 py-2 bg-[color:var(--t-raised)] hover:bg-[color:var(--t-raisedhover)] text-[color:var(--t-fg)] rounded-lg text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* PHOTO ATTACHMENTS (Camera / Real Workshop Photos) */}
                  <div className="p-4 rounded-xl bg-[color:var(--t-card)] border border-[color:var(--t-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[color:var(--t-fg)]">
                        Build Photographs (Attached to Bay)
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-[color:var(--t-accent2)] hover:text-amber-300 font-semibold"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Photo from Camera/Device</span>
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    {attachedPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        {attachedPhotos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[color:var(--t-borderstrong)] group">
                            <img src={photo} alt="Build attachment" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAttachedPhotos(attachedPhotos.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-black/80 text-red-400 rounded hover:text-red-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-[color:var(--t-dim)] text-center py-4 border border-dashed border-[color:var(--t-border)] rounded-lg">
                        No photos attached yet. Tap &apos;Upload Photo&apos; to attach live shop photos of this build.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTOS AND VIDEOS */}
            {activeTab === 'media' && <StaffMediaManager onSignedOut={handleLogout} />}

            {activeTab === 'configurator' && (
              <div className="flex-1 bg-[color:var(--t-page)]">
                <Suspense fallback={<div className="p-10 text-sm text-[color:var(--t-muted)]">Loading the configurator...</div>}>
                  <ErrorBoundary label="The configurator">
                    <ConfiguratorStudio />
                  </ErrorBoundary>
                </Suspense>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
