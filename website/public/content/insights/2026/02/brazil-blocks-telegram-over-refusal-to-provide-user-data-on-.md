---
title: "Brazil Blocks Telegram Over Refusal to Provide User Data on Far-Right Groups"
slug: "brazil-blocks-telegram-over-refusal-to-provide-user-data-on-"
published_at: "2026-02-20T04:44:28.768Z"
status: "published"
topics:
  - "censorship-resistance"
  - "comms"
  - "privacy"
  - "surveillance"
freedom_relevance_score: 85
credibility_score: 90
geo:
  - "Brazil"
citations:
  - "https://netblocks.org/reports/telegram-restricted-in-brazil-after-refusal-to-supply-user-data-to-authorities-JBZxOr86"
---

# Brazil Blocks Telegram Over Refusal to Provide User Data on Far-Right Groups

**TL;DR:** Brazil restricted Telegram on major ISPs after the messaging platform refused court orders to provide user data from alleged far-right groups planning school attacks.

## Key Points

- NetBlocks confirmed Telegram restriction on major Brazilian ISPs Claro and Vivo as of April 27, 2023
- Court ordered suspension after Telegram failed to provide complete user data from two group chats allegedly planning school attacks
- Federal Police requested data as part of investigations into far-right and neo-Nazi online activity
- Service remains accessible on smaller networks and via VPN circumvention
- Brazil has history of Telegram restrictions (2015, 2016) despite generally open internet policy
- Block affects Telegram frontends and backends on networks AS28573 and AS18881
- NetBlocks opposes messaging restrictions due to disproportionate impact on public communication rights

## Deep Dive

## Context and Background

This incident represents a significant escalation in Brazil's approach to platform compliance, targeting one of the world's most privacy-focused mainstream messaging services. Brazil has historically maintained relatively open internet policies compared to regional neighbors, making this restriction particularly noteworthy. The targeting of Telegram specifically over user data requests signals growing government pressure on privacy-preserving communication platforms globally.

## Technical Implementation

The restriction targets both Telegram's frontend interfaces and backend infrastructure across major carrier networks, suggesting a comprehensive blocking approach rather than surface-level DNS filtering. The selective implementation across ISPs (major carriers complying while smaller networks maintain access) indicates court orders directed at specific network operators rather than blanket technical measures. This implementation pattern makes VPN circumvention highly effective, as confirmed by NetBlocks.

## Threat Model Implications

The incident highlights the vulnerability of centralized messaging platforms to government pressure, even those with strong privacy reputations. Brazil's ability to achieve partial compliance through carrier-level restrictions demonstrates how legal frameworks can circumvent technical privacy protections. The focus on "far-right groups" provides legal justification that could expand to other political categories, following patterns seen in other jurisdictions where initial restrictions later broaden in scope.

## What Builders Should Consider

This case reinforces the importance of decentralized communication infrastructure that doesn't rely on single points of failure or centralized compliance decisions. The effectiveness of VPN circumvention suggests network-level restrictions remain technically limited, but builders should anticipate more sophisticated blocking techniques. The precedent of targeting messaging platforms over group chat data could influence platform policies globally, potentially affecting feature development and data retention practices.

## Sources

- https://netblocks.org/reports/telegram-restricted-in-brazil-after-refusal-to-supply-user-data-to-authorities-JBZxOr86
