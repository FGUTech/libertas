'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const LINES = [
  '> initializing',
  '> scanning global signals...',
  '> publishing insights [OK]',
];

const CHAR_DELAY = 15; // ms per character
const LINE_PAUSE = 100; // ms pause between lines
const DONE_PAUSE = 200; // ms pause after last line before fade

interface HeroTerminalProps {
  onComplete: () => void;
  onNearComplete?: () => void;
}

export function HeroTerminal({ onComplete, onNearComplete }: HeroTerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>(['']);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [visible, setVisible] = useState(true);
  const [nearCompleteFired, setNearCompleteFired] = useState(false);

  // Fire onNearComplete when the last line starts typing
  useEffect(() => {
    if (
      !nearCompleteFired &&
      currentLine === LINES.length - 1 &&
      currentChar === 0 &&
      isTyping
    ) {
      setNearCompleteFired(true);
      onNearComplete?.();
    }
  }, [currentLine, currentChar, isTyping, nearCompleteFired, onNearComplete]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    if (currentLine >= LINES.length) {
      setIsTyping(false);
      return;
    }

    const line = LINES[currentLine];

    if (currentChar < line.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const copy = [...prev];
          copy[currentLine] = line.slice(0, currentChar + 1);
          return copy;
        });
        setCurrentChar((c) => c + 1);
      }, CHAR_DELAY);
      return () => clearTimeout(timeout);
    }

    // Line complete — pause then move to next
    const timeout = setTimeout(() => {
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
      setDisplayedLines((prev) => [...prev, '']);
    }, LINE_PAUSE);
    return () => clearTimeout(timeout);
  }, [currentLine, currentChar, isTyping]);

  // Separate effect: when typing finishes, schedule the fade-out
  useEffect(() => {
    if (!isTyping) {
      const timeout = setTimeout(() => setVisible(false), DONE_PAUSE);
      return () => clearTimeout(timeout);
    }
  }, [isTyping]);

  const handleExitComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="space-y-2 text-mono text-[var(--accent-primary)]">
            {displayedLines.map((text, i) => (
              <p key={i}>
                {text}
                {i === currentLine && isTyping && (
                  <span className="terminal-cursor inline-block ml-1 h-4 w-1.5 bg-[var(--accent-primary)]" />
                )}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
