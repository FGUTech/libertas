import type { Topic } from '@/types';

/**
 * Signal color keys for topic-based marker coloring.
 *
 * Green  → censorship-resistance, activism, sovereignty
 * Amber  → bitcoin, payments
 * Purple → zk, identity
 * Cyan   → privacy, surveillance, comms
 */
export type SignalColor = 'green' | 'amber' | 'purple' | 'cyan';

const TOPIC_COLOR_MAP: Record<Topic, SignalColor> = {
  'censorship-resistance': 'green',
  activism: 'green',
  sovereignty: 'green',
  bitcoin: 'amber',
  payments: 'amber',
  zk: 'purple',
  identity: 'purple',
  privacy: 'purple',
  surveillance: 'cyan',
  comms: 'cyan',
};

/** Resolve a topic to its signal color key (uses primary topic). */
export function topicToSignalColor(topic: Topic): SignalColor {
  return TOPIC_COLOR_MAP[topic] ?? 'green';
}

