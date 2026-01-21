import { createAgentResponse } from '@/lib/agents';

export async function GET() {
  return createAgentResponse('intake-story-classify');
}
