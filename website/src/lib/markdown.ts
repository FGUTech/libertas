/**
 * Markdown utilities for server-side processing
 */

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extract table of contents from markdown content
 */
export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    items.push({ id, text, level });
  }

  return items;
}
