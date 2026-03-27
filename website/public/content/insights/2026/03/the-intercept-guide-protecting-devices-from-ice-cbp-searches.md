---
title: "The Intercept Guide: Protecting Devices from ICE/CBP Searches at US Airports"
slug: "the-intercept-guide-protecting-devices-from-ice-cbp-searches"
published_at: "2026-03-27T10:06:20.742Z"
status: "published"
topics:
  - "censorship-resistance"
  - "surveillance"
  - "activism"
  - "privacy"
freedom_relevance_score: 85
credibility_score: 88
geo:
  - "United States"
  - "Texas"
  - "Virginia"
  - "Florida"
citations:
  - "https://theintercept.com/2026/03/25/ice-airports-phone-security-privacy-safety/"
  - "https://theintercept.com/2026/03/26/pentagon-reporters-first-amendment/"
---

# The Intercept Guide: Protecting Devices from ICE/CBP Searches at US Airports

**TL;DR:** Comprehensive security guide for protecting digital devices from Immigration and Customs Enforcement and border agents at US airports, covering throwaway devices, encryption, and operational security practices.

## Key Points

- ICE agents now deployed to dozens of US airports with expanded device search authority
- CBP can examine traveler devices without warrant, recent cases include Norwegian tourist denied entry over phone content
- Best practice: Use throwaway travel devices with clean accounts instead of personal devices
- Disable biometrics, use strong alphanumeric passcodes, power devices completely off at checkpoints
- Enable password manager travel modes and delete sensitive apps/contacts before travel
- Travelers can refuse to unlock devices but face delays, harassment, and indefinite confiscation
- Use tools like Cryptomator to encrypt sensitive files in cloud storage, delete local copies
- Defense-in-depth approach assumes device compromise and minimizes stored sensitive data

## Deep Dive

## Escalating Airport Surveillance Context

The deployment of ICE agents to airports represents a significant expansion of surveillance infrastructure beyond traditional border crossings. The case of the Norwegian tourist denied entry allegedly over a meme demonstrates how subjective content interpretation by agents can have severe consequences. This enforcement pattern indicates a systematic approach to digital surveillance that extends far beyond traditional customs enforcement.

## Technical Implementation Strategy

The guide recommends a layered technical approach: hardware separation (throwaway devices), account isolation (fresh app store accounts), cryptographic protection (device encryption and tools like Cryptomator), and operational security (disabling biometrics, powering off devices). This represents solid threat modeling against state-level device forensics capabilities while remaining accessible to non-technical users.

## Threat Model Analysis

The legal framework gives CBP broad authority to examine devices without warrants, creating a surveillance chokepoint at critical infrastructure. The "defense in depth" model acknowledges that device encryption may be bypassed through various means - from legal compulsion to unlock devices to advanced forensic techniques. The recommendation for complete device shutdown is particularly important as it forces full encryption key derivation on next boot.

## Implications for Freedom Tech

This guidance reflects the reality that traditional digital rights protections break down at borders and enforcement checkpoints. The emphasis on throwaway hardware and account segregation suggests that privacy-preserving technologies need to be designed around the assumption of periodic device compromise. For activists and journalists, this represents a critical operational security framework that could be adapted for other high-risk scenarios.

## Sources

- https://theintercept.com/2026/03/25/ice-airports-phone-security-privacy-safety/
- https://theintercept.com/2026/03/26/pentagon-reporters-first-amendment/
