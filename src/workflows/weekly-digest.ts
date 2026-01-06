/**
 * Workflow B: Weekly Digest Builder
 *
 * Generates a weekly digest from published insights.
 * 1. Queries insights from the past week
 * 2. Groups by topic
 * 3. Generates digest with LLM
 * 4. Publishes digest
 * 5. Optionally sends email newsletter
 */

import { loadThresholds, getLLMConfig } from '../services/config.js';
import { composeDigest } from '../services/llm.js';
import { publishDigestMarkdown } from '../services/publisher.js';
import { initDatabase, getInsightsByDateRange } from '../services/database.js';
import type { Insight, DigestResult } from '../types/index.js';

export interface WeeklyDigestResult {
  success: boolean;
  insightCount: number;
  digestPublished: boolean;
  publishedUrl?: string;
  emailSent: boolean;
  error?: string;
}

export interface WeeklyDigestOptions {
  periodStart?: string;
  periodEnd?: string;
  skipEmail?: boolean;
  skipPublish?: boolean;
}

/**
 * Calculate week boundaries
 */
function getWeekBoundaries(endDate?: string): { start: string; end: string } {
  const end = endDate ? new Date(endDate) : new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Run the weekly digest workflow
 */
export async function runWeeklyDigest(
  options: WeeklyDigestOptions = {}
): Promise<WeeklyDigestResult> {
  const result: WeeklyDigestResult = {
    success: true,
    insightCount: 0,
    digestPublished: false,
    emailSent: false,
  };

  try {
    const thresholds = loadThresholds();
    const llmConfig = getLLMConfig();

    // Calculate date range
    const { start, end } = getWeekBoundaries(options.periodEnd);
    const periodStart = options.periodStart || start;
    const periodEnd = options.periodEnd || end;

    // Initialize database
    initDatabase();

    // Get published insights from the period
    const insights = await getInsightsByDateRange(periodStart, periodEnd);
    result.insightCount = insights.length;

    // Check minimum threshold
    if (insights.length < thresholds.digest.min_insights) {
      result.success = false;
      result.error = `Not enough insights (${insights.length}) to generate digest (min: ${thresholds.digest.min_insights})`;
      return result;
    }

    // Generate digest with LLM
    const digestResult = await composeDigest(llmConfig, {
      insights: insights.map((i) => ({
        id: i.id,
        title: i.title,
        tldr: i.tldr,
        topics: i.topics,
        freedomRelevanceScore: i.freedomRelevanceScore,
        publishedUrl: i.publishedUrl,
      })),
      periodStart,
      periodEnd,
    });

    if (!digestResult.success || !digestResult.data) {
      result.success = false;
      result.error = digestResult.error || 'Failed to compose digest';
      return result;
    }

    const digest = digestResult.data;

    // Publish digest
    if (!options.skipPublish) {
      const publishResult = publishDigestMarkdown(digest, periodStart, periodEnd);
      if (publishResult.success) {
        result.digestPublished = true;
        result.publishedUrl = publishResult.publishedUrl;
      } else {
        result.error = publishResult.error;
      }
    }

    // Send email newsletter
    if (!options.skipEmail) {
      const emailResult = await sendDigestEmail(digest, insights, periodStart, periodEnd);
      result.emailSent = emailResult;
    }
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

/**
 * Send digest via email newsletter
 */
async function sendDigestEmail(
  digest: DigestResult,
  insights: Insight[],
  periodStart: string,
  periodEnd: string
): Promise<boolean> {
  const listmonkUrl = process.env.LISTMONK_URL;
  const listmonkUser = process.env.LISTMONK_USER;
  const listmonkPass = process.env.LISTMONK_PASS;

  if (!listmonkUrl || !listmonkUser || !listmonkPass) {
    console.log('Email not configured, skipping newsletter');
    return false;
  }

  try {
    const subject = `FGU Weekly Digest: ${periodStart} to ${periodEnd}`;
    const htmlContent = generateEmailHtml(digest, insights, periodStart, periodEnd);
    const textContent = generateEmailText(digest, periodStart, periodEnd);

    // Create campaign in Listmonk
    const response = await fetch(`${listmonkUrl}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${listmonkUser}:${listmonkPass}`).toString('base64'),
      },
      body: JSON.stringify({
        name: `Weekly Digest ${periodEnd}`,
        subject,
        body: htmlContent,
        altbody: textContent,
        content_type: 'html',
        send_at: null, // Send immediately
        lists: [1], // Default list ID
        type: 'regular',
      }),
    });

    if (!response.ok) {
      console.error('Failed to create Listmonk campaign:', response.status);
      return false;
    }

    const campaign = await response.json();

    // Start the campaign
    await fetch(`${listmonkUrl}/api/campaigns/${campaign.data.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${listmonkUser}:${listmonkPass}`).toString('base64'),
      },
      body: JSON.stringify({ status: 'running' }),
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

/**
 * Generate HTML email content (no tracking pixels)
 */
function generateEmailHtml(
  digest: DigestResult,
  insights: Insight[],
  periodStart: string,
  periodEnd: string
): string {
  const siteUrl = process.env.SITE_BASE_URL || 'https://libertas.fgu.tech';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FGU Weekly Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a2e; }
    h2 { color: #16213e; border-bottom: 2px solid #e94560; padding-bottom: 8px; }
    a { color: #e94560; }
    .section { margin-bottom: 24px; }
    .insight { margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>FGU Weekly Digest</h1>
  <p><em>${periodStart} to ${periodEnd}</em></p>

  <div class="section">
    <h2>TL;DR</h2>
    <p>${digest.executive_tldr}</p>
  </div>

  ${digest.sections
    .map(
      (section) => `
  <div class="section">
    <h2>${section.title}</h2>
    ${section.content_markdown}
  </div>
  `
    )
    .join('')}

  ${
    digest.emerging_patterns && digest.emerging_patterns.length > 0
      ? `
  <div class="section">
    <h2>Emerging Patterns</h2>
    <ul>
      ${digest.emerging_patterns.map((p) => `<li>${p.pattern}</li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }

  <div class="footer">
    <p><a href="${siteUrl}">FGU.tech</a> | <a href="${siteUrl}/rss.xml">RSS Feed</a></p>
    <p>Freedom Go Up - Building technology for sovereignty and resistance.</p>
    <p><a href="{{UnsubscribeURL}}">Unsubscribe</a></p>
  </div>
</body>
</html>`;
}

/**
 * Generate plain text email content
 */
function generateEmailText(
  digest: DigestResult,
  periodStart: string,
  periodEnd: string
): string {
  let text = `FGU WEEKLY DIGEST
${periodStart} to ${periodEnd}

TL;DR
======
${digest.executive_tldr}

`;

  for (const section of digest.sections) {
    text += `${section.title.toUpperCase()}
${'='.repeat(section.title.length)}
${section.content_markdown}

`;
  }

  if (digest.emerging_patterns && digest.emerging_patterns.length > 0) {
    text += `EMERGING PATTERNS
=================
${digest.emerging_patterns.map((p) => `- ${p.pattern}`).join('\n')}

`;
  }

  text += `---
Libertas | RSS: https://libertas.fgu.tech/rss.xml
Unsubscribe: {{UnsubscribeURL}}`;

  return text;
}

export default {
  runWeeklyDigest,
};
