'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { HeroTerminal } from '@/components/HeroTerminal';
import { HeroMap } from '@/components/HeroMap';
import type { Post } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface HeroSectionProps {
  posts: Post[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function HeroSection({ posts }: HeroSectionProps) {
  const [terminalDone, setTerminalDone] = useState(false);
  const [nearComplete, setNearComplete] = useState(false);
  const heroContentRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative overflow-hidden min-h-[max(80vh,600px)] flex flex-col pb-8 pt-12 md:pt-6">
      {/* World map + signal markers — fade in after terminal fade-out finishes */}
      <HeroMap posts={posts} visible={terminalDone} heroContentRef={heroContentRef} />

      {/* Terminal loading animation */}
      <HeroTerminal
        onComplete={() => setTerminalDone(true)}
        onNearComplete={() => setNearComplete(true)}
      />

      {/* Hero content — begins fading in when last terminal line starts typing
           z-[25] places text above signal markers (z-20) but below signal cards (z-30) */}
      <motion.div
        ref={heroContentRef}
        className="container relative z-[25] flex flex-1 flex-col items-center justify-between pt-28 pb-32 md:pt-32 md:pb-36 lg:pb-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={nearComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Title — top */}
        <div className="hero-text-backdrop text-center">
          <h1 className="text-hero mb-0 relative">
            Freedom Tech
            <br className="lg:hidden" />{' '}
            <span className="hero-accent">Research Engine</span>
          </h1>
        </div>

        {/* Description, buttons — bottom */}
        <div className="hero-text-backdrop text-center">
          <p className="text-body mb-2 max-w-4xl text-[var(--fg-secondary)] relative">
            AI-Powered research and publishing platform for
            sovereignty, censorship resistance, and civil liberties.
          </p>
          <p className="text-body mb-8 max-w-4xl text-[var(--fg-secondary)] relative">
            Agents track and compile freedom-tech sources autonomously.
            No gatekeepers. No censoring. Fully open.
          </p>

          <div className="relative flex flex-wrap justify-center gap-4 pointer-events-auto">
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
