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

type SortOption = "newest" | "relevance";

interface PostsFeedProps {
  /** Posts loaded server-side and passed as props */
  posts: Post[];
}

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
