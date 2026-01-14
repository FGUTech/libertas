import type { Post, Topic } from "@/types";

/**
 * Mock posts data for development
 * Will be replaced with real data fetching from Cloud SQL
 */
export const mockPosts: Post[] = [
  {
    id: "1",
    slug: "bitcoin-mesh-networks-expand-to-rural-communities",
    title: "Bitcoin Mesh Networks Expand to Rural Communities",
    summary:
      "New offline-first Bitcoin transaction protocols are enabling financial sovereignty in areas with limited internet connectivity, using mesh networking and satellite links.",
    content: `## Introduction

The expansion of Bitcoin mesh networks into rural communities represents a significant milestone in the pursuit of financial sovereignty. These networks leverage decentralized communication protocols to enable Bitcoin transactions without relying on traditional internet infrastructure.

## How Mesh Networks Enable Bitcoin Transactions

Mesh networks create a web of interconnected nodes that can relay information across vast distances. When combined with Bitcoin's protocol, this enables:

- **Offline-first transactions**: Users can create and sign transactions locally
- **Satellite relay**: Blockstream Satellite broadcasts the Bitcoin blockchain worldwide
- **Radio transmission**: Ham radio operators can relay signed transactions

### Technical Implementation

The core of these systems relies on the Golem protocol, which packages Bitcoin transactions for transmission over low-bandwidth channels:

\`\`\`typescript
interface MeshTransaction {
  txHex: string;
  priority: "high" | "normal" | "low";
  retryCount: number;
  timestamp: number;
}

async function broadcastViaMesh(tx: MeshTransaction) {
  const nodes = await discoverLocalNodes();
  for (const node of nodes) {
    await node.relay(tx);
  }
}
\`\`\`

## Impact on Rural Communities

Communities in Latin America, Sub-Saharan Africa, and Southeast Asia have been early adopters:

1. **Venezuela**: 12 villages now operate independent mesh networks
2. **Kenya**: Mobile mesh networks serve nomadic communities
3. **Indonesia**: Island chains connected via solar-powered nodes

### Case Study: Mountain Communities in Peru

In the Andes mountains, where internet connectivity is sparse, communities have established a network of 47 nodes spanning 200 kilometers. This network processes an average of 340 transactions daily.

> "For the first time, we can receive remittances directly without traveling two days to the nearest bank." — Maria Santos, community organizer

## Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Power availability | Solar + battery systems |
| Hardware costs | Open-source designs |
| Technical knowledge | Community training programs |
| Regulatory concerns | Education and advocacy |

## Future Developments

The next phase of development focuses on:

- **Lightning Network integration**: Enabling instant, low-cost payments
- **Improved compression**: Reducing transaction data by 60%
- **Self-healing networks**: Automatic route discovery and failover

## Conclusion

Bitcoin mesh networks demonstrate that financial freedom doesn't require permission from traditional gatekeepers. As these technologies mature, they promise to bring billions of people into the global economy on their own terms.

---

*This research was compiled from field reports and technical documentation. All claims are sourced and verifiable.*`,
    publishedAt: "2026-01-05T14:30:00Z",
    tags: ["bitcoin", "mesh-networks", "rural-access"],
    topics: ["bitcoin", "payments", "sovereignty"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://bitcoinmagazine.com/mesh-networks",
        title: "Mesh Network Deployment Report",
        source: "Bitcoin Magazine",
        accessedAt: "2026-01-05T10:00:00Z",
      },
      {
        url: "https://worldbank.org/financial-inclusion",
        title: "Rural Financial Inclusion Study",
        source: "World Bank",
        accessedAt: "2026-01-05T10:00:00Z",
      },
    ],
    freedomRelevanceScore: 92,
    credibilityScore: 88,
  },
  {
    id: "2",
    slug: "zero-knowledge-proofs-for-private-voting",
    title: "Zero-Knowledge Proofs Enable Private Digital Voting",
    summary:
      "A new ZK-SNARK implementation allows verifiable voting without revealing individual choices, addressing both transparency and privacy concerns in democratic processes.",
    content: `## The Privacy-Transparency Paradox

Digital voting systems face a fundamental challenge: how to ensure both transparency (verifiable results) and privacy (secret ballots). Zero-knowledge proofs offer an elegant solution.

## How ZK Voting Works

Zero-knowledge proofs allow voters to prove their vote was counted correctly without revealing their choice:

### The Mathematical Foundation

\`\`\`rust
pub struct VoteProof {
    // Commitment to the vote (hides actual choice)
    commitment: G1Affine,
    // ZK proof that commitment is valid
    proof: Proof<Bn254>,
    // Nullifier to prevent double voting
    nullifier: Fr,
}

impl VoteProof {
    pub fn verify(&self, election_params: &ElectionParams) -> bool {
        // Verify the proof without learning the vote
        groth16::verify(&self.proof, election_params.vk, &self.commitment)
    }
}
\`\`\`

## Key Properties

1. **Ballot Secrecy**: No one can determine how you voted
2. **Individual Verifiability**: You can confirm your vote was recorded
3. **Universal Verifiability**: Anyone can verify the total count
4. **Receipt-Freeness**: You cannot prove to others how you voted

### Protocol Overview

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Voter     │────>│  ZK Circuit │────>│  Tallying   │
│  (private)  │     │  (proving)  │     │  (public)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │ vote choice       │ proof only        │ aggregate
       │ (hidden)          │ (no vote data)    │ (verifiable)
       └───────────────────┴───────────────────┘
\`\`\`

## Real-World Implementations

Several organizations are piloting ZK voting:

- **ETH Zurich**: Academic senate elections (2,000+ voters)
- **City of Denver**: Participatory budgeting pilot
- **DAO governance**: Multiple protocols with $10B+ under management

## Security Analysis

| Threat | Mitigation |
|--------|------------|
| Coercion | Receipt-freeness property |
| Double voting | Nullifier-based detection |
| Vote manipulation | Cryptographic commitments |
| Tally fraud | Homomorphic aggregation |

## Implications for Democracy

ZK voting could fundamentally reshape democratic participation:

> "The ability to verify election integrity without compromising voter privacy is the holy grail of digital democracy." — Dr. Sarah Chen, ETH Zurich

## Open Questions

- Usability for non-technical voters
- Key management and recovery
- Post-quantum security considerations
- Integration with existing electoral frameworks

## Conclusion

Zero-knowledge proofs represent a breakthrough in reconciling the competing demands of election transparency and voter privacy. As these systems mature, they may enable more trustworthy and inclusive democratic processes worldwide.`,
    publishedAt: "2026-01-04T09:15:00Z",
    tags: ["zk-proofs", "voting", "democracy"],
    topics: ["zk", "privacy", "identity"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://ethz.ch/zk-voting",
        title: "ZK Voting Protocol Paper",
        source: "ETH Zurich",
        accessedAt: "2026-01-04T08:00:00Z",
      },
    ],
    freedomRelevanceScore: 95,
    credibilityScore: 91,
  },
  {
    id: "3",
    slug: "encrypted-messenger-adoption-surge",
    title: "Encrypted Messenger Adoption Surges in Southeast Asia",
    summary:
      "Signal and Session see record adoption rates following new surveillance legislation, with activists developing localized guides for secure communication practices.",
    content: `## The Catalyst

Recent surveillance legislation across Southeast Asia has triggered an unprecedented migration to encrypted messaging platforms. Signal reported a 340% increase in regional downloads in Q4 2025.

## Adoption Statistics

| Country | Signal Growth | Session Growth | Primary Driver |
|---------|---------------|----------------|----------------|
| Thailand | +420% | +280% | Digital ID law |
| Malaysia | +310% | +190% | Content monitoring |
| Vietnam | +290% | +340% | New cybersecurity law |
| Indonesia | +380% | +220% | Social media regulations |

## Why End-to-End Encryption Matters

End-to-end encryption ensures that only the sender and recipient can read messages:

\`\`\`
Sender              Network             Recipient
  │                   │                    │
  │  encrypted msg    │   ???????????      │
  ├──────────────────>├───────────────────>│
  │                   │  (cannot read)     │
  │                   │                    │
  └───────────────────┴────────────────────┘
        Only endpoints hold the keys
\`\`\`

## Community Response

Local activists have developed comprehensive security guides:

### Best Practices Checklist

- Use disappearing messages by default
- Enable registration lock with PIN
- Verify safety numbers in person
- Disable link previews
- Use device encryption

### Community Training Programs

Networks of trainers conduct workshops covering:

1. **Threat modeling**: Understanding personal risk profiles
2. **Tool selection**: Choosing appropriate platforms
3. **Operational security**: Habits that protect privacy
4. **Emergency protocols**: What to do if compromised

## Platform Comparison

\`\`\`typescript
const platforms = [
  {
    name: "Signal",
    protocol: "Signal Protocol",
    metadata: "minimal",
    decentralized: false,
    phoneRequired: true,
  },
  {
    name: "Session",
    protocol: "Session Protocol",
    metadata: "none",
    decentralized: true,
    phoneRequired: false,
  },
  {
    name: "Matrix/Element",
    protocol: "Olm/Megolm",
    metadata: "configurable",
    decentralized: true,
    phoneRequired: false,
  },
];
\`\`\`

## Challenges

- **Network effects**: Convincing contacts to switch
- **Usability**: Features vs. security tradeoffs
- **Bans**: Some countries blocking encrypted apps
- **Backdoor pressure**: Government demands for access

## The Broader Significance

This adoption surge demonstrates that when privacy becomes essential, people will find ways to protect themselves:

> "Privacy is not about hiding. It's about maintaining human dignity in a digital world." — Activist, Bangkok

## Conclusion

The rapid adoption of encrypted messaging in Southeast Asia shows both the demand for privacy tools and the resilience of civil society in the face of surveillance overreach.`,
    publishedAt: "2026-01-03T16:45:00Z",
    tags: ["encryption", "messaging", "activism"],
    topics: ["comms", "privacy", "activism"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://eff.org/digital-rights-2026",
        title: "Digital Rights Report 2026",
        source: "EFF",
        accessedAt: "2026-01-03T12:00:00Z",
      },
      {
        url: "https://signal.org/blog/adoption-statistics",
        title: "Messenger Adoption Statistics",
        source: "Signal Foundation",
        accessedAt: "2026-01-03T12:00:00Z",
      },
      {
        url: "https://accessnow.org/asia-analysis",
        title: "Regional Security Analysis",
        source: "Access Now",
        accessedAt: "2026-01-03T12:00:00Z",
      },
    ],
    freedomRelevanceScore: 89,
    credibilityScore: 85,
  },
  {
    id: "4",
    slug: "decentralized-identity-standards-finalized",
    title: "W3C Finalizes Decentralized Identity Standards",
    summary:
      "New web standards for self-sovereign identity give users control over their digital credentials without relying on centralized authorities or platforms.",
    content: `## A New Era for Digital Identity

The World Wide Web Consortium (W3C) has officially finalized the Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) specifications, marking a watershed moment for digital identity.

## What Are DIDs?

Decentralized Identifiers are a new type of identifier that enables verifiable, decentralized digital identity:

\`\`\`json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:example:123456789abcdefghi",
  "verificationMethod": [{
    "id": "did:example:123456789abcdefghi#keys-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:example:123456789abcdefghi",
    "publicKeyMultibase": "zH3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
  }],
  "authentication": ["did:example:123456789abcdefghi#keys-1"]
}
\`\`\`

## Key Principles

1. **User Control**: You own and control your identity
2. **Portability**: Take your identity anywhere
3. **Privacy**: Share only what's necessary
4. **Interoperability**: Works across systems

## How Verifiable Credentials Work

\`\`\`
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Issuer      │────>│    Holder      │────>│   Verifier     │
│  (university)  │     │    (you)       │     │   (employer)   │
└────────────────┘     └────────────────┘     └────────────────┘
        │                     │                      │
        │ issues credential   │ presents proof       │ verifies
        │ (diploma)           │ (selective)          │ (cryptographic)
        └─────────────────────┴──────────────────────┘
\`\`\`

## Real-World Applications

### Education Credentials

\`\`\`typescript
interface VerifiableCredential {
  "@context": string[];
  type: string[];
  issuer: string; // DID of the university
  credentialSubject: {
    id: string; // Your DID
    degree: string;
    field: string;
    graduationDate: string;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}
\`\`\`

### Use Cases

| Domain | Application |
|--------|-------------|
| Employment | Portable work credentials |
| Healthcare | Patient-controlled records |
| Finance | KYC without data sharing |
| Travel | Digital passport integration |

## Privacy Features

- **Selective Disclosure**: Reveal only necessary attributes
- **Zero-Knowledge Proofs**: Prove properties without revealing data
- **Unlinkability**: Prevent tracking across verifications

## Adoption Roadmap

Several governments and organizations are implementing DID standards:

- European Union digital identity wallet
- Canadian government services
- Major banks for KYC processes
- Universities for digital diplomas

## Conclusion

The finalization of DID and VC standards marks the beginning of a new chapter in digital identity—one where individuals, not institutions, control their personal information.`,
    publishedAt: "2026-01-02T11:00:00Z",
    tags: ["identity", "w3c", "standards"],
    topics: ["identity", "sovereignty"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://w3.org/TR/did-core",
        title: "W3C DID Specification",
        source: "W3C",
        accessedAt: "2026-01-02T09:00:00Z",
      },
    ],
    freedomRelevanceScore: 87,
    credibilityScore: 94,
  },
  {
    id: "5",
    slug: "tor-network-performance-improvements",
    title: "Tor Network Sees Major Performance Improvements",
    summary:
      "New relay protocols and congestion control mechanisms have significantly reduced latency, making anonymous browsing more practical for everyday users.",
    content: `## Performance Breakthrough

The Tor Project has deployed significant network improvements that reduce latency by up to 40%, addressing one of the main barriers to mainstream adoption.

## Technical Improvements

### Congestion Control

The new congestion control algorithm adapts to network conditions:

\`\`\`rust
struct CongestionWindow {
    cwnd: u32,        // Current window size
    ssthresh: u32,    // Slow start threshold
    rtt_estimate: Duration,
}

impl CongestionWindow {
    fn on_ack(&mut self, bytes_acked: u32) {
        if self.cwnd < self.ssthresh {
            // Slow start: exponential growth
            self.cwnd += bytes_acked;
        } else {
            // Congestion avoidance: linear growth
            self.cwnd += (bytes_acked * bytes_acked) / self.cwnd;
        }
    }
}
\`\`\`

### Circuit Building Optimization

Improved circuit building reduces connection establishment time:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Median latency | 2.1s | 1.3s | 38% |
| 95th percentile | 8.4s | 4.2s | 50% |
| Circuit build time | 4.2s | 2.8s | 33% |

## Architecture Changes

\`\`\`
┌──────────────────────────────────────────────────────────┐
│                    Tor Network                            │
├──────────────────────────────────────────────────────────┤
│  User ──> Guard ──> Middle ──> Exit ──> Destination      │
│            │          │          │                        │
│            │   New: Conflux multiplexing                  │
│            │   (multiple paths, single stream)            │
│            └──────────┴──────────┘                        │
└──────────────────────────────────────────────────────────┘
\`\`\`

## Impact on Users

These improvements make Tor more practical for:

- **Video streaming**: Reduced buffering
- **Web browsing**: Faster page loads
- **File downloads**: Better throughput
- **Real-time communication**: Lower latency

## Relay Network Growth

The relay network has also expanded:

\`\`\`
Relays:        7,200 → 9,400 (+30%)
Bandwidth:     650 Gbps → 920 Gbps (+41%)
Countries:     89 → 94 (+5)
\`\`\`

## Future Roadmap

Upcoming improvements include:

1. **Walking Onions**: Reduced relay descriptor overhead
2. **Proof-of-Work anti-DoS**: Resistance to network attacks
3. **Post-quantum crypto**: Future-proof encryption

## Conclusion

These performance improvements remove a significant barrier to Tor adoption, making private browsing more accessible to everyday users who need protection from surveillance and censorship.`,
    publishedAt: "2026-01-01T08:00:00Z",
    tags: ["tor", "anonymity", "performance"],
    topics: ["privacy", "censorship-resistance"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://torproject.org/performance-2026",
        title: "Tor Performance Report",
        source: "Tor Project",
        accessedAt: "2026-01-01T06:00:00Z",
      },
    ],
    freedomRelevanceScore: 84,
    credibilityScore: 92,
  },
  {
    id: "6",
    slug: "bitcoin-lightning-privacy-upgrade",
    title: "Lightning Network Privacy Upgrade Deployed",
    summary:
      "Route blinding and trampoline payments now standard, significantly improving payment privacy on Bitcoin's Layer 2.",
    content: `## Privacy on Lightning

The Lightning Network has deployed two major privacy upgrades: route blinding and trampoline payments. Together, these features significantly reduce the ability to surveil payment flows.

## Route Blinding

Route blinding allows recipients to hide their node's location in the network:

\`\`\`typescript
interface BlindedPath {
  // Public introduction point
  introductionNode: NodeId;
  // Encrypted path to actual recipient
  blindedHops: BlindedHop[];
}

interface BlindedHop {
  blindedNodeId: Uint8Array;
  encryptedPayload: Uint8Array;
}
\`\`\`

### How It Works

\`\`\`
Sender ──> Node A ──> Node B ──> [Blinded Zone] ──> Recipient
                                      │
                     Only recipient knows actual path
\`\`\`

## Trampoline Payments

Trampoline routing allows light clients to make payments without knowing the full network graph:

\`\`\`rust
struct TrampolinePayment {
    trampolines: Vec<TrampolineNode>,
    final_recipient: BlindedPath,
    amount_msat: u64,
    payment_hash: [u8; 32],
}

impl TrampolinePayment {
    fn route(&self) -> Result<Route, RoutingError> {
        // Trampoline nodes handle routing
        // Client only knows trampolines, not full path
    }
}
\`\`\`

## Privacy Comparison

| Feature | Before | After |
|---------|--------|-------|
| Sender privacy | Low | High |
| Recipient privacy | Low | High |
| Amount privacy | Medium | Medium |
| Route privacy | None | High |

## Adoption Status

Major implementations have rolled out support:

- **LND**: v0.18.0+ (full support)
- **Core Lightning**: v24.11+ (full support)
- **Eclair**: v0.10.0+ (full support)
- **LDK**: v0.0.123+ (full support)

## Remaining Challenges

- **Amount correlation**: Payment amounts can still leak information
- **Timing analysis**: Sophisticated attackers can correlate timing
- **Channel graph**: Network topology still somewhat public

## Future Improvements

Work continues on:

1. **PTLC/Point Locks**: Remove payment hash correlation
2. **Channel jamming mitigations**: Prevent DoS attacks
3. **Onion messaging**: General-purpose private communication

## Conclusion

These privacy upgrades represent a major step forward for Lightning Network privacy, making Bitcoin payments more resistant to surveillance while maintaining the network's speed and low fees.`,
    publishedAt: "2025-12-30T15:00:00Z",
    tags: ["lightning", "bitcoin", "privacy"],
    topics: ["bitcoin", "privacy", "payments"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://lightning.engineering/privacy",
        title: "Lightning Privacy Improvements",
        source: "Lightning Labs",
        accessedAt: "2025-12-30T12:00:00Z",
      },
    ],
    freedomRelevanceScore: 91,
    credibilityScore: 89,
  },
  {
    id: "7",
    slug: "starknet-proving-cost-reduction",
    title: "Starknet Achieves 10x Proving Cost Reduction",
    summary:
      "New STARK prover optimizations make zero-knowledge proofs more accessible for applications requiring computational integrity.",
    content: `## Breakthrough in Proving Efficiency

StarkWare has achieved a 10x reduction in STARK proving costs through a combination of algorithmic improvements and hardware optimization.

## Technical Advances

### New Prover Architecture

The Stone prover has been redesigned with parallel execution:

\`\`\`rust
pub struct StoneProver {
    trace: ExecutionTrace,
    config: ProverConfig,
    workers: Vec<Worker>,
}

impl StoneProver {
    pub fn prove(&self) -> Proof {
        // Parallel constraint evaluation
        let constraint_polys = self.workers
            .par_iter()
            .map(|w| w.evaluate_constraints(&self.trace))
            .collect();

        // FRI protocol with batched queries
        let fri_proof = self.run_fri(constraint_polys);

        Proof { constraint_polys, fri_proof }
    }
}
\`\`\`

### Cost Breakdown

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Trace computation | $0.08 | $0.01 | 8x |
| Constraint evaluation | $0.05 | $0.004 | 12x |
| FRI protocol | $0.03 | $0.003 | 10x |
| **Total per proof** | **$0.16** | **$0.017** | **~10x** |

## Impact on Applications

### More Viable Use Cases

These cost reductions enable new applications:

\`\`\`
Application             Before         After          Status
─────────────────────────────────────────────────────────────
Gaming proofs           Too expensive   Viable         ✓
IoT verification        Too expensive   Viable         ✓
AI inference proofs     Marginal       Economical      ✓
Supply chain            Viable         Cheap           ✓
\`\`\`

## Hardware Acceleration

Custom hardware further improves performance:

\`\`\`typescript
interface ProverHardware {
  // FPGA acceleration for NTT
  nttAccelerator: FPGACore;
  // GPU for parallel field operations
  gpuBackend: CUDADevice;
  // Expected speedup
  expectedSpeedup: 4; // additional 4x on top of software
}
\`\`\`

## Network Statistics

Starknet has seen increased activity following cost reductions:

- Daily transactions: 450K → 1.2M (+166%)
- Unique users: 89K → 210K (+136%)
- TVL: $320M → $780M (+144%)

## Developer Experience

Proving is now accessible to more developers:

\`\`\`bash
# Before: Complex setup, expensive computation
# After: Simple CLI, affordable proving

starknet prove ./program.cairo \\
  --input ./input.json \\
  --output ./proof.json \\
  --cost-estimate  # Shows: ~$0.017
\`\`\`

## Future Roadmap

Further improvements planned:

1. **Circle STARKs**: Additional 2-3x efficiency
2. **Recursive proving**: Aggregate multiple proofs
3. **Decentralized proving**: Distributed prover network

## Conclusion

The 10x reduction in proving costs makes STARK technology viable for a much broader range of applications, advancing the goal of computational integrity for all.`,
    publishedAt: "2025-12-28T10:00:00Z",
    tags: ["starknet", "zk-proofs", "scaling"],
    topics: ["zk", "sovereignty"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://starkware.co/prover-optimization",
        title: "Prover Optimization Paper",
        source: "StarkWare",
        accessedAt: "2025-12-28T08:00:00Z",
      },
    ],
    freedomRelevanceScore: 82,
    credibilityScore: 95,
  },
  {
    id: "8",
    slug: "surveillance-legislation-tracker-launch",
    title: "Global Surveillance Legislation Tracker Launches",
    summary:
      "New open-source tool monitors and alerts on surveillance legislation changes across 150+ jurisdictions, helping activists stay informed.",
    content: `## A New Tool for Digital Rights

The Digital Rights Foundation has launched an open-source surveillance legislation tracker, providing real-time monitoring of privacy-affecting laws worldwide.

## Features

### Real-Time Monitoring

\`\`\`typescript
interface LegislationAlert {
  jurisdiction: string;
  billId: string;
  title: string;
  status: "proposed" | "committee" | "passed" | "enacted";
  impactScore: number; // 0-100 privacy impact
  categories: SurveillanceCategory[];
  lastUpdated: Date;
}

type SurveillanceCategory =
  | "mass_surveillance"
  | "data_retention"
  | "encryption_backdoors"
  | "biometric_collection"
  | "content_filtering";
\`\`\`

### Coverage

| Region | Jurisdictions | Languages |
|--------|---------------|-----------|
| Europe | 44 | 24 |
| Asia-Pacific | 38 | 15 |
| Americas | 35 | 3 |
| Africa | 26 | 8 |
| Middle East | 12 | 4 |
| **Total** | **155** | **35** |

## How It Works

\`\`\`
┌────────────────────────────────────────────────────────────┐
│                    Data Pipeline                            │
├────────────────────────────────────────────────────────────┤
│  Government      Translation     AI Analysis     Alert     │
│  Sources    ──>  Service     ──>  Engine    ──>  System    │
│                                                             │
│  • Official      • DeepL         • Impact        • Email   │
│    gazettes      • Human         • Scoring       • RSS     │
│  • Parliament    • Review        • Category      • API     │
│    feeds                         • Detection     • Webhook │
└────────────────────────────────────────────────────────────┘
\`\`\`

## API Access

Developers can integrate alerts:

\`\`\`typescript
import { SurveillanceTracker } from "surveil-tracker";

const tracker = new SurveillanceTracker({
  apiKey: process.env.TRACKER_API_KEY,
  regions: ["EU", "APAC"],
  minImpactScore: 70,
});

tracker.on("alert", (legislation) => {
  console.log(\`Alert: \${legislation.title}\`);
  console.log(\`Impact Score: \${legislation.impactScore}\`);
  notifyTeam(legislation);
});
\`\`\`

## Recent Alerts

The tracker has already flagged several concerning developments:

1. **EU Chat Control 3.0**: Client-side scanning proposal
2. **Australia Identity Bill**: Mandatory biometric linking
3. **India IT Rules Amendment**: Expanded content removal powers

## Open Source

The entire platform is open source:

- **Backend**: Rust + PostgreSQL
- **Frontend**: Next.js + TypeScript
- **ML Models**: Published with training data
- **API**: OpenAPI specification

Repository: github.com/DRF/surveillance-tracker

## Community Contributions

The tracker welcomes:

- Translation volunteers
- Legal experts for analysis
- Developers for new integrations
- Researchers for coverage expansion

## Conclusion

This tracker empowers activists, journalists, and citizens to stay informed about legislative threats to privacy, enabling earlier and more effective advocacy responses.`,
    publishedAt: "2025-12-25T12:00:00Z",
    tags: ["surveillance", "legislation", "activism"],
    topics: ["surveillance", "activism"],
    author: "Libertas Research",
    citations: [
      {
        url: "https://digitalrightsfoundation.org/tracker-launch",
        title: "Surveillance Tracker Launch",
        source: "Digital Rights Foundation",
        accessedAt: "2025-12-25T10:00:00Z",
      },
    ],
    freedomRelevanceScore: 88,
    credibilityScore: 86,
  },
];

