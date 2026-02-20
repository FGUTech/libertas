---
title: "OONI Study Reveals Inconsistent DNS Censorship Infrastructure Across French ISPs"
slug: "ooni-study-reveals-inconsistent-dns-censorship-infrastructur"
published_at: "2026-02-20T04:43:23.888Z"
status: "published"
topics:
  - "censorship-resistance"
  - "surveillance"
  - "privacy"
freedom_relevance_score: 85
credibility_score: 95
geo:
  - "France"
  - "New Caledonia"
citations:
  - "https://ooni.org/post/2025-france-report/"
  - "https://censxres.fr/"
---

# OONI Study Reveals Inconsistent DNS Censorship Infrastructure Across French ISPs

**TL;DR:** OONI analysis shows France implementing widespread website blocking via DNS manipulation across ISPs, but with inconsistent enforcement that creates escalation risks toward more invasive censorship methods.

## Key Points

- OONI researchers documented extensive DNS-based website blocking across France's four major commercial ISPs in fall 2024
- Censorship targets include copyright infringement, sports streaming, gambling, pornography, Russian organizations, and cybercrime sites
- Implementation is highly inconsistent between ISPs, with different providers blocking different subsets of court-ordered sites
- Blocking operates at DNS resolver level, making it easily bypassable with alternative DNS services
- French courts and administrative agencies have expanded blocking powers through multiple recent laws and court orders
- TikTok was blocked in New Caledonia during civil unrest, showing political application of censorship infrastructure
- Researchers warn that easily-bypassed current system may drive authorities toward more invasive deep packet inspection
- Study provides detailed legal framework analysis covering both judiciary and administrative censorship authorities

## Deep Dive

## Context and Legal Framework

France has systematically expanded its internet censorship capabilities over the past two decades, starting with foundational laws like LCEN (2004) and HADOPI (2009). The current system operates through both judicial orders targeting copyright infringement, illegal streaming, and pornography, and administrative blocks for terrorism, child abuse material, gambling, fraud, and cybercrime. The 2024 TikTok blocking in New Caledonia during civil unrest demonstrates how this infrastructure can be rapidly deployed for political purposes.

## Technical Implementation and Vulnerabilities

The OONI measurements reveal a DNS-based blocking system that varies significantly across ISPs. This inconsistent implementation creates a patchwork where the same court order may be enforced by some providers but not others. The technical simplicity of DNS blocking makes it easily circumventable by users switching to alternative resolvers like Cloudflare or Quad9, undermining the system's effectiveness while still creating a chilling effect.

## Escalation Risk Assessment

The researchers identify a critical dynamic: as authorities recognize the limitations of current DNS-based blocking, they may escalate to more sophisticated methods like deep packet inspection (DPI) or SNI filtering. This progression would require ISPs to implement traffic analysis capabilities that could enable broader surveillance and more effective censorship, fundamentally changing France's internet infrastructure toward a more controlled model.

## Implications for Builders

This case study illustrates how censorship infrastructure evolves incrementally, starting with easily-bypassed methods that normalize the concept of blocking before escalating to more invasive techniques. The inconsistent implementation also suggests opportunities for resistance through ISP diversity and alternative DNS services, while the legal expansion shows the importance of challenging censorship frameworks before they become entrenched.

## Sources

- https://ooni.org/post/2025-france-report/
- https://censxres.fr/
