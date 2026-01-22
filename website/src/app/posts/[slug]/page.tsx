import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getAdjacentPosts, getAllPosts } from "@/lib/posts";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { PostMetadata } from "@/components/PostMetadata";
import { ShareButtons } from "@/components/ShareButtons";
import { CitationList } from "@/components/CitationList";
import { PostNavigation } from "@/components/PostNavigation";
import { PostJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { ReadingProgress } from "@/components/ReadingProgress";
import { calculateReadingTime } from "@/lib/reading-time";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const postUrl = `${baseUrl}/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.summary,
    keywords: [...post.topics, ...post.tags],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url: postUrl,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: post.author ? [post.author] : ["Libertas Research"],
      tags: post.topics,
      section: post.topics[0],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = getAdjacentPosts(slug);
  const readingTime = calculateReadingTime(post.content);

  // Build the full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";
  const postUrl = `${baseUrl}/posts/${post.slug}`;

  // Breadcrumb data for structured data
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Signals", url: `${baseUrl}/posts` },
    { name: post.title, url: postUrl },
  ];

  return (
    <div className="matrix-bg min-h-screen">
      {/* JSON-LD Structured Data */}
      <PostJsonLd post={post} url={postUrl} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Reading Progress */}
      <ReadingProgress />

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <article className="max-w-4xl mx-auto">
            {/* Back link */}
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-small text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] mb-8 transition-colors"
            >
              <ChevronLeftIcon />
              Back to all signals
            </Link>

            {/* Title */}
            <h1 className="text-hero mb-6">{post.title}</h1>

            {/* Summary */}
            <p className="text-body text-lg text-[var(--fg-secondary)] mb-8 leading-relaxed border-l-2 border-[var(--accent-primary)] pl-4">
              {post.summary}
            </p>

            {/* Metadata */}
            <div className="mb-8">
              <PostMetadata post={post} readingTime={readingTime} />
            </div>

            {/* Share buttons */}
            <div className="mb-12 pb-8 border-b border-[var(--border-subtle)]">
              <ShareButtons title={post.title} url={postUrl} />
            </div>

            {/* Content */}
            <div className="prose-container">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Citations */}
            <CitationList citations={post.citations} />

            {/* Share again at bottom */}
            <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
              <ShareButtons title={post.title} url={postUrl} />
            </div>

            {/* Navigation */}
            <div className="mt-12">
              <PostNavigation previous={previous} next={next} />
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
