---
title: "OONI Documents Ongoing X/Twitter Blocking Across Tanzania Networks"
slug: "ooni-documents-ongoing-x-twitter-blocking-across-tanzania-ne"
published_at: "2026-02-20T04:43:23.886Z"
status: "published"
topics:
  - "censorship-resistance"
  - "surveillance"
  - "activism"
freedom_relevance_score: 85
credibility_score: 95
geo:
  - "Tanzania"
  - "Zanzibar"
citations:
  - "https://ooni.org/post/2025-tanzania-blocked-twitter/"
---

# OONI Documents Ongoing X/Twitter Blocking Across Tanzania Networks

**TL;DR:** Technical measurements confirm X (Twitter) has been blocked across major Tanzanian ISPs since May 2025, with network-level censorship affecting multiple autonomous systems.

## Key Points

- OONI data confirms X/Twitter blocking across Tanzania since May 2025
- Censorship implemented across major ISPs: Airtel Tanzania, Vodacom, Tanzania Telecom, and Zanzibar Connections
- Technical analysis shows DNS and IP-based blocking methods being deployed
- Network variances suggest coordinated but technically different implementation approaches
- Blocking affects both twitter.com and x.com domains
- Government censorship targets major social media platform used for information sharing
- OONI's measurements provide technical evidence for circumvention tool development

## Deep Dive

## Context and Significance

This OONI report provides critical technical documentation of systematic social media censorship in Tanzania. The coordinated blocking across multiple major ISPs indicates government-mandated censorship rather than isolated technical issues. Tanzania's blocking of X/Twitter follows a pattern seen across authoritarian regimes seeking to control information flows during politically sensitive periods.

## Technical Implementation Details

The censorship implementation varies across networks, suggesting ISPs are using different technical approaches to comply with blocking orders. OONI's measurements indicate both DNS-based blocking (preventing domain resolution) and IP-based blocking (preventing access to X's servers) are being employed. This multi-layered approach makes simple DNS circumvention insufficient - users would need more sophisticated tools like VPNs or Tor to access the platform.

## Implications for Freedom Tech Builders

This documented case provides valuable intelligence for anti-censorship tool development. The network-specific implementation differences suggest opportunities for targeted circumvention strategies. The fact that both legacy (twitter.com) and current (x.com) domains are blocked shows authorities are being thorough in their technical implementation. Builders should note that simple DNS-over-HTTPS solutions may not be sufficient given the multi-layered blocking approach.

## Threat Model Considerations

The systematic nature of this blocking across multiple ISPs demonstrates Tanzania's increasing technical capacity for internet censorship. This suggests other platforms and services could face similar restrictions, and that more sophisticated blocking techniques may be deployed in the future. The technical documentation by OONI is crucial for understanding exactly how the censorship works and developing appropriate countermeasures.

## Sources

- https://ooni.org/post/2025-tanzania-blocked-twitter/
