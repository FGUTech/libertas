"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo, useCallback, useTransition } from "react";
import { ContentCard, PostCard } from "@/components/PostCard";
import { TopicFilter } from "./TopicFilter";
import { SortSelect } from "./SortSelect";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import type { Post, Topic, ContentItem } from "@/types";
import { TOPICS, isPost } from "@/types";

const POSTS_PER_PAGE = 12;

type SortOption = "newest" | "relevance";

interface PostsFeedProps {
  /** Posts loaded server-side and passed as props */
  posts: Post[];
}

interface ContentFeedProps {
  /** Content items (posts + digests) loaded server-side */
  items: ContentItem[];
}

/**
 * ContentFeed - Unified feed component for posts and digests
 */
export function ContentFeed({ items: allItems }: ContentFeedProps) {
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

  // Get topics for an item (works for both posts and digests)
  const getItemTopics = (item: ContentItem): Topic[] => {
    if (isPost(item)) {
      return item.topics;
    }
    return item.topTopics;
  };

  // Get relevance score for sorting (digests use average, so we default to 0)
  const getRelevanceScore = (item: ContentItem): number => {
    if (isPost(item)) {
      return item.freedomRelevanceScore;
    }
    // Digests don't have a relevance score, sort them by date instead
    return 0;
  };

  // Get the appropriate URL for the item
  const getItemUrl = (item: ContentItem): string => {
    if (isPost(item)) {
      return `/posts/${item.slug}`;
    }
    return `/digests/${item.slug}`;
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Filter by topics
    if (selectedTopics.length > 0) {
      items = items.filter((item) => {
        const itemTopics = getItemTopics(item);
        return selectedTopics.some((topic) => itemTopics.includes(topic));
      });
    }

    // Sort
    if (sortBy === "relevance") {
      // For relevance sort, posts come first sorted by score, then digests by date
      items.sort((a, b) => {
        const scoreA = getRelevanceScore(a);
        const scoreB = getRelevanceScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    } else {
      items.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return items;
  }, [allItems, selectedTopics, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / POSTS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
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
        {filteredItems.length === 0
          ? "No content found"
          : `Showing ${(currentPage - 1) * POSTS_PER_PAGE + 1}-${Math.min(
              currentPage * POSTS_PER_PAGE,
              filteredItems.length
            )} of ${filteredItems.length} items`}
      </div>

      {/* Content Grid or Empty State */}
      {paginatedItems.length > 0 ? (
        <>
          <div className="grid-posts mb-12">
            {paginatedItems.map((item) => (
              <Link key={item.id} href={getItemUrl(item)}>
                <ContentCard item={item} />
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

/**
 * PostsFeed - Legacy component for backwards compatibility
 */
export function PostsFeed({ posts: allPosts }: PostsFeedProps) {
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
    let posts = [...allPosts];

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
