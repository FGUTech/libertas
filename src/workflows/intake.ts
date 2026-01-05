/**
 * Workflow C: Inbound Intake
 *
 * Handles public submissions via webhook.
 * 1. Validates and sanitizes input
 * 2. Stores submission
 * 3. Classifies with LLM
 * 4. Creates GitHub issue
 * 5. Sends notifications
 */

import { loadThresholds, getLLMConfig, getGitHubConfig } from '../services/config.js';
import { classifyIntake } from '../services/llm.js';
import { initDatabase, insertSubmission, updateSubmissionStatus } from '../services/database.js';
import { containsSensitivePatterns } from '../utils/validation.js';
import type { Submission, IntakeRequest, RiskLevel, SubmissionChannel } from '../types/index.js';

export interface IntakeResult {
  success: boolean;
  submissionId?: string;
  githubIssueUrl?: string;
  error?: string;
}

export interface IntakeOptions {
  skipGitHubIssue?: boolean;
  skipNotification?: boolean;
}

/**
 * Process an inbound submission
 */
export async function processIntake(
  request: IntakeRequest,
  channel: SubmissionChannel = 'web',
  options: IntakeOptions = {}
): Promise<IntakeResult> {
  try {
    // Validate input
    if (!request.message || request.message.trim().length === 0) {
      return { success: false, error: 'Message is required' };
    }

    if (request.message.length > 10000) {
      return { success: false, error: 'Message exceeds maximum length' };
    }

    // Initialize database
    initDatabase();

    // Sanitize input
    const sanitizedMessage = sanitizeInput(request.message);
    const sanitizedContact = request.contact ? sanitizeInput(request.contact) : undefined;

    // Initial risk assessment based on patterns
    let initialRiskLevel: RiskLevel = 'low';
    if (containsSensitivePatterns(sanitizedMessage)) {
      initialRiskLevel = 'high';
    } else if (request.safetyMode) {
      initialRiskLevel = 'medium';
    }

    // Classify with LLM
    const llmConfig = getLLMConfig();
    const classificationResult = await classifyIntake(llmConfig, {
      message: sanitizedMessage,
      contact: sanitizedContact,
      category: request.category,
      safetyMode: request.safetyMode,
    });

    let classification = {
      category: 'other' as const,
      tags: [] as string[],
      risk_level: initialRiskLevel as RiskLevel,
      priority: 'normal' as const,
      is_spam: false,
      requires_response: true,
    };

    if (classificationResult.success && classificationResult.data) {
      classification = {
        category: classificationResult.data.category,
        tags: classificationResult.data.tags,
        risk_level: classificationResult.data.risk_level,
        priority: classificationResult.data.priority,
        is_spam: classificationResult.data.is_spam || false,
        requires_response: classificationResult.data.requires_response ?? true,
      };
    }

    // Create submission record
    const submissionData: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'> = {
      submittedAt: new Date().toISOString(),
      channel,
      contact: request.safetyMode ? undefined : sanitizedContact, // Don't store contact in safety mode
      message: sanitizedMessage,
      tags: classification.tags,
      riskLevel: classification.risk_level,
      status: 'new',
      category: classification.category,
      priority: classification.priority,
      isSpam: classification.is_spam,
      requiresResponse: classification.requires_response,
    };

    const submission = await insertSubmission(submissionData);

    // Create GitHub issue (unless spam or skipped)
    let githubIssueUrl: string | undefined;
    if (!classification.is_spam && !options.skipGitHubIssue) {
      try {
        githubIssueUrl = await createGitHubIssue(submission, classification);
        if (githubIssueUrl) {
          await updateSubmissionStatus(submission.id, 'triaged', githubIssueUrl);
        }
      } catch (error) {
        console.warn('GitHub issue creation failed:', error);
      }
    }

    // Send notification for high-risk submissions
    if (classification.risk_level === 'high' && !options.skipNotification) {
      await sendNotification(submission, classification);
    }

    return {
      success: true,
      submissionId: submission.id,
      githubIssueUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sanitize user input
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}

/**
 * Create GitHub issue from submission
 */
async function createGitHubIssue(
  submission: Submission,
  classification: { category: string; tags: string[]; risk_level: string }
): Promise<string | undefined> {
  const config = getGitHubConfig();
  if (!config.token || !config.org || !config.repo) {
    console.warn('GitHub not configured, skipping issue creation');
    return undefined;
  }

  const title = `[${classification.category}] Inbound Submission`;
  const body = formatGitHubIssueBody(submission, classification);

  const response = await fetch(
    `https://api.github.com/repos/${config.org}/${config.repo}/issues`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['intake', classification.category, `risk:${classification.risk_level}`],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const issue = await response.json();
  return issue.html_url;
}

/**
 * Format GitHub issue body
 */
function formatGitHubIssueBody(
  submission: Submission,
  classification: { category: string; tags: string[]; risk_level: string }
): string {
  return `## Inbound Submission

**ID:** ${submission.id}
**Channel:** ${submission.channel}
**Risk Level:** ${classification.risk_level}
**Tags:** ${classification.tags.join(', ') || 'None'}

---

### Message

${submission.message}

---

### Auto-Generated Classification

- **Category:** ${classification.category}
- **Risk Level:** ${classification.risk_level}
- **Priority:** ${submission.priority || 'normal'}

---

*This issue was auto-generated by FGU Signal Engine.*`;
}

/**
 * Send notification for high-priority submissions
 */
async function sendNotification(
  submission: Submission,
  classification: { category: string; risk_level: string }
): Promise<void> {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

  const message = `New ${classification.risk_level.toUpperCase()} risk submission received\n` +
    `Category: ${classification.category}\n` +
    `ID: ${submission.id}`;

  // Try Slack
  if (slackWebhook) {
    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    } catch (error) {
      console.warn('Slack notification failed:', error);
    }
  }

  // Try Discord
  if (discordWebhook) {
    try {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    } catch (error) {
      console.warn('Discord notification failed:', error);
    }
  }
}

export default {
  processIntake,
};
