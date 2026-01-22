/**
 * Posts content loader
 *
 * Reads markdown files from website/public/content/insights/ at build time.
 * Falls back to mock posts if no real content exists (for development).
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { Post, Topic, PostCitation, Digest, ContentItem, DigestSection, EmergingPattern } from "@/types";
import { TOPICS, isPost, isDigest } from "@/types";
import { mockPosts, getAdjacentPosts as getMockAdjacentPosts } from "./mock-posts";

// Content directories relative to website root
const INSIGHTS_DIR = path.join(process.cwd(), "public", "content", "insights");
const DIGESTS_DIR = path.join(process.cwd(), "public", "content", "digests");

// Legacy alias for backwards compatibility
const CONTENT_DIR = INSIGHTS_DIR;

/**
 * Frontmatter structure from insight markdown files
 */
interface InsightFrontmatter {
  title: string;
  slug: string;
  published_at: string;
  updated_at?: string;
  status: string;
  topics: string[];
  freedom_relevance_score: number;
  credibility_score: number;
  geo?: string[];
  citations: string[];
  author?: string;
  tags?: string[];
}

/**
 * Frontmatter structure from digest markdown files
 */
interface DigestFrontmatter {
  type: 'digest';
  title: string;
  slug: string;
  period_start: string;
  period_end: string;
  insight_count: number;
  top_topics: string[];
  published_at: string;
  status: string;
}

/**
 * Parse frontmatter and content from markdown
 */
function parseMarkdown(content: string): { frontmatter: InsightFrontmatter; body: string } | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  try {
    const frontmatter = yaml.load(match[1]) as InsightFrontmatter;
    const body = match[2].trim();
    return { frontmatter, body };
  } catch {
    console.error("Failed to parse frontmatter");
    return null;
  }
}

/**
 * Convert frontmatter to Post type
 */
