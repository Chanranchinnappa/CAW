/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WORKSHOP_INFO } from '../data/cawData';
import { ExternalLink, MessageSquare, Phone } from 'lucide-react';
import { FadeIn, Magnetic, SectionHead } from '../motion/primitives';

interface WorkshopLocationProps {
  onOpenBooking: () => void;
  onOpenAdminPortal?: () => void;
}

const ROUTES = [
  { from: 'Ponnampet town centre, 2.5 km', how: 'Head south on Balale Road towards Coorg Sports Club. The workshop gates are 200 m past the sports ground, on the right.' },
  { from: 'Gonikoppal, 9 km', how: 'Take the Gonikoppal to Ponnampet highway (SH-89) and turn onto Balale Road at the Ponnampet junction. About 12 minutes.' },
  { from: 'Mysore and Hunsur, 85 km', how: 'Follow Mysore, Hunsur, Anechaukur checkpost, Gonikoppal, then Ponnampet. A scenic drive through coffee plantations.' },
];

const BAYS = [
  { name: 'Lift and chassis alignment', job: 'Body-off frame inspection, rust conversion, differential shimming and shackle reversal geometry.' },
  { name: 'Engine rebuild and machining', job: 'Cylinder head decking, crank balancing and diesel injection pump calibration in a clean room.' },
  { name: 'Fabrication and roll cages', job: 'MIG welding, tube bending and plate cutting for winch bumpers, rock sliders and cages.' },
  { name: 'Test yard', job: 'A ramp and mud track along Balale Road where finished builds are checked in 4WD low range.' },
];

export const WorkshopLocation: React.FC<WorkshopLocationProps> = ({ onOpenBooking }) => {
  const { location, contact } = WORKSHOP_INFO;
  return (
    <section id="workshop-facility" className="bg-[color:var(--t-page)] py-24 sm:py-32 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          title="Visit the workshop"
          intro="Near Coorg Sports Club on Balale Road. Walk in for an inspection, a consultation or a test drive."
        />

        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <address className="not-italic">
              <p className="font-display text-2xl font-bold leading-snug text-[color:var(--t-fg)] sm:text-3xl">
                {location.village}, {location.landmark}
              </p>
              <p className="mt-2 text-base text-[color:var(--t-muted)]">
                {location.town}, {location.taluk}, {location.district}, {location.state} {location.pincode}
              </p>
            </address>

            <dl className="mt-8 space-y-4 border-t border-[color:var(--t-border)] pt-8 text-base">
              <div className="flex flex-wrap justify-between gap-x-6">
                <dt className="text-[color:var(--t-muted)]">Open</dt>
                <dd className="text-[color:var(--t-fg)]">{contact.hours}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6">
                <dt className="text-[color:var(--t-muted)]">Emergencies</dt>
                <dd className="text-[color:var(--t-accent2)]">{contact.emergencyHours}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href={`tel:${contact.phonePrimary}`}
                  className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <Phone className="h-4 w-4" />
                  Call {contact.phoneFormatted}
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={`https://wa.me/${contact.whatsapp}?text=Hello%20Coorg%20Auto%20Works!%20I%20am%20looking%20for%20directions%20or%20a%20workshop%20appointment.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </a>
              </Magnetic>
              <a
                href={location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-[color:var(--t-borderstrong)] px-5 py-3.5 text-sm font-medium text-[color:var(--t-fg2)] transition-colors hover:border-[color:var(--t-accent)] hover:text-[color:var(--t-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Maps
              </a>
              <button
                onClick={onOpenBooking}
                className="px-3 py-3.5 text-sm font-medium text-[color:var(--t-fg2)] underline decoration-[color:var(--t-borderstrong)] underline-offset-4 transition-colors hover:text-[color:var(--t-fg)] hover:decoration-[color:var(--t-accent)] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Book a consultation
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h3 className="font-display text-xl font-bold text-[color:var(--t-fg)]">Getting here</h3>
            <ul className="mt-4 divide-y divide-[color:var(--t-border)] border-y border-[color:var(--t-border)]">
              {ROUTES.map((r) => (
                <li key={r.from} className="py-5">
                  <p className="font-semibold text-[color:var(--t-fg)]">From {r.from}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[color:var(--t-muted)]">{r.how}</p>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <div className="mt-24 sm:mt-32">
          <FadeIn>
            <h3 className="font-display text-3xl font-extrabold tracking-tight text-[color:var(--t-fg)] sm:text-4xl">
              Four bays, four jobs
            </h3>
          </FadeIn>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {BAYS.map((bay, i) => (
              <FadeIn key={bay.name} delay={i * 0.08} className="border-t border-[color:var(--t-borderstrong)] pt-5">
                <p className="font-display text-lg font-bold leading-snug text-[color:var(--t-fg)]">{bay.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--t-muted)]">{bay.job}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
