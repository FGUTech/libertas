---
title: "Tails 7.4 Adds Persistent Language Settings, Updates Core Privacy Tools"
slug: "tails-7-4-adds-persistent-language-settings-updates-core-pri"
published_at: "2026-01-22T11:03:28.464Z"
status: "published"
topics:
  - "privacy"
  - "censorship-resistance"
  - "surveillance"
  - "comms"
freedom_relevance_score: 85
credibility_score: 95
citations:
  - "https://tails.net/news/version_7.4/"
---

# Tails 7.4 Adds Persistent Language Settings, Updates Core Privacy Tools

**TL;DR:** Tails 7.4 introduces persistent language/keyboard settings for easier access while updating Tor Browser to 15.0.4 and dropping BitTorrent downloads due to security concerns.

## Key Points

- New persistent language and keyboard layout feature saves settings unencrypted on USB for easier passphrase entry
- Tor Browser updated to version 15.0.4 with latest security improvements
- Thunderbird email client updated to 140.6.0 for secure communications
- Linux kernel upgraded to 6.12.63 for improved hardware support and security
- BitTorrent download support dropped due to security concerns with v1 format transition
- Fixed GPG file handling in Kleopatra and VeraCrypt desktop crashes
- Automatic upgrades available from Tails 7.0+ to maintain persistent storage

## Deep Dive

## Context and Significance

Tails 7.4 represents a significant usability improvement for one of the most critical privacy operating systems used by activists, journalists, and dissidents globally. The addition of persistent language and keyboard settings addresses a long-standing friction point where users had to reconfigure their input methods on every boot, potentially creating barriers to quick system access during high-risk situations.

## Technical Trade-offs

The decision to store language and keyboard settings unencrypted on the USB stick represents a calculated security trade-off. While this creates a minor metadata leak about the user's likely geographic location or language preference, the Tails team has determined that the operational security benefit of easier passphrase entry outweighs this risk. Users concerned about this metadata exposure can still manually configure settings on each boot.

## Infrastructure Evolution

The removal of BitTorrent v1 support signals broader ecosystem changes as the protocol transitions to v2. This decision reflects the Tails team's resource constraints and pragmatic security approach - maintaining legacy download methods that could become attack vectors isn't worth the maintenance burden when direct downloads are typically faster and more reliable.

## Implications for Builders

The persistent settings feature demonstrates how privacy-focused projects must balance security purity with real-world usability. The fixes for VeraCrypt integration and GPG file handling show ongoing work to maintain compatibility with the broader privacy tool ecosystem that Tails users depend on.

## Sources

- https://tails.net/news/version_7.4/
