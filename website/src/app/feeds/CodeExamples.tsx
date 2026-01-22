'use client';

import { useEffect, useState } from 'react';
import { CopyButton } from './CopyButton';

const FEED_PATHS = {
  insights: {
    rss: '/insights-rss.xml',
    json: '/insights-feed.json',
  },
  digests: {
    rss: '/digests-rss.xml',
    json: '/digests-feed.json',
  },
};

export function CodeExamples() {
  const [baseUrl, setBaseUrl] = useState('https://libertas.fgu.tech');

  useEffect(() => {
    // Use the current origin for the base URL
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const insightsRss = `${baseUrl}${FEED_PATHS.insights.rss}`;
  const insightsJson = `${baseUrl}${FEED_PATHS.insights.json}`;
  const digestsRss = `${baseUrl}${FEED_PATHS.digests.rss}`;

  const curlCode = `# Insights RSS Feed
curl -s ${insightsRss}

# Insights JSON Feed
curl -s ${insightsJson} | jq .

# Weekly Digests
curl -s ${digestsRss}`;

  const jsCode = `// Fetch the insights feed
const response = await fetch('${insightsJson}');
const feed = await response.json();

// Access posts
feed.items.forEach(item => {
  console.log(item.title);
  console.log(item.url);
  console.log(item._libertas.freedom_relevance_score);
});`;

  const pythonCode = `import feedparser

# Parse the insights RSS feed
feed = feedparser.parse('${insightsRss}')

# Access posts
for entry in feed.entries:
    print(entry.title)
    print(entry.link)
    print(entry.summary)`;

  const n8nCode = `// HTTP Request Node configuration
{
  "url": "${insightsJson}",
  "method": "GET",
  "responseFormat": "json"
}

// Then use Item Lists node to iterate over feed.items`;

  return (
    <div className="space-y-6">
      <CodeExample
        title="cURL"
        description="Fetch feeds from the command line"
        code={curlCode}
        language="bash"
      />

      <CodeExample
        title="JavaScript / TypeScript"
        description="Fetch and parse the JSON feed in your application"
        code={jsCode}
        language="javascript"
      />

      <CodeExample
        title="Python"
        description="Parse the RSS feed with feedparser"
        code={pythonCode}
        language="python"
      />

      <CodeExample
        title="n8n Workflow"
        description="Ingest Libertas posts into your n8n automation"
        code={n8nCode}
        language="json"
      />
    </div>
  );
}

interface CodeExampleProps {
  title: string;
  description: string;
  code: string;
  language: string;
}

function CodeExample({ title, description, code, language }: CodeExampleProps) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-h3">{title}</h3>
          <p className="text-sm text-[var(--fg-tertiary)]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag tag-accent">{language}</span>
          <CopyButton text={code} />
        </div>
      </div>
      <div className="code-block">
        <pre className="text-sm">{code}</pre>
      </div>
    </div>
  );
}
