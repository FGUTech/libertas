---
title: "New Proposal Claims Bitcoin Can Be Quantum-Safe Without Protocol Changes"
slug: "new-proposal-claims-bitcoin-can-be-quantum-safe-without-prot"
published_at: "2026-04-09T21:01:26.267Z"
status: "published"
topics:
  - "bitcoin"
  - "privacy"
  - "sovereignty"
freedom_relevance_score: 72
credibility_score: 85
citations:
  - "https://bitcoinmagazine.com/news/bitcoin-could-be-quantum-safe"
---

# New Proposal Claims Bitcoin Can Be Quantum-Safe Without Protocol Changes

**TL;DR:** Researcher proposes Quantum Safe Bitcoin (QSB) scheme that uses hash-based security instead of elliptic curves to protect against quantum computer attacks without requiring Bitcoin soft forks.

## Key Points

- Avihu Levy of StarkWare published 'Quantum-Safe Bitcoin Transactions Without Softforks' proposal on April 9
- QSB scheme replaces ECDSA elliptic curve reliance with hash-based security assumptions
- Addresses vulnerability where quantum computers running Shor's algorithm could break secp256k1 signatures
- Uses 'hash-to-signature' puzzle requiring ~70.4 trillion attempts on average to solve
- Maintains resistance to quantum attacks with estimated 118-bit second pre-image resistance
- Works within existing Bitcoin scripting limits without consensus changes
- Transactions cost $75-150 in cloud GPU compute but exceed standard relay limits
- Requires direct miner submission via services like Slipstream due to size constraints
- Project incomplete - transaction assembly and on-chain broadcast not yet demonstrated

## Sources

- https://bitcoinmagazine.com/news/bitcoin-could-be-quantum-safe
