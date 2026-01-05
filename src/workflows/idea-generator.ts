/**
 * Workflow D: Project Idea Generator
 *
 * Generates project ideas from high-signal insights.
 * 1. Queries high-score insights
 * 2. Clusters by theme/pattern
 * 3. Generates project ideas with LLM
 * 4. Stores ideas and creates GitHub issues
 */

import { loadThresholds, getLLMConfig, getGitHubConfig } from '../services/config.js';
import { generateProjectIdea } from '../services/llm.js';
import {
  initDatabase,
  getHighSignalInsights,
  insertProjectIdea,
  updateProjectIdeaStatus,
} from '../services/database.js';
import type { Insight, ProjectIdea, IdeaSynthesizerResult } from '../types/index.js';

export interface IdeaGeneratorResult {
  success: boolean;
  insightsAnalyzed: number;
  ideasGenerated: number;
  ideasWithIssues: number;
  errors: string[];
}

export interface IdeaGeneratorOptions {
  minRelevanceScore?: number;
  lookbackDays?: number;
  maxIdeas?: number;
  skipGitHubIssue?: boolean;
}

/**
 * Run the idea generation workflow
 */
export async function runIdeaGenerator(
  options: IdeaGeneratorOptions = {}
): Promise<IdeaGeneratorResult> {
  const result: IdeaGeneratorResult = {
    success: true,
    insightsAnalyzed: 0,
    ideasGenerated: 0,
    ideasWithIssues: 0,
    errors: [],
  };

  try {
    const thresholds = loadThresholds();
    const llmConfig = getLLMConfig();

    const minRelevance = options.minRelevanceScore || thresholds.ideas.min_relevance_for_idea;
    const lookbackDays = options.lookbackDays || thresholds.ideas.lookback_days;

    // Initialize database
    initDatabase();

    // Get high-signal insights
    const insights = await getHighSignalInsights(minRelevance, lookbackDays);
    result.insightsAnalyzed = insights.length;

    if (insights.length === 0) {
      return result;
    }

    // Cluster insights by topic
    const clusters = clusterInsightsByTopic(insights);

    // Generate ideas for each cluster
    for (const [topic, clusterInsights] of Object.entries(clusters)) {
      if (options.maxIdeas && result.ideasGenerated >= options.maxIdeas) {
        break;
      }

      try {
        const idea = await generateIdeaFromCluster(
          clusterInsights,
          topic,
          llmConfig,
          thresholds
        );

        if (idea) {
          result.ideasGenerated++;

          // Create GitHub issue if meets threshold
          if (
            idea.feasibilityScore >= thresholds.ideas.min_feasibility &&
            idea.impactScore >= thresholds.ideas.min_impact &&
            !options.skipGitHubIssue
          ) {
            try {
              const issueUrl = await createIdeaGitHubIssue(idea);
              if (issueUrl) {
                await updateProjectIdeaStatus(idea.id, 'triaged', issueUrl);
                result.ideasWithIssues++;
              }
            } catch (error) {
              result.errors.push(`GitHub issue creation failed: ${error}`);
            }
          }
        }
      } catch (error) {
        result.errors.push(`Cluster ${topic} failed: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

/**
 * Cluster insights by primary topic
 */
function clusterInsightsByTopic(insights: Insight[]): Record<string, Insight[]> {
  const clusters: Record<string, Insight[]> = {};

  for (const insight of insights) {
    // Use first topic as primary
    const primaryTopic = insight.topics[0] || 'general';
    if (!clusters[primaryTopic]) {
      clusters[primaryTopic] = [];
    }
    clusters[primaryTopic].push(insight);
  }

  // Only keep clusters with 2+ insights (pattern detection)
  return Object.fromEntries(
    Object.entries(clusters).filter(([_, insights]) => insights.length >= 2)
  );
}

/**
 * Detect patterns in a cluster of insights
 */
function detectPatterns(insights: Insight[]): string[] {
  const patterns: string[] = [];

  // Check for geographic patterns
  const geos = insights.flatMap((i) => i.geo || []);
  const geoCount = new Map<string, number>();
  for (const geo of geos) {
    geoCount.set(geo, (geoCount.get(geo) || 0) + 1);
  }
  for (const [geo, count] of geoCount) {
    if (count >= 2) {
      patterns.push(`Multiple signals from ${geo}`);
    }
  }

  // Check for topic co-occurrence
  const topicPairs = new Map<string, number>();
  for (const insight of insights) {
    for (let i = 0; i < insight.topics.length; i++) {
      for (let j = i + 1; j < insight.topics.length; j++) {
        const pair = [insight.topics[i], insight.topics[j]].sort().join('+');
        topicPairs.set(pair, (topicPairs.get(pair) || 0) + 1);
      }
    }
  }
  for (const [pair, count] of topicPairs) {
    if (count >= 2) {
      patterns.push(`Co-occurrence of ${pair.replace('+', ' and ')}`);
    }
  }

  // Check for high-impact signals
  const highImpact = insights.filter((i) => i.freedomRelevanceScore >= 90);
  if (highImpact.length >= 2) {
    patterns.push(`${highImpact.length} high-impact signals in this area`);
  }

  return patterns;
}

/**
 * Generate a project idea from a cluster of insights
 */
async function generateIdeaFromCluster(
  insights: Insight[],
  topic: string,
  llmConfig: ReturnType<typeof getLLMConfig>,
  thresholds: ReturnType<typeof loadThresholds>
): Promise<ProjectIdea | null> {
  const patterns = detectPatterns(insights);

  if (patterns.length === 0) {
    return null; // No strong patterns detected
  }

  const ideaResult = await generateProjectIdea(llmConfig, {
    insights: insights.map((i) => ({
      title: i.title,
      topics: i.topics,
      geo: i.geo,
      freedomRelevanceScore: i.freedomRelevanceScore,
    })),
    patterns,
  });

  if (!ideaResult.success || !ideaResult.data) {
    return null;
  }

  const llmIdea = ideaResult.data;

  // Store project idea
  const ideaData: Omit<ProjectIdea, 'id' | 'createdAt' | 'updatedAt'> = {
    derivedFromInsightIds: insights.map((i) => i.id),
    problemStatement: llmIdea.problem_statement,
    threatModel: llmIdea.threat_model,
    affectedGroups: llmIdea.affected_groups,
    proposedSolution: llmIdea.proposed_solution,
    mvpScope: llmIdea.mvp_scope,
    misuseRisks: llmIdea.misuse_risks,
    feasibilityScore: llmIdea.feasibility_score,
    impactScore: llmIdea.impact_score,
    status: 'new',
    technicalDependencies: llmIdea.technical_dependencies,
    suggestedStack: llmIdea.suggested_stack,
    priorArt: llmIdea.prior_art,
    openQuestions: llmIdea.open_questions,
  };

  return await insertProjectIdea(ideaData);
}

/**
 * Create GitHub issue for a project idea
 */
async function createIdeaGitHubIssue(idea: ProjectIdea): Promise<string | undefined> {
  const config = getGitHubConfig();
  if (!config.token || !config.org || !config.repo) {
    return undefined;
  }

  const title = `[Project Idea] ${idea.problemStatement.slice(0, 80)}...`;
  const body = formatIdeaIssueBody(idea);

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
        labels: ['project-idea', 'needs-triage'],
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
 * Format project idea as GitHub issue
 */
function formatIdeaIssueBody(idea: ProjectIdea): string {
  return `## Project Idea

**ID:** ${idea.id}
**Feasibility Score:** ${idea.feasibilityScore}/100
**Impact Score:** ${idea.impactScore}/100
**Status:** ${idea.status}

---

### Problem Statement

${idea.problemStatement}

### Threat Model

${idea.threatModel}

### Affected Groups

${idea.affectedGroups.map((g) => `- ${g}`).join('\n')}

### Proposed Solution

${idea.proposedSolution}

### MVP Scope

${idea.mvpScope}

### Misuse Risks

${idea.misuseRisks}

---

### Technical Details

**Dependencies:**
${idea.technicalDependencies?.map((d) => `- ${d}`).join('\n') || 'Not specified'}

**Suggested Stack:**
${idea.suggestedStack?.map((s) => `- ${s}`).join('\n') || 'Not specified'}

**Prior Art:**
${idea.priorArt?.map((p) => `- ${p}`).join('\n') || 'Not specified'}

### Open Questions

${idea.openQuestions?.map((q) => `- ${q}`).join('\n') || 'None'}

---

*This issue was auto-generated by FGU Signal Engine.*`;
}

export default {
  runIdeaGenerator,
};
