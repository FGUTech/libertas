"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo, useCallback, useTransition } from "react";
import { PostCard } from "@/components/PostCard";
import { TopicFilter } from "./TopicFilter";
import { SortSelect } from "./SortSelect";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import type { Post, Topic } from "@/types";
import { TOPICS } from "@/types";

const POSTS_PER_PAGE = 12;

// Mock data - will be replaced with real data fetching
const mockPosts: Post[] = [
  {
    id: "1",
    slug: "bitcoin-mesh-networks-expand-to-rural-communities",
    title: "Bitcoin Mesh Networks Expand to Rural Communities",
    summary:
      "New offline-first Bitcoin transaction protocols are enabling financial sovereignty in areas with limited internet connectivity, using mesh networking and satellite links.",
    content: "",
    publishedAt: "2026-01-05T14:30:00Z",
    tags: ["bitcoin", "mesh-networks", "rural-access"],
    topics: ["bitcoin", "payments", "sovereignty"],
    citations: [
      {
        url: "https://example.com/source1",
        title: "Mesh Network Deployment Report",
        source: "Bitcoin Magazine",
        accessedAt: "2026-01-05T10:00:00Z",
      },
      {
        url: "https://example.com/source2",
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
    content: "",
    publishedAt: "2026-01-04T09:15:00Z",
    tags: ["zk-proofs", "voting", "democracy"],
    topics: ["zk", "privacy", "identity"],
    citations: [
      {
        url: "https://example.com/source3",
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
    content: "",
    publishedAt: "2026-01-03T16:45:00Z",
    tags: ["encryption", "messaging", "activism"],
    topics: ["comms", "privacy", "activism"],
    citations: [
      {
        url: "https://example.com/source4",
        title: "Digital Rights Report 2026",
        source: "EFF",
        accessedAt: "2026-01-03T12:00:00Z",
      },
      {
        url: "https://example.com/source5",
        title: "Messenger Adoption Statistics",
        source: "Signal Foundation",
        accessedAt: "2026-01-03T12:00:00Z",
      },
      {
        url: "https://example.com/source6",
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
    content: "",
    publishedAt: "2026-01-02T11:00:00Z",
    tags: ["identity", "w3c", "standards"],
    topics: ["identity", "sovereignty"],
    citations: [
      {
        url: "https://example.com/source7",
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
    content: "",
    publishedAt: "2026-01-01T08:00:00Z",
    tags: ["tor", "anonymity", "performance"],
    topics: ["privacy", "censorship-resistance"],
    citations: [
      {
        url: "https://example.com/source8",
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
    content: "",
    publishedAt: "2025-12-30T15:00:00Z",
    tags: ["lightning", "bitcoin", "privacy"],
    topics: ["bitcoin", "privacy", "payments"],
    citations: [
      {
        url: "https://example.com/source9",
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
    content: "",
    publishedAt: "2025-12-28T10:00:00Z",
    tags: ["starknet", "zk-proofs", "scaling"],
    topics: ["zk", "sovereignty"],
    citations: [
      {
        url: "https://example.com/source10",
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
    content: "",
    publishedAt: "2025-12-25T12:00:00Z",
    tags: ["surveillance", "legislation", "activism"],
    topics: ["surveillance", "activism"],
    citations: [
      {
        url: "https://example.com/source11",
        title: "Surveillance Tracker Launch",
        source: "Digital Rights Foundation",
        accessedAt: "2025-12-25T10:00:00Z",
      },
    ],
    freedomRelevanceScore: 88,
    credibilityScore: 86,
  },
];

type SortOption = "newest" | "relevance";

export function PostsFeed() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read filter state from URL params
  const selectedTopics = useMemo(() => {
    const topics = searchParams.get("topics");
    if (!topics) return [] as Topic[];
    return topics.split(",").filter((t): t is Topic => TOPICS.includes(t as Topic));
  }, [searchParams]);

  const sortBy = (searchParams.get("sort") as SortOption) || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (except page itself)
      if (!("page" in updates)) {
        params.delete("page");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const handleTopicToggle = useCallback(
    (topic: Topic) => {
      const newTopics = selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic];

      updateParams({ topics: newTopics.length > 0 ? newTopics.join(",") : null });
    },
    [selectedTopics, updateParams]
  );

  const handleClearFilters = useCallback(() => {
    updateParams({ topics: null, sort: null, page: null });
  }, [updateParams]);

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      updateParams({ sort: sort === "newest" ? null : sort });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page === 1 ? null : page.toString() });
    },
    [updateParams]
  );

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts];

    // Filter by topics
    if (selectedTopics.length > 0) {
      posts = posts.filter((post) =>
        selectedTopics.some((topic) => post.topics.includes(topic))
      );
    }

    // Sort
    if (sortBy === "relevance") {
      posts.sort((a, b) => b.freedomRelevanceScore - a.freedomRelevanceScore);
    } else {
      posts.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return posts;
  }, [selectedTopics, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const hasActiveFilters = selectedTopics.length > 0;

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : ""}>
      {/* Filters Row */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopicFilter
          selectedTopics={selectedTopics}
          onTopicToggle={handleTopicToggle}
          onClearAll={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <SortSelect value={sortBy} onChange={handleSortChange} />
      </div>

      {/* Results count */}
      <div className="mb-6 text-small text-[var(--fg-tertiary)]">
        {filteredPosts.length === 0
          ? "No posts found"
          : `Showing ${(currentPage - 1) * POSTS_PER_PAGE + 1}-${Math.min(
              currentPage * POSTS_PER_PAGE,
              filteredPosts.length
            )} of ${filteredPosts.length} posts`}
      </div>

      {/* Posts Grid or Empty State */}
      {paginatedPosts.length > 0 ? (
        <>
          <div className="grid-posts mb-12">
            {paginatedPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <PostCard post={post} />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      )}
    </div>
  );
}
