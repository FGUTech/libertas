import * as fs from 'fs';
import * as path from 'path';
import { NextResponse } from 'next/server';

// =============================================================================
// Types
// =============================================================================

export interface AgentPrompt {
  name: string;
  content: string;
}

// =============================================================================
// Agent File Reader
// =============================================================================

/**
 * Reads an agent prompt file and returns its content.
 * Used by /api/agents/* routes to serve agent prompts dynamically.
 */
export function readAgentPrompt(agentName: string): AgentPrompt {
  const agentPath = path.join(process.cwd(), 'agents', `${agentName}.md`);
  const content = fs.readFileSync(agentPath, 'utf8');

  return {
    name: agentName,
    content,
  };
}

/**
 * Creates a NextResponse for an agent prompt with proper caching headers.
 */
export function createAgentResponse(agentName: string): NextResponse {
  try {
    const prompt = readAgentPrompt(agentName);

    return NextResponse.json(prompt, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error(`Error reading agent prompt '${agentName}':`, error);

    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Agent prompt not found', details: `${agentName}.md is missing` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load agent prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
