'use client';

import { CountUp } from '@/components/ui/count-up';
import ScrollReveal from '@/components/ui/scroll-reveal';
import ScrollFloat from '@/components/ui/ScrollFloat';
import { AuroraText } from '@/components/shared/AuroraText';
import AboutImage from '@/assets/about-image.png';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

/* ─── Data ──────────────────────────────────────────────────── */

const stats = [
  {
    value: 3800,
    suffix: '+',
    label: 'Accessible locations listed',
    sub: 'spanning malls, transit hubs, parks, and public buildings',
  },
  {
    value: 7500,
    suffix: '+',
    label: 'Verified community reviews',
    sub: 'submitted by real people navigating everyday spaces',
  },
  {
    value: 60,
    suffix: '+',
    label: 'Cities covered',
    sub: 'and expanding as our global community grows',
  },
  {
    value: 120,
    suffix: '+',
    label: 'Accessibility features tracked',
    sub: 'from ramps and lifts to tactile paths and quiet rooms',
  },
];

/* ─── Rating Badge ──────────────────────────────────────────── */

function RatingBadge() {
  return (
    <div className="inline-flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-[0_2px_16px_rgba(121,40,202,0.07)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20">
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className="h-4 w-4 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black leading-none text-gray-900 dark:text-white">4.97</span>
        <span className="text-xs font-medium text-gray-400 dark:text-slate-400">/5</span>
      </div>

      {/* Label */}
      <p className="text-[11px] leading-tight text-gray-400 dark:text-slate-400">
        trusted by{' '}
        <AuroraText
          className="text-[11px] font-semibold"
          colors={['#FF0080', '#7928CA', '#0070F3']}
          speed={0.6}
        >
          7,500+ reviewers
        </AuroraText>
      </p>

      {/* Divider */}
      <div className="h-px w-full bg-gray-100 dark:bg-white/10" />

      {/* Tag */}
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#FF0080] to-[#7928CA]" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">
          Community Verified
        </span>
      </div>
    </div>
  );
}

/* ─── Single Stat Column ────────────────────────────────────── */

function StatColumn({ stat }: { stat: (typeof stats)[0] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-60px' });
  const [countKey, setCountKey] = useState(0);

  useEffect(() => {
    if (isInView) {
      setCountKey((k) => k + 1);
    }
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-1.5 border-t border-gray-100 pt-7 transition-colors duration-200 hover:border-[#7928CA]/30 dark:border-white/10"
    >
      <AuroraText
        className="text-[clamp(2.2rem,3.5vw,3rem)] font-black !leading-none tracking-tight"
        colors={['#FF0080', '#7928CA', '#0070F3', '#38BDF8']}
        speed={0.8}
      >
        <CountUp
          key={countKey}
          value={stat.value}
          suffix={stat.suffix}
          duration={3}
          animationStyle="gentle"
          triggerOnView
        />
      </AuroraText>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-gray-700 dark:text-slate-100">
        {stat.label}
      </p>
      <p className="max-w-[200px] text-xs leading-relaxed text-gray-400 dark:text-slate-400">
        {stat.sub}
      </p>
    </div>
  );
}

/* ─── Main Section ──────────────────────────────────────────── */

export function About() {
  return (
    <section className="w-full bg-white py-24 transition-colors duration-300 dark:bg-slate-950 md:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        {/* ── Top: heading block + badge ───────────────────── */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Left column */}
          <div className="flex flex-col md:max-w-[60%]">
            {/* Eyebrow */}
            <ScrollFloat
              containerClassName="!my-0 !overflow-visible"
              textClassName="!text-[0.68rem] !leading-none uppercase tracking-[0.22em] text-gray-400 dark:text-slate-400 font-semibold"
              animationDuration={0.85}
              ease="power2.out"
              stagger={0.012}
              scrollStart="center bottom+=25%"
              scrollEnd="bottom bottom-=55%"
            >
              Inclusive by Design
            </ScrollFloat>

            {/* Main heading */}
            <motion.h2
              className="mt-5 text-[clamp(1.9rem,4vw,3.9rem)] font-black leading-[1.1] tracking-tight text-neutral-900 dark:text-white"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2,
              }}
            >
              We are passionate about{' '}
              <AuroraText
                className="font-extrabold"
                colors={['#FF0080', '#7928CA', '#0070F3', '#38BDF8']}
                speed={0.8}
              >
                empowering
              </AuroraText>{' '}
              individuals to navigate
              <br className="hidden sm:block" /> the world with{' '}
              <span className="italic text-neutral-400 dark:text-slate-400">confidence.</span>
            </motion.h2>

            {/* Paragraph */}
            <div className="mt-7 max-w-[46ch]">
              <ScrollReveal
                containerClassName="!my-0"
                textClassName="!text-[0.975rem] !font-normal !leading-[1.75] text-gray-500 dark:text-slate-300"
                enableBlur
                baseOpacity={0}
                baseRotation={0}
                blurStrength={3}
              >
                AccessAble helps people share real accessibility experiences — from ramps, lifts,
                and tactile paths to braille signage, accessible entrances, and quiet rooms. Because
                navigating the world should never require guesswork.
              </ScrollReveal>
            </div>
          </div>

          {/* Right column — badge + image */}
          <div className="flex shrink-0 flex-col items-start gap-6 md:items-end md:pt-1.5">
            <RatingBadge />
            <motion.div
              className="w-full overflow-hidden rounded-2xl border -ml-12 border-gray-100 shadow-[0_4px_24px_rgba(121,40,202,0.08)] dark:border-white/10 dark:shadow-black/20 md:w-[600px]"
              initial={{ opacity: 0, x: 48, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{
                duration: 1.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.4,
              }}
            >
              <img
                src={AboutImage}
                alt="Accessible public space showcasing inclusive design features"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* ── Hairline divider ─────────────────────────────── */}
        <div className="mt-16 h-px w-full bg-gray-100 dark:bg-white/10" />

        {/* ── Stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatColumn key={i} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
