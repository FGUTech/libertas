---
title: "CBP Admits Using Online Ad Systems for Warrantless Location Tracking"
slug: "cbp-admits-using-online-ad-systems-for-warrantless-location-"
published_at: "2026-03-05T17:01:19.349Z"
status: "published"
topics:
  - "surveillance"
  - "privacy"
  - "identity"
freedom_relevance_score: 85
credibility_score: 95
geo:
  - "United States"
citations:
  - "https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp"
---

# CBP Admits Using Online Ad Systems for Warrantless Location Tracking

**TL;DR:** Customs and Border Protection confirmed using real-time bidding (RTB) ad data to track phone locations without warrants, exposing how advertising surveillance enables government surveillance.

## Key Points

- CBP document confirms agency used location data from real-time bidding (RTB) advertising systems for surveillance
- RTB broadcasts user location data to thousands of companies during millisecond ad auctions on websites and apps
- Federal agencies (CBP, ICE, FBI) have purchased location data from brokers like Venntell to identify and arrest immigrants
- ICE recently bought Webloc tool that tracks millions of phones and can filter by unique advertising IDs
- Data collection happens through app SDKs and RTB systems, often without app developers' knowledge
- Government bypasses warrant requirements by purchasing commercially available surveillance data
- Document covers 2019-2021 pilot but agencies continue purchasing location tracking tools
- EFF calls this direct evidence that targeted advertising infrastructure doubles as state surveillance system

## Deep Dive

## Context and Background

This EFF report provides the first direct government acknowledgment that federal agencies are tapping into the real-time bidding (RTB) advertising ecosystem for surveillance. While privacy advocates have long warned about this threat, CBP's internal document represents concrete evidence that the advertising surveillance apparatus is being weaponized by law enforcement. The document covers a 2019-2021 pilot program, but reporting indicates these practices have continued and expanded across multiple agencies.

## Technical Breakdown

RTB creates a massive data exposure surface. When you visit any website or app with ads, your location and other personal data gets packaged into "bid requests" broadcast to thousands of potential advertisers within milliseconds. This happens through two primary vectors: SDKs that developers embed in apps (often for legitimate features like weather or navigation), and the RTB system itself which operates largely invisibly. Data brokers can collect from both sources—either paying developers directly for SDK access or simply participating in RTB auctions to harvest exposed data.

## Threat Model Implications

This revelation fundamentally changes the threat model for anyone concerned about government surveillance. Simply using apps with location permissions or visiting ad-supported websites potentially feeds government tracking databases. The scale is massive—tools like Webloc can track "hundreds of millions of phones every day" and filter by specific geographic areas over time. Most concerning, this bypasses traditional warrant requirements since agencies claim they're simply purchasing "commercially available" data.

## What Builders Should Consider

This underscores the critical need for privacy-preserving alternatives to the surveillance-based advertising model. Builders should prioritize ad-free models, implement strong data minimization practices, and consider how their apps might inadvertently feed government surveillance through third-party SDKs. The technical architecture of RTB makes it nearly impossible to prevent data leakage once you're in the ecosystem—the only real solution is to avoid it entirely or build alternative funding models that don't rely on behavioral tracking.

## Sources

- https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
