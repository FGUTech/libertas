import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// =============================================================================
// Types
// =============================================================================

interface Source {
  name: string;
  type: 'rss' | 'web' | 'x_account' | 'nostr' | 'github' | 'email';
  url: string;
  tier: number;
  tags: string[];
  enabled: boolean;
}

interface SourcesConfig {
  sources: Source[];
}

// =============================================================================
// Route Handler
// =============================================================================

export async function GET() {
  try {
    // Read sources.yml from config directory (copied by prebuild script)
    const configPath = path.join(process.cwd(), 'config', 'sources.yml');
    const fileContents = fs.readFileSync(configPath, 'utf8');

    // Parse YAML to JSON
    const config = yaml.load(fileContents) as SourcesConfig;

    // Return JSON response with cache headers
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error reading sources config:', error);

    // Check if file not found
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Config file not found', details: 'sources.yml is missing' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load config', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
