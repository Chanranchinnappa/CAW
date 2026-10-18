/**
 * Shared motion building blocks. One easing curve and a few reusable
 * behaviours so the whole site moves the same way.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------------------------------------- MaskText */

interface MaskTextProps {
  text: string;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  /** Animate on mount instead of waiting for scroll. */
  now?: boolean;
}

/** Headline where every word rises out of an invisible mask. */
export const MaskText: React.FC<MaskTextProps> = ({ text, className = '', delay = 0, stagger = 0.05, now = false }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const go = now || inView;
  const words = text.split(' ');

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.16em] -mb-[0.16em]">
            <motion.span
              className="inline-block will-change-transform origin-bottom-left"
              initial={{ y: '115%', rotate: 4 }}
              animate={go ? { y: '0%', rotate: 0 } : undefined}
              transition={{ duration: 0.95, ease: EASE, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
};

/* ----------------------------------------------------------------- FadeIn */

export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  now?: boolean;
}> = ({ children, className = '', delay = 0, y = 18, now = false }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    {...(now
      ? { animate: { opacity: 1, y: 0 } }
      : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '0px 0px -10% 0px' } })}
    transition={{ duration: 0.9, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

/* --------------------------------------------------------------- Magnetic */

/** Wraps a button so it leans toward the pointer. Ignored on touch and with reduced motion. */
export const Magnetic: React.FC<{ children: React.ReactNode; strength?: number; className?: string }> = ({
  children,
  strength = 0.28,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ---------------------------------------------------------------- CountUp */

/** "450+" counts up to 450 and keeps the "+". Strings without a leading number are shown as-is. */
export const CountUp: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  const match = value.match(/^(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const target = match ? parseInt(match[1], 10) : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!match || !inView) return;
    if (reduce) {
      setN(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, target]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">
        {n}
        {match[2]}
      </span>
    </span>
  );
};

/* --------------------------------------------------------------- Marquee */

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** Big outlined type that drifts sideways and speeds up (and reverses) with your scroll speed. */
export const VelocityMarquee: React.FC<{ items: string[]; baseVelocity?: number }> = ({ items, baseVelocity = -2.24 }) => {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    // The strip always drifts. With reduced motion on it moves slowly and ignores scroll speed.
    let move = dir.current * baseVelocity * (reduce ? 0.5 : 1) * (delta / 1000);
    if (reduce) {
      baseX.set(baseX.get() + move);
      return;
    }
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const group = (k: number) => (
    <div key={k} className="flex shrink-0 items-center" aria-hidden={k > 0}>
      {items.map((item) => (
        <React.Fragment key={item}>
          <span className="marquee-word px-6 sm:px-10">{item}</span>
          <span className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rotate-45 bg-[color:var(--t-accent)] shrink-0" />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden py-6 sm:py-10 select-none" role="img" aria-label={items.join(', ')}>
      <motion.div style={{ x }} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1, 2, 3].map(group)}
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------- ScrollProgress */

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-[color:var(--t-accent)]"
    />
  );
};

/* ------------------------------------------------------------ SectionHead */

export const SectionHead: React.FC<{
  title: string;
  intro?: string;
  right?: React.ReactNode;
}> = ({ title, intro, right }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
    <div className="max-w-3xl">
      <h2 className="font-display font-extrabold tracking-tight text-[color:var(--t-fg)] text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-balance">
        <MaskText text={title} />
      </h2>
      {intro && (
        <FadeIn delay={0.25}>
          <p className="mt-5 text-base sm:text-lg text-[color:var(--t-muted)] leading-relaxed max-w-xl">{intro}</p>
        </FadeIn>
      )}
    </div>
    {right && <FadeIn delay={0.3}>{right}</FadeIn>}
  </div>
);
