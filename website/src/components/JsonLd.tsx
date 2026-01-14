import type { Post } from "@/types";

interface JsonLdProps {
  post: Post;
  url: string;
}

/**
 * Generates JSON-LD structured data for a post following schema.org Article type
 */
export function PostJsonLd({ post, url }: JsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    url: url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author || "Libertas Research",
      url: "https://github.com/FGUTech",
    },
    publisher: {
      "@type": "Organization",
      name: "Libertas",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: [...post.topics, ...post.tags].join(", "),
    articleSection: post.topics[0] || "Research",
    citation: post.citations.map((citation) => ({
      "@type": "CreativeWork",
      name: citation.title,
      url: citation.url,
      publisher: {
        "@type": "Organization",
        name: citation.source,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebsiteJsonLdProps {
  name?: string;
  description?: string;
  url?: string;
}

/**
 * Generates JSON-LD structured data for the website
 */
export function WebsiteJsonLd({
  name = "Libertas",
  description = "Automated, privacy-preserving research and publishing platform for Freedom Tech.",
  url,
}: WebsiteJsonLdProps) {
  const siteUrl = url || process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: "Freedom Go Up",
      url: "https://github.com/FGUTech",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/posts?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Generates JSON-LD structured data for breadcrumb navigation
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