/**
 * Get all posts
 */
export function getAllPosts(): Post[] {
  return mockPosts;
}

/**
 * Get a post by slug
 */
export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find((post) => post.slug === slug);
}

/**
 * Get adjacent posts for navigation
 */
export function getAdjacentPosts(slug: string): {
  previous: Post | null;
  next: Post | null;
} {
  const sortedPosts = [...mockPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const currentIndex = sortedPosts.findIndex((post) => post.slug === slug);

  return {
    previous: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null,
    next: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
  };
}

/**
 * Search options for filtering posts
 */
export interface SearchOptions {
  query?: string;
  topics?: Topic[];
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  sortBy?: 'relevance' | 'newest' | 'oldest';
}

/**
 * Search result with match information
 */
export interface SearchResult {
  post: Post;
  score: number;
  matchedFields: ('title' | 'summary' | 'content' | 'tags' | 'topics')[];
  highlights: {
    title?: string;
    summary?: string;
  };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a highlighted snippet with search terms marked
 */
function createHighlight(text: string, query: string, maxLength: number = 200): string {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return text.slice(0, maxLength);

  // Find the first occurrence of any search word
  const lowerText = text.toLowerCase();
  let firstMatchIndex = text.length;

  for (const word of words) {
    const index = lowerText.indexOf(word);
    if (index !== -1 && index < firstMatchIndex) {
      firstMatchIndex = index;
    }
  }

  // Calculate start position to center around the match
  let start = Math.max(0, firstMatchIndex - 50);
  if (start > 0) {
    // Find the start of the word
    while (start > 0 && text[start - 1] !== ' ') {
      start--;
    }
  }

  let snippet = text.slice(start, start + maxLength);

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (start + maxLength < text.length) snippet = snippet + '...';

  // Wrap matched words with <mark> tags
  for (const word of words) {
    const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
  }

  return snippet;
}

/**
 * Calculate search relevance score
 */
function calculateScore(post: Post, query: string): { score: number; matchedFields: SearchResult['matchedFields'] } {
  if (!query.trim()) {
    return { score: 0, matchedFields: [] };
  }

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  const matchedFields: SearchResult['matchedFields'] = [];

  // Title matches (highest weight)
  const titleLower = post.title.toLowerCase();
  for (const word of words) {
    if (titleLower.includes(word)) {
      score += 10;
      if (!matchedFields.includes('title')) matchedFields.push('title');
    }
  }
  // Exact title match bonus
  if (words.every(word => titleLower.includes(word))) {
    score += 5;
  }

  // Summary matches (high weight)
  const summaryLower = post.summary.toLowerCase();
  for (const word of words) {
    if (summaryLower.includes(word)) {
      score += 5;
      if (!matchedFields.includes('summary')) matchedFields.push('summary');
    }
  }

  // Tag matches (high weight)
  for (const tag of post.tags) {
    const tagLower = tag.toLowerCase();
    for (const word of words) {
      if (tagLower.includes(word)) {
        score += 8;
        if (!matchedFields.includes('tags')) matchedFields.push('tags');
      }
    }
  }

  // Topic matches (medium weight)
  for (const topic of post.topics) {
    const topicLower = topic.toLowerCase();
    for (const word of words) {
      if (topicLower.includes(word)) {
        score += 6;
        if (!matchedFields.includes('topics')) matchedFields.push('topics');
      }
    }
  }

  // Content matches (lower weight but still important)
  const contentLower = post.content.toLowerCase();
  for (const word of words) {
    // Count occurrences (up to a limit)
    const matches = (contentLower.match(new RegExp(escapeRegex(word), 'g')) || []).length;
    if (matches > 0) {
      score += Math.min(matches, 5); // Cap at 5 points per word
      if (!matchedFields.includes('content')) matchedFields.push('content');
    }
  }

  return { score, matchedFields };
}

/**
 * Search posts with full-text search and filtering
 */
export function searchPosts(options: SearchOptions): SearchResult[] {
  const { query = '', topics = [], dateFrom, dateTo, sortBy = 'relevance' } = options;

  let results: SearchResult[] = [];

  for (const post of mockPosts) {
    // Apply topic filter
    if (topics.length > 0) {
      const hasMatchingTopic = topics.some(topic => post.topics.includes(topic));
      if (!hasMatchingTopic) continue;
    }

    // Apply date range filter
    const postDate = new Date(post.publishedAt);
    if (dateFrom && postDate < new Date(dateFrom)) continue;
    if (dateTo && postDate > new Date(dateTo)) continue;

    // Calculate search score
    const { score, matchedFields } = calculateScore(post, query);

    // If there's a query, only include posts with matches
    if (query.trim() && score === 0) continue;

    // Create highlights
    const highlights: SearchResult['highlights'] = {};
    if (query.trim()) {
      if (matchedFields.includes('title')) {
        highlights.title = createHighlight(post.title, query, 100);
      }
      if (matchedFields.includes('summary') || matchedFields.includes('content')) {
        highlights.summary = createHighlight(
          matchedFields.includes('summary') ? post.summary : post.content,
          query,
          200
        );
      }
    }

    results.push({
      post,
      score,
      matchedFields,
      highlights,
    });
  }

  // Sort results
  switch (sortBy) {
    case 'relevance':
      // Sort by score descending, then by date descending
      results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
      });
      break;
    case 'newest':
      results.sort((a, b) =>
        new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime()
      );
      break;
    case 'oldest':
      results.sort((a, b) =>
        new Date(a.post.publishedAt).getTime() - new Date(b.post.publishedAt).getTime()
      );
      break;
  }

  return results;
}
