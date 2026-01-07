"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function parseMarkdown() {
      const parsed = await renderMarkdown(content);
      setHtml(parsed);
      setIsLoading(false);
    }
    parseMarkdown();
  }, [content]);

  if (isLoading) {
    return (
      <div className="prose-skeleton">
        <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4 mb-4 animate-pulse" />
        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full mb-2 animate-pulse" />
        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-5/6 mb-2 animate-pulse" />
        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-4/5 mb-6 animate-pulse" />
        <div className="h-32 bg-[var(--bg-tertiary)] rounded w-full mb-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="prose-libertas"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Render markdown to HTML with syntax highlighting
 */
async function renderMarkdown(content: string): Promise<string> {
  // Split content into segments (code blocks vs regular markdown)
  const segments = splitByCodeBlocks(content);
  let result = "";

  for (const segment of segments) {
    if (segment.type === "code") {
      // Render code block with shiki
      const highlighted = await highlightCode(segment.code, segment.language);
      result += highlighted;
    } else {
      // Render regular markdown
      result += parseInlineMarkdown(segment.content);
    }
  }

  return result;
}

interface CodeSegment {
  type: "code";
  language: string;
  code: string;
}

interface TextSegment {
  type: "text";
  content: string;
}

type Segment = CodeSegment | TextSegment;

function splitByCodeBlocks(content: string): Segment[] {
  const segments: Segment[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add code block
    segments.push({
      type: "code",
      language: match[1] || "text",
      code: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return segments;
}

async function highlightCode(code: string, language: string): Promise<string> {
  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    });
    return `<div class="code-block-wrapper">${html}</div>`;
  } catch {
    // Fallback to plain code block if language not supported
    return `<div class="code-block-wrapper"><pre class="code-block"><code>${escapeHtml(code)}</code></pre></div>`;
  }
}

function parseInlineMarkdown(content: string): string {
  let html = content;

  // Escape HTML first
  html = escapeHtml(html);

  // Headings with IDs for ToC linking
  html = html.replace(/^#### (.+)$/gm, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `<h4 id="${id}" class="text-h3 mt-8 mb-4 scroll-mt-24">${text}</h4>`;
  });
  html = html.replace(/^### (.+)$/gm, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `<h3 id="${id}" class="text-h2 mt-10 mb-4 scroll-mt-24">${text}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `<h2 id="${id}" class="text-h1 mt-12 mb-6 scroll-mt-24">${text}</h2>`;
  });

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-8 border-[var(--border-subtle)]" />');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-[var(--accent-primary)] pl-4 my-6 text-[var(--fg-secondary)] italic">$1</blockquote>');

  // Tables
  html = parseMarkdownTables(html);

  // Lists (unordered)
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc list-inside my-4 space-y-1">${match}</ul>`);

  // Lists (ordered)
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1">$1</li>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--fg-primary)]">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="citation" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="text-body text-[var(--fg-secondary)] mb-4 leading-relaxed">');

  // Wrap in paragraph tags
  if (!html.startsWith('<')) {
    html = `<p class="text-body text-[var(--fg-secondary)] mb-4 leading-relaxed">${html}</p>`;
  }

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

  return html;
}

function parseMarkdownTables(html: string): string {
  const tableRegex = /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g;

  return html.replace(tableRegex, (_, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean);
    const rows = bodyRows.trim().split('\n').map((row: string) =>
      row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
    );

    let table = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse">';
    table += '<thead><tr class="border-b border-[var(--border-default)]">';
    headers.forEach((h: string) => {
      table += `<th class="text-left py-2 px-4 text-small font-semibold text-[var(--fg-primary)]">${h}</th>`;
    });
    table += '</tr></thead><tbody>';

    rows.forEach((row: string[]) => {
      table += '<tr class="border-b border-[var(--border-subtle)]">';
      row.forEach((cell: string) => {
        table += `<td class="py-2 px-4 text-small text-[var(--fg-secondary)]">${cell}</td>`;
      });
      table += '</tr>';
    });

    table += '</tbody></table></div>';
    return table;
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
