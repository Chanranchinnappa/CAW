/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MotionConfig } from 'motion/react';
import { Hero, ProofBand } from './components/Hero';
import { SmoothScroll } from './motion/SmoothScroll';
import { ScrollProgress } from './motion/primitives';
import { ServicesSection } from './components/ServicesSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { PipelineSection } from './components/PipelineSection';
import { WorkshopLocation } from './components/WorkshopLocation';
import { ServiceInquiryModal } from './components/ServiceInquiryModal';
import { WorkshopAdminPortal } from './components/WorkshopAdminPortal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_WORKSHOP_PIPELINE } from './data/cawData';
import { PipelineBuild } from './types';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  // The staff area is its own page at /#/staff (no server setup needed).
  const readRoute = () => (typeof window !== 'undefined' && window.location.hash === '#/staff' ? 'staff' : 'site');
  const [route, setRoute] = useState<'site' | 'staff'>(readRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const openStaff = () => {
    window.location.hash = '#/staff';
  };
  const leaveStaff = () => {
    history.pushState('', document.title, window.location.pathname + window.location.search);
    setRoute('site');
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    // The staff page must not appear in search results.
    const prev = document.title;
    let meta: HTMLMetaElement | null = null;
    if (route === 'staff') {
      document.title = 'Staff | Coorg Auto Works';
      meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
    return () => {
      document.title = prev;
      meta?.remove();
    };
  }, [route]);
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

  if (route === 'staff') {
    return (
      <MotionConfig reducedMotion="user">
        <div className="bg-[color:var(--t-page)] text-[color:var(--t-fg)] font-sans selection:bg-amber-500 selection:text-black">
          <ErrorBoundary label="The staff page" onReset={leaveStaff}>
            <WorkshopAdminPortal onClose={leaveStaff} pipeline={pipeline} onUpdatePipeline={handleUpdatePipeline} />
          </ErrorBoundary>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <SmoothScroll />
    <ScrollProgress />
    <div className="min-h-screen bg-[color:var(--t-page)] text-[color:var(--t-fg)] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation Bar */}
      <Header
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdminPortal={() => openStaff()}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* Hero Section with Value Proposition & Trust Metrics Strip */}
        <Hero onOpenBooking={() => handleOpenBooking()} />
        <ProofBand />

        {/* Core Services Bento Grid with Numbered Cards */}
        <ServicesSection onSelectService={(service) => handleOpenBooking(service)} />

        {/* Finished Restorations & Projects Showcase */}
        <ShowcaseSection />

        {/* Live Workshop Bays Pipeline (Directly maintainable by staff) */}
        <PipelineSection
          pipeline={pipeline}
          onOpenAdminPortal={() => openStaff()}
        />

        {/* Workshop Facility, Directions & Emergency Contact Hub */}
        <WorkshopLocation
          onOpenBooking={() => handleOpenBooking()}
          onOpenAdminPortal={() => openStaff()}
        />
      </main>

      {/* Footer. Staff open the portal from the lock icon in the header. */}
      <Footer />

      {/* Service Consultation & Booking Modal */}
      <ServiceInquiryModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        preselectedService={preselectedService}
      />

    </div>
    </MotionConfig>
  );
}
