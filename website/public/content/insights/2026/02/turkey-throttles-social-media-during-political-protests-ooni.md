---
title: "Turkey Throttles Social Media During Political Protests - OONI Documents Technical Evidence"
slug: "turkey-throttles-social-media-during-political-protests-ooni"
published_at: "2026-02-20T04:43:23.886Z"
status: "published"
topics:
  - "censorship-resistance"
  - "surveillance"
  - "activism"
  - "comms"
freedom_relevance_score: 85
credibility_score: 95
geo:
  - "Turkey"
citations:
  - "https://ooni.org/post/2025-turkiye-throttling-social-media/"
---

# Turkey Throttles Social Media During Political Protests - OONI Documents Technical Evidence

**TL;DR:** OONI documented systematic throttling of major social media platforms and blocking of Telegram during March 2025 protests in Turkey following arrest of Istanbul mayor Ekrem İmamoğlu.

## Key Points

- Protests erupted across Turkey on March 19, 2025 following arrest of Istanbul mayor and presidential candidate Ekrem İmamoğlu
- OONI network measurements detected throttling of Twitter/X, Facebook, Instagram, WhatsApp, YouTube, TikTok, and Signal
- Telegram access was completely blocked rather than throttled
- YouTube specifically blocked via DNS on TurkNet (AS12735) network
- Interference occurred across multiple ISPs during both March and September 2025 protest periods
- Technical evidence shows coordinated government response using different censorship techniques
- Pattern demonstrates sophisticated approach: throttling vs blocking based on platform

## Deep Dive

## Context and Background

This incident represents Turkey's continued use of internet censorship during politically sensitive periods, specifically targeting social media platforms used for protest coordination. The arrest of Ekrem İmamoğlu, a prominent opposition figure and presidential candidate, triggered nationwide demonstrations that the government sought to control through digital means.

## Technical Analysis

OONI's network measurements reveal a sophisticated censorship approach that differentiates between platforms. While most major social media services (Twitter/X, Facebook, Instagram, WhatsApp, YouTube, TikTok, Signal) were throttled - deliberately slowed rather than completely blocked - Telegram faced complete blocking. This suggests authorities view Telegram as particularly threatening, likely due to its encryption capabilities and use in protest coordination. The DNS blocking of YouTube on TurkNet (AS12735) shows additional targeted measures by specific ISPs.

## Implications for Threat Models

This case demonstrates that authoritarian governments are becoming more nuanced in their censorship approaches. Throttling creates plausible deniability while still degrading service effectiveness, making it harder for users to coordinate rapidly during time-sensitive situations like protests. The differential treatment of platforms suggests authorities are categorizing services based on perceived threat levels and technical capabilities.

## What Builders Should Consider

Developers working on freedom tech should account for throttling-based censorship in their threat models, not just complete blocking. Applications should be optimized for low-bandwidth scenarios and include fallback communication methods. The targeting of Telegram specifically highlights the importance of having diverse, decentralized communication channels rather than relying on any single platform, regardless of its encryption capabilities.

## Sources

- https://ooni.org/post/2025-turkiye-throttling-social-media/
