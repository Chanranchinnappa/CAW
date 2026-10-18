/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { WORKSHOP_INFO } from '../data/cawData';
import { X, Send, CheckCircle2, Phone, Calendar, Wrench } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

export const ServiceInquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedService,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceRequested: preselectedService || 'General 4x4 Mechanical Inspection',
    clientEstateLocation: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pick up the service chosen on the page each time the form opens.
  useEffect(() => {
    if (isOpen) {
      setFormData((f) => ({ ...f, serviceRequested: preselectedService || 'General 4x4 Mechanical Inspection' }));
    }
  }, [isOpen, preselectedService]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (!formData.vehicleModel.trim()) {
      setErrorMsg('Please specify your vehicle make/model (e.g., MM540, Bolero, Safari, Gypsy).');
      return;
    }

    setErrorMsg('');
    setSubmitted(true);
  };

  const handleSendToWhatsApp = () => {
    const text = `Hello Coorg Auto Works!%0A%0A*Service Consultation Request:*%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Vehicle:* ${formData.vehicleModel} (${formData.vehicleYear || 'N/A'})%0A*Service:* ${formData.serviceRequested}%0A*Location/Estate:* ${formData.clientEstateLocation || 'Coorg'}%0A*Requirements:* ${formData.notes || 'Full inspection'}`;

    window.open(`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm caw-fade-in">
      <div data-lenis-prevent className="caw-rise-in relative w-full max-w-lg bg-[color:var(--t-panel)] rounded-2xl border border-[color:var(--t-borderstrong)] shadow-2xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[color:var(--t-muted)] hover:text-[color:var(--t-fg)] rounded-lg bg-[color:var(--t-cardsel)] hover:bg-[color:var(--t-raised)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="pr-8">
              <div className="text-xs font-mono-num text-[color:var(--t-accent)] uppercase tracking-wider mb-1">
                MATTURU WORKSHOP INTAKE
              </div>
              <h3 className="text-xl font-bold text-[color:var(--t-fg)] font-display">
                Book a Vehicle Service or Restomod Consultation
              </h3>
              <p className="mt-1 text-xs text-[color:var(--t-muted)]">
                Direct consultation with master technician Charan Chinnappa.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Biddappa Muthappa"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98450 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                    Your Estate / Town
                  </label>
                  <input
                    type="text"
                    value={formData.clientEstateLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEstateLocation: e.target.value })
                    }
                    placeholder="e.g. Ponnampet / Gonikoppal"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                    Vehicle Make &amp; Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="e.g. Mahindra MM540 4WD"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                    Manufacturing Year
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    placeholder="e.g. 1996"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                  Primary Service Required
                </label>
                <select
                  value={formData.serviceRequested}
                  onChange={(e) => setFormData({ ...formData, serviceRequested: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {![
                    'General 4x4 Mechanical Inspection',
                    'Engine Overhaul & Rebuild',
                    'Front Shackle Reversal & Suspension Lift',
                    'Differential Re-Gearing & Locking Hubs',
                    'Custom Bumper, Winch & Roll Cage Fabrication',
                    'Complete Monsoon Rust Treatment & Respray',
                    'Full Restomod Ground-Up Project',
                  ].includes(formData.serviceRequested) && (
                    <option value={formData.serviceRequested}>{formData.serviceRequested}</option>
                  )}
                  <option value="General 4x4 Mechanical Inspection">
                    General 4x4 Mechanical Inspection &amp; Tuning
                  </option>
                  <option value="Engine Overhaul & Rebuild">
                    Engine Overhaul &amp; Rebuild (XD3P / Di / TCIC / Dicor / G13BB)
                  </option>
                  <option value="Front Shackle Reversal & Suspension Lift">
                    Front Shackle Reversal &amp; Suspension Lift
                  </option>
                  <option value="Differential Re-Gearing & Locking Hubs">
                    Differential Re-Gearing &amp; Locking Hubs
                  </option>
                  <option value="Custom Bumper, Winch & Roll Cage Fabrication">
                    Custom Bumper, Winch &amp; Roll Cage Fabrication
                  </option>
                  <option value="Complete Monsoon Rust Treatment & Respray">
                    Complete Monsoon Rust Treatment &amp; Respray
                  </option>
                  <option value="Full Restomod Ground-Up Project">
                    Full Restomod Ground-Up Project
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[color:var(--t-fg2)] mb-1">
                  Specific Issues or Build Vision
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Mention any mechanical symptoms (e.g. gearbox noise, overheating during crawl, rusted floor pans)..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--t-card)] border border-[color:var(--t-borderstrong)] text-xs sm:text-sm text-[color:var(--t-fg)] focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition-colors"
                >
                  Confirm Appointment Request
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-[color:var(--t-good)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[color:var(--t-fg)] font-display">
              Request Received by Coorg Auto Works
            </h3>
            <p className="text-xs sm:text-sm text-[color:var(--t-fg2)] leading-relaxed max-w-sm mx-auto">
              Thank you, <strong className="text-[color:var(--t-fg)]">{formData.name}</strong>. Our workshop team will review your {formData.vehicleModel} details and contact you at{' '}
              <span className="font-mono-num text-[color:var(--t-accent2)]">{formData.phone}</span>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSendToWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct WhatsApp Message</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-[color:var(--t-raised)] hover:bg-[color:var(--t-raisedhover)] text-[color:var(--t-fg2)] rounded-lg text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
