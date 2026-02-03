'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is Libertas?",
    answer: "Libertas is an automated, privacy-preserving research and publishing platform for Freedom Tech. It continuously monitors curated sources, classifies content using AI, and publishes insights about sovereignty, censorship resistance, and civil liberties. Think of it as Freedom Tech infrastructure that converts global signals into actionable understanding."
  },
  {
    question: "How does the AI classification work?",
    answer: "Our system uses Claude AI to classify content based on freedom relevance and credibility scores. Content from high-trust sources (Tier 1) like HRF, EFF, and Bitcoin Magazine is processed with minimal filtering. Lower-tier sources face stricter relevance thresholds. Content meeting our quality gates is automatically published, while edge cases are queued for human review."
  },
  {
    question: "Is my data tracked?",
    answer: "No. Libertas is built with privacy-first principles. We use no tracking pixels, no fingerprinting scripts, and no third-party analytics. Your reading habits are your own. All feeds are accessible without accounts or authentication."
  },
  {
    question: "How can I submit content?",
    answer: "Use our Submit form to share stories, project ideas, or feedback. All submissions are assessed by our AI pipeline for risk level and relevance. High-quality submissions may be processed into insights or project proposals. We accept anonymous submissions."
  },
  {
    question: "What topics does Libertas cover?",
    answer: "We focus on Freedom Tech topics including: Bitcoin, zero-knowledge proofs, censorship resistance, privacy-preserving communications, decentralized payments, digital identity and sovereignty, surveillance countermeasures, and activism technology. All content ties back to tech-enabled sovereignty and resistance to surveillance."
  },
  {
    question: "Who builds Libertas?",
    answer: "Libertas is built by the Freedom Go Up (FGU) squad at StarkWare. We are engineers focused on building tools that enhance human freedom and sovereignty. Our mission is rooted in cypherpunk principles: code and cryptography as tools for liberation."
  },
  {
    question: "How can I subscribe to updates?",
    answer: "You can subscribe via our RSS or JSON feeds — no account required. Visit the Feeds page for URLs and documentation. We also offer an optional email digest for weekly summaries, with no tracking in emails."
  },
  {
    question: "Is Libertas open source?",
    answer: "Yes. Our platform code, agent prompts, and output schemas are open source under permissive licensing. The entire system is designed to be auditable, forkable, and extensible. Check our GitHub repository for the full codebase."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => (
        <FAQAccordionItem
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ item, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div className="card overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-h3 text-[var(--fg-primary)]">{item.question}</span>
        <ChevronIcon className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-body text-[var(--fg-secondary)]">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`icon text-[var(--fg-tertiary)] ${className || ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
