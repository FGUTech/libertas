---
title: "Hack-for-Hire Group Targets Egyptian Journalists with Spear-Phishing Campaign"
slug: "hack-for-hire-group-targets-egyptian-journalists-with-spear-"
published_at: "2026-04-08T09:02:24.854Z"
status: "published"
topics:
  - "surveillance"
  - "activism"
  - "privacy"
  - "censorship-resistance"
freedom_relevance_score: 88
credibility_score: 92
geo:
  - "Egypt"
  - "Lebanon"
  - "Canada"
  - "MENA"
citations:
  - "https://www.accessnow.org/mena-phishing-2026/?pk_campaign=feed&#038;pk_kwd=mena-phishing-2026"
---

# Hack-for-Hire Group Targets Egyptian Journalists with Spear-Phishing Campaign

**TL;DR:** Access Now investigation reveals sophisticated spear-phishing attacks targeting Egyptian journalists and government critics, using fake Signal pages and Apple impersonation to deliver Android spyware.

## Key Points

- Access Now documented hack-for-hire campaign targeting Egyptian journalists Mostafa Al-A'sar and Ahmed Eltantawy (2023-2024)
- Attackers used spear-phishing with fake Signal pages and Apple service impersonation to steal credentials
- Infrastructure designed to deliver Android spyware capable of accessing files, contacts, messages, location, and device cameras/mics
- Lookout independently assesses threat actor as hack-for-hire group with ties to Asia
- Both targets are prominent Egyptian government critics; Eltantawy previously targeted with Intellexa Predator spyware
- Similar attack successfully compromised Lebanese journalist's Apple account in 2025 (documented by SMEX)
- Attacks failed against primary targets but demonstrate persistent threat infrastructure
- Technical indicators include overlapping domains, hosting, and code similarities across campaigns

## Deep Dive

## Context and Attribution

This investigation reveals a sophisticated multi-year campaign against Egyptian dissidents that combines traditional spear-phishing with modern surveillance infrastructure. The targeting of Al-A'sar (imprisoned journalist now in Canadian exile) and Eltantawy (presidential candidate whose supporters were arrested) fits Egypt's documented pattern of digital persecution. While Lookout attributes the attacks to an Asia-linked hack-for-hire group, the technical finding of authentication attempts from Egypt and the victims' profiles strongly suggest Egyptian government involvement, potentially providing plausible deniability through outsourced operations.

## Technical Infrastructure and Capabilities

The attackers maintained persistent infrastructure with overlapping domains and hosting, indicating sustained investment rather than opportunistic attacks. Their Android spyware payload demonstrates comprehensive surveillance capabilities including file exfiltration, contact harvesting, message interception, geolocation tracking, and remote activation of cameras and microphones. The impersonation of Signal specifically targets security-conscious users, while fake Apple services exploit the trust relationship users have with critical infrastructure providers.

## Implications for Freedom Tech

This campaign highlights the evolution of state-sponsored surveillance from expensive targeted spyware (like the documented Predator attacks against Eltantawy) to potentially more scalable hack-for-hire operations. The successful compromise of the Lebanese journalist's Apple account in 2025 demonstrates that these techniques are effective and expanding geographically. For builders, this underscores the critical need for better phishing-resistant authentication mechanisms and user education around social engineering tactics that specifically target activists and journalists.

## Threat Model Considerations

The combination of sophisticated technical infrastructure with patient social engineering represents a significant escalation in threats facing civil society. The attackers' willingness to invest in fake personas and multi-channel approaches suggests traditional security awareness training may be insufficient. The targeting of cloud account credentials (Apple, Google) rather than just device compromise indicates adversaries understand that modern digital lives center around these ecosystem accounts, making them high-value targets for comprehensive surveillance.

## Sources

- https://www.accessnow.org/mena-phishing-2026/?pk_campaign=feed&#038;pk_kwd=mena-phishing-2026
