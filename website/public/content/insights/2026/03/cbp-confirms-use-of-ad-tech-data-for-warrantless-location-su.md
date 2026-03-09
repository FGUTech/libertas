---
title: "CBP Confirms Use of Ad Tech Data for Warrantless Location Surveillance"
slug: "cbp-confirms-use-of-ad-tech-data-for-warrantless-location-su"
published_at: "2026-03-09T22:00:53.699Z"
status: "published"
topics:
  - "surveillance"
  - "privacy"
  - "activism"
freedom_relevance_score: 85
credibility_score: 95
geo:
  - "United States"
citations:
  - "https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp"
---

# CBP Confirms Use of Ad Tech Data for Warrantless Location Surveillance

**TL;DR:** CBP admits it uses location data from online advertising systems (RTB) to track phones without warrants, confirming the advertising surveillance infrastructure enables government spying.

## Key Points

- CBP document confirms use of real-time bidding (RTB) location data for surveillance operations
- Government agencies (CBP, ICE, FBI) purchase location data from brokers like Venntel to bypass warrant requirements
- RTB system exposes user location data to thousands of companies during ad auction process
- ICE uses tools like Webloc to track millions of phones and filter by advertising IDs
- Location data harvested from apps via SDKs and RTB without user knowledge
- Federal agencies continue purchasing commercial location data despite privacy concerns
- Document covers 2019-2021 pilot but agencies have expanded surveillance tool purchases since
- Advertising ecosystem creates pathway for warrantless government location tracking

## Deep Dive

## Context and Background

This revelation represents the first direct government acknowledgment that federal agencies are tapping into the real-time bidding (RTB) advertising infrastructure for surveillance. While privacy advocates have long suspected this connection, CBP's internal document provides concrete evidence that the same systems powering targeted ads are being weaponized for warrantless government tracking. The document details a 2019-2021 pilot program, but reporting indicates these practices have expanded significantly since then.

## Technical Breakdown

The RTB system creates a massive privacy vulnerability. When users visit websites or apps, ad tech companies instantly package their data—including precise location information—into "bid requests" broadcast to thousands of potential advertisers within milliseconds. This process exposes location data to a vast network of companies, creating multiple access points for government agencies to purchase the same data they would normally need a warrant to obtain. Data brokers can collect this information either directly through software development kits (SDKs) embedded in apps, or indirectly through the RTB ecosystem without any relationship to the original app or website.

## Threat Model Implications

This surveillance method fundamentally undermines Fourth Amendment protections by allowing agencies to purchase what they cannot legally obtain through traditional means. The scale is unprecedented—tools like Webloc can track "hundreds of millions of phones every day" and filter by advertising IDs, enabling mass surveillance of entire geographic areas over time. For activists, journalists, and vulnerable populations, this creates a persistent tracking threat that operates independently of traditional surveillance methods and is extremely difficult to detect or counter.

## What Builders Should Consider

This confirms that privacy-preserving alternatives to the current advertising model are critical infrastructure for digital rights. The RTB system's fundamental architecture—broadcasting user data to thousands of parties—makes it inherently incompatible with privacy. Builders should prioritize developing advertising alternatives that don't rely on behavioral tracking, implement strong location privacy protections, and design systems that cannot be easily co-opted for surveillance purposes.

## Sources

- https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