function frontmatterToPost(
  frontmatter: InsightFrontmatter,
  body: string,
  filePath: string
): Post {
  // Validate topics
  const validTopics = frontmatter.topics.filter((t): t is Topic =>
    TOPICS.includes(t as Topic)
  );

  // Convert citation URLs to PostCitation format
  const citations: PostCitation[] = frontmatter.citations.map((url) => ({
    url,
    title: new URL(url).hostname,
    source: new URL(url).hostname.replace(/^www\./, ""),
    accessedAt: frontmatter.published_at,
  }));

  // Generate ID from file path
  const id = path.basename(filePath, ".md");

  // Extract summary from TL;DR or first paragraph
  let summary = "";
  const tldrMatch = body.match(/\*\*TL;DR:\*\*\s*(.+?)(?:\n|$)/);
  if (tldrMatch) {
    summary = tldrMatch[1].trim();
  } else {
    // Use first paragraph after the title
    const paragraphs = body.split(/\n\n/).filter((p) => !p.startsWith("#"));
    summary = paragraphs[0]?.replace(/\*\*/g, "").substring(0, 280) || "";
  }

  // Extract content (everything after the TL;DR line and Key Points heading)
  let content = body;
  // Remove the title line if present
  content = content.replace(/^# .+\n+/, "");
  // Remove TL;DR line
  content = content.replace(/\*\*TL;DR:\*\*\s*.+\n+/, "");

  return {
    type: 'post' as const,
    id,
    slug: frontmatter.slug,
    title: frontmatter.title,
    summary,
    content,
    author: frontmatter.author || "Libertas Research",
    publishedAt: frontmatter.published_at,
    updatedAt: frontmatter.updated_at,
    tags: frontmatter.tags || validTopics.map((t) => t.replace(/-/g, " ")),
    topics: validTopics.length > 0 ? validTopics : ["sovereignty"],
    citations,
    freedomRelevanceScore: frontmatter.freedom_relevance_score,
    credibilityScore: frontmatter.credibility_score,
    geo: frontmatter.geo,
  };
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Load all posts from the filesystem
 * Returns mock posts if no real content exists
 */
function loadPostsFromFilesystem(): Post[] {
  const markdownFiles = findMarkdownFiles(CONTENT_DIR);

  if (markdownFiles.length === 0) {
    console.log("No content files found, using mock posts");
    return mockPosts;
  }

  const posts: Post[] = [];

  for (const filePath of markdownFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = parseMarkdown(fileContent);

      if (!parsed) {
        console.warn(`Failed to parse markdown: ${filePath}`);
        continue;
      }

      // Only include published posts
      if (parsed.frontmatter.status !== "published") {
        continue;
      }

      const post = frontmatterToPost(parsed.frontmatter, parsed.body, filePath);
      posts.push(post);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  // If we found real posts, return them; otherwise fall back to mock
  if (posts.length > 0) {
    console.log(`Loaded ${posts.length} posts from filesystem`);
    return posts;
  }

  console.log("No valid posts found, using mock posts");
  return mockPosts;
}

// Cache posts at module level (refreshed on each build)
let cachedPosts: Post[] | null = null;

/**
 * Get all posts, sorted by date (newest first)
 */
export function getAllPosts(): Post[] {
  if (!cachedPosts) {
    cachedPosts = loadPostsFromFilesystem();
  }

  return [...cachedPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): Post | undefined {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug);
}

/**
 * Get adjacent posts for navigation
 */
export function getAdjacentPosts(slug: string): {
  previous: Post | null;
  next: Post | null;
} {
  const posts = getAllPosts();

  // If using mock posts, delegate to mock implementation
  if (posts === mockPosts) {
    return getMockAdjacentPosts(slug);
  }

  const currentIndex = posts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

// =============================================================================
// DIGEST LOADING
// =============================================================================

/**
 * Parse digest markdown frontmatter
 */
function parseDigestMarkdown(content: string): { frontmatter: DigestFrontmatter; body: string } | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  try {
    const frontmatter = yaml.load(match[1]) as DigestFrontmatter;
    const body = match[2].trim();
    return { frontmatter, body };
  } catch {
    console.error("Failed to parse digest frontmatter");
    return null;
  }
}

/**
 * Extract digest sections and metadata from markdown body
 */
function parseDigestBody(body: string): {
  executiveTldr: string;
  sections: DigestSection[];
  emergingPatterns: EmergingPattern[];
  lookingAhead: string[];
} {
  let executiveTldr = "";
  const sections: DigestSection[] = [];
  const emergingPatterns: EmergingPattern[] = [];
  const lookingAhead: string[] = [];

  // Extract TL;DR
  const tldrMatch = body.match(/## TL;DR\s*\n\n([\s\S]*?)(?=\n## |$)/);
  if (tldrMatch) {
    executiveTldr = tldrMatch[1].trim();
  }

  // Extract topic sections (## Section Title that aren't special sections)
  const sectionRegex = /## ([^\n]+)\s*\n\n([\s\S]*?)(?=\n## |$)/g;
  let sectionMatch;
  const specialSections = ['TL;DR', 'Emerging Patterns', 'Looking Ahead'];

  while ((sectionMatch = sectionRegex.exec(body)) !== null) {
    const title = sectionMatch[1].trim();
    if (!specialSections.includes(title)) {
      sections.push({
        title,
        contentMarkdown: sectionMatch[2].trim(),
      });
    }
  }

  // Extract emerging patterns
  const patternsMatch = body.match(/## Emerging Patterns\s*\n\n([\s\S]*?)(?=\n## |$)/);
  if (patternsMatch) {
    const patternLines = patternsMatch[1].trim().split('\n').filter(line => line.startsWith('- '));
    for (const line of patternLines) {
      emergingPatterns.push({
        pattern: line.replace(/^- /, '').trim(),
        supportingSignals: [],
      });
    }
  }

  // Extract looking ahead
  const lookingAheadMatch = body.match(/## Looking Ahead\s*\n\n([\s\S]*?)(?=\n## |$)/);
  if (lookingAheadMatch) {
    const items = lookingAheadMatch[1].trim().split('\n').filter(line => line.startsWith('- '));
    for (const item of items) {
      lookingAhead.push(item.replace(/^- /, '').trim());
    }
  }

  return { executiveTldr, sections, emergingPatterns, lookingAhead };
}

/**
 * Convert digest frontmatter and body to Digest type
 */
function frontmatterToDigest(
  frontmatter: DigestFrontmatter,
  body: string,
  filePath: string
): Digest {
  const validTopics = frontmatter.top_topics.filter((t): t is Topic =>
    TOPICS.includes(t as Topic)
  );

  const { executiveTldr, sections, emergingPatterns, lookingAhead } = parseDigestBody(body);

  const id = path.basename(filePath, ".md");

  return {
    type: 'digest' as const,
    id,
    slug: frontmatter.slug,
    title: frontmatter.title,
    periodStart: frontmatter.period_start,
    periodEnd: frontmatter.period_end,
    executiveTldr,
    sections,
    emergingPatterns: emergingPatterns.length > 0 ? emergingPatterns : undefined,
    lookingAhead: lookingAhead.length > 0 ? lookingAhead : undefined,
    insightCount: frontmatter.insight_count,
    topTopics: validTopics,
    publishedAt: frontmatter.published_at,
    content: body,
  };
}

/**
 * Load all digests from the filesystem
 */
function loadDigestsFromFilesystem(): Digest[] {
  const markdownFiles = findMarkdownFiles(DIGESTS_DIR);

  if (markdownFiles.length === 0) {
    console.log("No digest files found");
    return [];
  }

  const digests: Digest[] = [];

  for (const filePath of markdownFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = parseDigestMarkdown(fileContent);

      if (!parsed) {
        console.warn(`Failed to parse digest markdown: ${filePath}`);
        continue;
      }

      // Only include published digests
      if (parsed.frontmatter.status !== "published") {
        continue;
      }

      const digest = frontmatterToDigest(parsed.frontmatter, parsed.body, filePath);
      digests.push(digest);
    } catch (error) {
      console.error(`Error reading digest file ${filePath}:`, error);
    }
  }

  console.log(`Loaded ${digests.length} digests from filesystem`);
  return digests;
}

// Cache digests at module level (refreshed on each build)
let cachedDigests: Digest[] | null = null;

/**
 * Get all digests, sorted by date (newest first)
 */
export function getAllDigests(): Digest[] {
  if (!cachedDigests) {
    cachedDigests = loadDigestsFromFilesystem();
  }

  return [...cachedDigests].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get a single digest by slug
 */
export function getDigestBySlug(slug: string): Digest | undefined {
  const digests = getAllDigests();
  return digests.find((digest) => digest.slug === slug);
}

// =============================================================================
// UNIFIED CONTENT (POSTS + DIGESTS)
// =============================================================================

/**
 * Get all content items (posts + digests) sorted by date (newest first)
 */
export function getAllContent(): ContentItem[] {
  const posts = getAllPosts();
  const digests = getAllDigests();

  const allContent: ContentItem[] = [...posts, ...digests];

  return allContent.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get content item by slug (checks both posts and digests)
 */
export function getContentBySlug(slug: string): ContentItem | undefined {
  const post = getPostBySlug(slug);
  if (post) return post;

  return getDigestBySlug(slug);
}

// Re-export type guards for convenience
export { isPost, isDigest };

// Note: Search functionality is in mock-posts.ts and should be imported
// directly by client components. This file uses Node.js fs module and
// can only be used in server components.
