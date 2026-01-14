/**
 * Posts content loader
 *
 * Reads markdown files from website/public/content/insights/ at build time.
 * Falls back to mock posts if no real content exists (for development).
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { Post, Topic, PostCitation } from "@/types";
import { TOPICS } from "@/types";
import { mockPosts, getAdjacentPosts as getMockAdjacentPosts } from "./mock-posts";

// Content directory relative to website root
const CONTENT_DIR = path.join(process.cwd(), "public", "content", "insights");

/**
 * Frontmatter structure from markdown files
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

// Note: Search functionality is in mock-posts.ts and should be imported
// directly by client components. This file uses Node.js fs module and
// can only be used in server components.
