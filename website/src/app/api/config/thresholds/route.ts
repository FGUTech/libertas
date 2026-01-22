import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// =============================================================================
// Types
// =============================================================================

interface ThresholdsConfig {
  runtime: {
    use_stubs: boolean;
  };
  ingestion: {
    relevance_threshold: number;
  };
  publishing: {
    auto_publish_relevance: number;
    auto_publish_credibility: number;
    require_citations: boolean;
    require_safety_check: boolean;
  };
  review: {
    relevance_below: number;
    credibility_below: number;
    safety_concern_always_review: boolean;
  };
  deduplication: {
    exact_match: boolean;
    semantic_threshold: number;
    semantic_enabled: boolean;
  };
  ideas: {
    min_relevance_for_idea: number;
    min_feasibility: number;
    min_impact: number;
    lookback_days: number;
  };
  vibe_coding: {
    requires_human_approval: boolean;
    allowed_categories: string[];
    blocked_categories: string[];
    min_feasibility: number;
    min_impact: number;
  };
  digest: {
    min_insights: number;
    max_per_section: number;
  };
  intake: {
    story_queue_relevance_threshold: number;
    story_queue_credibility_threshold: number;
    max_stories_per_run: number;
  };
  rate_limiting: {
    requests_per_minute: number;
    requests_per_hour: number;
    global_per_minute: number;
  };
  circuit_breaker: {
    failure_threshold: number;
    cooldown_hours: number;
  };
  performance: {
    ingestion_latency_target: number;
    classification_latency_target: number;
    end_to_end_target: number;
    webhook_response_target: number;
  };
}

// =============================================================================
// Route Handler
// =============================================================================

export async function GET() {
  try {
    // Read thresholds.yml from config directory (copied by prebuild script)
    const configPath = path.join(process.cwd(), 'config', 'thresholds.yml');
    const fileContents = fs.readFileSync(configPath, 'utf8');

    // Parse YAML to JSON
    const config = yaml.load(fileContents) as ThresholdsConfig;

    // Return JSON response with cache headers
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error reading thresholds config:', error);

    // Check if file not found
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Config file not found', details: 'thresholds.yml is missing' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load config', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
