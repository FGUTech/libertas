'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { WorldMapBackground } from '@/components/WorldMapBackground';
import { HeroTerminal } from '@/components/HeroTerminal';

export function HeroSection() {
  const [terminalDone, setTerminalDone] = useState(false);

  return (
    <section className="relative overflow-hidden h-[80vh] flex flex-col py-8">
      <WorldMapBackground className="px-1 md:px-0" />

      {/* Terminal loading animation */}
      <HeroTerminal onComplete={() => setTerminalDone(true)} />

      {/* Hero content — fades in after terminal completes */}
      <motion.div
        className="container relative z-10 flex flex-1 flex-col items-center justify-between pt-28 pb-32 md:pt-32 md:pb-36 lg:pb-40"
        initial={{ opacity: 0 }}
        animate={terminalDone ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Title — top */}
        <div className="text-center">
          <h1 className="text-hero mb-0">
            Freedom Tech
            <br className="lg:hidden" />{' '}
            <span className="hero-accent">Research Engine</span>
          </h1>
        </div>

        {/* Description, buttons — bottom */}
        <div className="text-center">
          <p className="text-body mb-2 max-w-4xl text-[var(--fg-secondary)]">
            AI-Powered research and publishing platform for
            sovereignty, censorship resistance, and civil liberties.
          </p>
          <p className="text-body mb-8 max-w-4xl text-[var(--fg-secondary)]">
            Agents track and compile freedom-tech sources autonomously.
            No gatekeepers. No censoring. Fully open.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/posts" className="btn btn-primary">
              Explore Posts
            </Link>
            <Link href="/intake" className="btn btn-secondary">
              Submit a Signal
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Subtle gradient overlay */}
      <div className="hero-gradient pointer-events-none absolute inset-0" />
    </section>
  );
}
