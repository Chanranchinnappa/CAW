/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { PipelineSection } from './components/PipelineSection';
import { ConfiguratorStudio } from './components/ConfiguratorStudio';
import { WorkshopLocation } from './components/WorkshopLocation';
import { ServiceInquiryModal } from './components/ServiceInquiryModal';
import { WorkshopAdminPortal } from './components/WorkshopAdminPortal';
import { Footer } from './components/Footer';
import { INITIAL_WORKSHOP_PIPELINE } from './data/cawData';
import { PipelineBuild } from './types';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  // Dynamic Workshop Pipeline (Persisted in localStorage for staff updates)
  const [pipeline, setPipeline] = useState<PipelineBuild[]>(() => {
    try {
      const saved = localStorage.getItem('caw_workshop_pipeline');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_WORKSHOP_PIPELINE;
  });

  const handleUpdatePipeline = (newPipeline: PipelineBuild[]) => {
    setPipeline(newPipeline);
    try {
      localStorage.setItem('caw_workshop_pipeline', JSON.stringify(newPipeline));
    } catch (e) {
      // ignore
    }
  };

  const handleOpenBooking = (serviceTitle?: string) => {
    setPreselectedService(serviceTitle);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setPreselectedService(undefined);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation Bar */}
      <Header
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdminPortal={() => setIsAdminOpen(true)}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* Hero Section with Value Proposition & Trust Metrics Strip */}
        <Hero onOpenBooking={() => handleOpenBooking()} />

        {/* Core Services Bento Grid with Numbered Cards */}
        <ServicesSection onSelectService={(service) => handleOpenBooking(service)} />

        {/* Finished Restorations & Projects Showcase */}
        <ShowcaseSection />

        {/* Live Workshop Bays Pipeline (Directly maintainable by staff) */}
        <PipelineSection
          pipeline={pipeline}
          onOpenAdminPortal={() => setIsAdminOpen(true)}
        />

        {/* The 4x4 Bespoke Configurator Studio (Expanded with Commander, Major MDI, Vintage Modern Paint Atelier) */}
        <ConfiguratorStudio onBookService={(platform) => handleOpenBooking(`Custom Build: ${platform}`)} />

        {/* Workshop Facility, Directions & Emergency Contact Hub */}
        <WorkshopLocation
          onOpenBooking={() => handleOpenBooking()}
          onOpenAdminPortal={() => setIsAdminOpen(true)}
        />
      </main>

      {/* Quiet Footer with Discreet Staff Operations Link */}
      <Footer onOpenAdminPortal={() => setIsAdminOpen(true)} />

      {/* Service Consultation & Booking Modal */}
      <ServiceInquiryModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        preselectedService={preselectedService}
      />

      {/* Background Operations Portal (Protected for workshop staff to update bays, voice logs & questionnaire) */}
      <WorkshopAdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        pipeline={pipeline}
        onUpdatePipeline={handleUpdatePipeline}
      />
    </div>
  );
}
