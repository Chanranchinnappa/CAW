/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PipelineBuild } from '../types';
import { WORKSHOP_MASTER_QUESTIONNAIRE, WORKSHOP_INFO } from '../data/cawData';
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
  Copy,
  Check,
  Send,
  FileText,
  Clock,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: PipelineBuild[];
  onUpdatePipeline: (newPipeline: PipelineBuild[]) => void;
}

export const WorkshopAdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  pipeline,
  onUpdatePipeline,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('caw_staff_authenticated') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Admin Active Tab: 'pipeline' | 'questionnaire'
  const [activeTab, setActiveTab] = useState<'pipeline' | 'questionnaire'>('pipeline');

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

  // Questionnaire Copy State
  const [copiedQuestionnaire, setCopiedQuestionnaire] = useState(false);

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

  if (!isOpen) return null;

  // PIN Login Handler (Default workshop staff PIN: 5404)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '5404' || pinInput.toLowerCase() === 'caw540') {
      setIsAuthenticated(true);
      localStorage.setItem('caw_staff_authenticated', 'true');
      setPinError('');
    } else {
      setPinError('Incorrect workshop PIN. (Default PIN: 5404)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('caw_staff_authenticated');
    setPinInput('');
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
          lastUpdated: 'Just now by Matturu staff',
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

  // Generate Google Form text for internal staff questionnaire
  const generateGoogleFormText = () => {
    let output = `COORG AUTO WORKS (CAW) — MASTER WORKSHOP DATA QUESTIONNAIRE\n`;
    output += `Matturu Depot, Balale Road, Ponnampet, South Kodagu, Karnataka\n`;
    output += `For Internal Workshop Staff & Technicians\n\n`;

    WORKSHOP_MASTER_QUESTIONNAIRE.forEach((section, idx) => {
      output += `============================================================\n`;
      output += `SECTION ${idx + 1}: ${section.topicTitle.toUpperCase()} (${section.category})\n`;
      output += `------------------------------------------------------------\n`;
      output += `WHAT THIS SERVICE ENTAILS:\n${section.whatItIs}\n\n`;
      output += `WHAT WAS ESTIMATED IN PROTOTYPE:\n${section.whatWasGuessed}\n\n`;
      output += `QUESTIONS FOR TECHNICIANS TO ANSWER:\n`;
      section.questionsForOwner.forEach((q, qIdx) => {
        output += `  ${qIdx + 1}. ${q}\n`;
      });
      output += `\n`;
    });

    return output;
  };

  const handleCopyQuestionnaire = () => {
    navigator.clipboard.writeText(generateGoogleFormText());
    setCopiedQuestionnaire(true);
    setTimeout(() => setCopiedQuestionnaire(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#11151f] rounded-2xl border border-neutral-700 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Operations Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-[#141a26] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-num font-bold text-amber-500 tracking-wider uppercase">
                  WORKSHOP OPERATIONS &amp; MAINTAINER PORTAL
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Matturu Depot Staff
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Coorg Auto Works Internal Control
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium border border-neutral-700 transition-colors"
                title="Log Out Staff Session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800/80 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ----------------- LOGIN GATE SCREEN ----------------- */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white font-display">
              Workshop Staff Authorization
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Enter your workshop PIN to update active bay timelines, record voice build notes, attach photos, and access the staff questionnaire.
            </p>

            {pinError && (
              <div className="mt-4 p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 w-full">
                {pinError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 w-full space-y-4">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 5404)"
                  className="w-full text-center tracking-widest text-lg font-mono-num px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-md"
              >
                Unlock Operations Console
              </button>
            </form>

            <div className="mt-6 text-[11px] font-mono-num text-neutral-500">
              Coorg Auto Works · Matturu, Balale Road, Ponnampet
            </div>
          </div>
        ) : (
          /* ----------------- AUTHENTICATED STAFF OPERATIONS CONSOLE ----------------- */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-neutral-800 bg-[#0e121a]">
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'pipeline'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white bg-neutral-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Live Pipeline &amp; Bays Manager</span>
              </button>

              <button
                onClick={() => setActiveTab('questionnaire')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'questionnaire'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white bg-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Internal Staff Questionnaire</span>
              </button>
            </div>

            {/* TAB 1: PIPELINE & BAYS MANAGER */}
            {activeTab === 'pipeline' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Column: Bay Selector */}
                <div className="w-full md:w-64 bg-[#0e121a] border-r border-neutral-800 p-3 space-y-2 overflow-y-auto">
                  <div className="text-[10px] font-mono-num uppercase text-neutral-500 px-2 py-1">
                    Select Active Bay
                  </div>
                  {pipeline.map((bay) => (
                    <button
                      key={bay.id}
                      onClick={() => setSelectedBayId(bay.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedBayId === bay.id
                          ? 'bg-neutral-800 text-white font-semibold border border-neutral-700 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          BAY 0{bay.bayNumber}
                        </span>
                        <span className="text-[10px] font-mono-num text-neutral-400">
                          {bay.progressPercent}%
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {bay.vehicleTitle}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {bay.ownerEstate}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right Column: Editable Bay Details */}
                <div className="flex-1 p-6 overflow-y-auto bg-[#121622] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <span className="text-xs font-mono-num text-amber-500 uppercase">
                        Editing Bay 0{selectedBay.bayNumber}
                      </span>
                      <h4 className="text-lg font-bold text-white font-display">
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
                      <label className="block text-neutral-400 font-medium mb-1">
                        Vehicle Make &amp; Model Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. 1994 Mahindra MM540 4x4"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-medium mb-1">
                        Owner / Client Estate Location
                      </label>
                      <input
                        type="text"
                        value={editEstate}
                        onChange={(e) => setEditEstate(e.target.value)}
                        placeholder="e.g. Cauvery River Valley Estate, Balale"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-400 font-medium mb-1">
                        Current Fabrication / Mechanical Phase
                      </label>
                      <input
                        type="text"
                        value={editPhase}
                        onChange={(e) => setEditPhase(e.target.value)}
                        placeholder="e.g. Chassis Rust Inversion & Shackle Reversal"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-medium mb-1">
                        Target Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={editTarget}
                        onChange={(e) => setEditTarget(e.target.value)}
                        placeholder="e.g. End of Month / Next Week"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Progress Percent Slider */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <div className="flex items-center justify-between text-xs font-mono-num mb-2">
                      <span className="text-neutral-300 font-medium">Build Progress</span>
                      <span className="text-amber-400 font-bold text-sm">{editProgress}%</span>
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
                  <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 to-[#161c28] border border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
                        <span className="text-xs font-bold text-white">
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

                    <p className="text-[11px] text-neutral-400 mb-2">
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
                      className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                    />

                    {selectedBay.voiceNotes && selectedBay.voiceNotes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1.5">
                        <span className="text-[10px] font-mono-num uppercase text-neutral-500 block">
                          Recent Voice Log History
                        </span>
                        {selectedBay.voiceNotes.map((note, idx) => (
                          <div key={idx} className="text-xs text-neutral-300 bg-neutral-900/80 p-2 rounded border border-neutral-800">
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE WORK ITEMS CHECKLIST */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-xs font-bold text-white block mb-2">
                      Active Checklist Tasks (Visible on Public Pipeline)
                    </span>

                    <div className="space-y-2 mb-3">
                      {editChecklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
                        >
                          <span className="truncate">{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklist(idx)}
                            className="text-neutral-500 hover:text-red-400 p-1"
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
                        className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
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
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* PHOTO ATTACHMENTS (Camera / Real Workshop Photos) */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">
                        Build Photographs (Attached to Bay)
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
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
                          <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-neutral-700 group">
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
                      <div className="text-[11px] text-neutral-500 text-center py-4 border border-dashed border-neutral-800 rounded-lg">
                        No photos attached yet. Tap &apos;Upload Photo&apos; to attach live shop photos of this build.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERNAL STAFF QUESTIONNAIRE */}
            {activeTab === 'questionnaire' && (
              <div className="flex-1 p-6 overflow-y-auto bg-[#121622] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <h4 className="text-lg font-bold text-white font-display">
                      Internal Master Questionnaire &amp; Actuals Sheet
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Hidden from client view. Hand this out to technicians to collect actual turnaround days, machining details, and tools.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyQuestionnaire}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition-colors"
                    >
                      {copiedQuestionnaire ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedQuestionnaire ? 'Copied to Clipboard!' : 'Copy for Google Forms'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {WORKSHOP_MASTER_QUESTIONNAIRE.map((section, idx) => (
                    <div key={section.id} className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-num uppercase text-amber-500 font-bold">
                          SECTION {idx + 1} · {section.category}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {section.topicTitle}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80">
                        <strong className="text-neutral-200">What It Is:</strong> {section.whatItIs}
                      </div>

                      <div className="text-xs text-amber-300/80 bg-amber-950/20 p-3 rounded-lg border border-amber-800/30">
                        <strong className="text-amber-400">Previous Guess:</strong> {section.whatWasGuessed}
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-neutral-300 block">
                          Questions for Technicians to Answer:
                        </span>
                        {section.questionsForOwner.map((q, qIdx) => (
                          <div key={qIdx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                            <span className="text-amber-500 font-mono-num font-bold">{qIdx + 1}.</span>
                            <span>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
