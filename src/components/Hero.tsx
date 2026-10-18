/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { WORKSHOP_INFO } from '../data/cawData';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { CountUp, EASE, FadeIn, Magnetic, MaskText, VelocityMarquee } from '../motion/primitives';

interface HeroProps {
  onOpenBooking: () => void;
}

/** Ridge lines, like a survey map of the Ghats. Generated once, drawn on load. */
const CONTOURS = Array.from({ length: 11 }, (_, i) => {
  const base = 360 + i * 44;
  const amp = 36 + i * 5;
  let d = `M -60 ${base}`;
  for (let k = 0; k < 7; k++) {
    const x0 = -60 + k * 260;
    const p = k + i * 0.42;
    d += ` C ${x0 + 80} ${base + Math.sin(p * 1.3) * amp}, ${x0 + 170} ${base + Math.sin(p * 1.3 + 1.6) * amp}, ${x0 + 260} ${
      base + Math.sin((p + 1) * 1.3) * amp * 0.6
    }`;
  }
  return d;
});

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const linesY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="on-dark relative isolate overflow-hidden bg-[color:var(--t-page)] min-h-[calc(100svh-4rem)] flex"
    >
      {/* Photo, slowly settling */}
      <motion.div style={{ y: photoY }} className="absolute inset-0 -z-20">
        <motion.div
          className="h-full w-full"
          initial={{ scale: 1.28 }}
          animate={{ scale: 1.04 }}
          transition={{ duration: 3.2, ease: EASE }}
        >
          {!imgError ? (
            <img
              src="/hero.webp"
              srcSet="/hero-800.webp 800w, /hero.webp 1280w"
              sizes="100vw"
              fetchPriority="high"
              decoding="async"
              alt="A Maruti Gypsy, a restored Willys-type jeep and a Mahindra jeep parked in a Coorg field"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-[50%_70%]"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_70%_30%,#2a2216_0%,#0b0e14_65%)]" />
          )}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(8_10_14/0.6)_0%,rgb(8_10_14/0.32)_50%,rgb(8_10_14/0.08)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-[rgb(8_10_14/0.88)] via-[rgb(8_10_14/0.45)] to-transparent" />

      {/* Contour lines */}
      <motion.svg
        aria-hidden="true"
        style={{ y: linesY }}
        className="absolute inset-0 -z-10 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {CONTOURS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="var(--t-accent)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeOpacity={0.12 + (i % 3) * 0.06}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, ease: EASE, delay: 0.2 + i * 0.12 }}
          />
        ))}
      </motion.svg>

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8"
      >
        <h1 className="font-display font-black tracking-[-0.03em] text-[color:var(--t-fg)] leading-[0.95] text-[clamp(1.9rem,4.4vw,4.4rem)]">
          <span className="block">
            <MaskText now text="Engineered for the Ghats." delay={0.15} stagger={0.08} />
          </span>
          <span className="block text-[color:var(--t-accent)]">
            <MaskText now text="Built for the Wild." delay={0.55} stagger={0.08} />
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:mt-12 lg:flex-row lg:items-end lg:justify-between">
          <FadeIn now delay={1.1} y={22}>
            <p className="max-w-md text-base leading-relaxed text-[color:var(--t-fg2)] sm:text-lg">
              Expert Mechanical Solutions Built to Last, Based in South Coorg. Book a consultation with our team on WhatsApp to discuss your next build.
            </p>
          </FadeIn>

          <FadeIn now delay={1.25} y={22}>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#showcase"
                  className="group flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>See our builds</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=Hello%20Coorg%20Auto%20Works!%20I%20would%20like%20to%20inquire%20about%20a%20vehicle%20build/service.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <MessageSquare className="h-4 w-4 text-[color:var(--t-good)]" />
                  <span>WhatsApp the workshop</span>
                </a>
              </Magnetic>
              <button
                onClick={onOpenBooking}
                className="px-3 py-3.5 text-sm font-medium text-[color:var(--t-fg2)] underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              >
                Book a consultation
              </button>
            </div>
          </FadeIn>
        </div>

        <div className="mt-10 flex items-center justify-between text-xs text-[color:var(--t-muted)]">
          <span>Near Ponnampet, Kodagu</span>
        </div>
      </motion.div>
    </section>
  );
};

/** Platforms we work on, then the numbers. Sits straight under the hero. */
export const ProofBand: React.FC = () => (
  <section id="brands" className="scroll-mt-16 border-b border-[color:var(--t-border)] bg-[color:var(--t-page)]">
    <VelocityMarquee items={['Mahindra', 'Maruti Suzuki', 'Tata', 'Toyota', 'Hyundai', 'Honda', 'Force', 'Willys', 'Ashok Leyland', 'Kirloskar', 'Skoda', 'Volkswagen', 'Mercedes Benz']} />
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {WORKSHOP_INFO.stats.map((stat, idx) => (
          <FadeIn key={stat.label} delay={idx * 0.08} className="flex flex-col-reverse">
            <dt className="mt-2 text-sm text-[color:var(--t-muted)]">{stat.label}</dt>
            <dd className="font-display text-3xl font-extrabold tracking-tight text-[color:var(--t-fg)] sm:text-4xl text-balance">
              <CountUp value={stat.value} />
            </dd>
          </FadeIn>
        ))}
      </dl>
    </div>
  </section>
);
