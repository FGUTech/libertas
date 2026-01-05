/**
 * LLM Service
 *
 * Handles interactions with LLM providers (Anthropic Claude, OpenAI).
 * All LLM outputs are validated against schemas before use.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  validateClassificationResult,
  validateSummarizerResult,
} from '../utils/validation.js';
import type {
  ClassificationResult,
  SummarizerResult,
  IdeaSynthesizerResult,
  DigestResult,
  IntakeClassificationResult,
} from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface LLMConfig {
  provider: 'anthropic' | 'openai';
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Load a prompt template from file
 */
export function loadPromptTemplate(promptName: string): string {
  const promptPath = join(__dirname, '..', '..', 'prompts', `${promptName}.md`);
  return readFileSync(promptPath, 'utf-8');
}

/**
 * Call the LLM API
 *
 * This is a generic function that works with both Anthropic and OpenAI.
 * In production, this would make actual API calls.
 */
async function callLLM(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string
): Promise<LLMResponse<unknown>> {
  // Validate API key is present
  if (!config.apiKey) {
    return {
      success: false,
      error: 'LLM API key not configured',
    };
  }

  try {
    if (config.provider === 'anthropic') {
      return await callAnthropic(config, systemPrompt, userMessage);
    } else if (config.provider === 'openai') {
      return await callOpenAI(config, systemPrompt, userMessage);
    } else {
      return {
        success: false,
        error: `Unknown LLM provider: ${config.provider}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown LLM error',
    };
  }
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string
): Promise<LLMResponse<unknown>> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: `Anthropic API error: ${response.status} - ${errorText}`,
    };
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;

  if (!content) {
    return {
      success: false,
      error: 'No content in Anthropic response',
    };
  }

  // Parse JSON from response
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
    const data = JSON.parse(jsonStr);

    return {
      success: true,
      data,
      usage: {
        promptTokens: result.usage?.input_tokens || 0,
        completionTokens: result.usage?.output_tokens || 0,
      },
    };
  } catch {
    return {
      success: false,
      error: 'Failed to parse JSON from LLM response',
    };
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string
): Promise<LLMResponse<unknown>> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4-turbo-preview',
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: `OpenAI API error: ${response.status} - ${errorText}`,
    };
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    return {
      success: false,
      error: 'No content in OpenAI response',
    };
  }

  try {
    const data = JSON.parse(content);
    return {
      success: true,
      data,
      usage: {
        promptTokens: result.usage?.prompt_tokens || 0,
        completionTokens: result.usage?.completion_tokens || 0,
      },
    };
  } catch {
    return {
      success: false,
      error: 'Failed to parse JSON from LLM response',
    };
  }
}

/**
 * Classify content using the Classifier agent
 */
export async function classifyContent(
  config: LLMConfig,
  input: {
    sourceUrl: string;
    extractedText: string;
    platform: string;
    author?: string;
    publishedAt?: string;
  }
): Promise<LLMResponse<ClassificationResult>> {
  const systemPrompt = loadPromptTemplate('classify');
  const userMessage = JSON.stringify(input, null, 2);

  const response = await callLLM(config, systemPrompt, userMessage);

  if (!response.success) {
    return response as LLMResponse<ClassificationResult>;
  }

  // Validate output against schema
  if (!validateClassificationResult(response.data)) {
    return {
      success: false,
      error: 'Classification result failed schema validation',
    };
  }

  return {
    success: true,
    data: response.data as ClassificationResult,
    usage: response.usage,
  };
}

/**
 * Summarize content using the Summarizer agent
 */
export async function summarizeContent(
  config: LLMConfig,
  input: {
    sourceUrl: string;
    extractedText: string;
    classification: ClassificationResult;
    includeDeepDive: boolean;
  }
): Promise<LLMResponse<SummarizerResult>> {
  const systemPrompt = loadPromptTemplate('summarize');
  const userMessage = JSON.stringify(input, null, 2);

  const response = await callLLM(config, systemPrompt, userMessage);

  if (!response.success) {
    return response as LLMResponse<SummarizerResult>;
  }

  // Validate output against schema
  if (!validateSummarizerResult(response.data)) {
    return {
      success: false,
      error: 'Summarizer result failed schema validation',
    };
  }

  return {
    success: true,
    data: response.data as SummarizerResult,
    usage: response.usage,
  };
}

/**
 * Generate project idea using the IdeaSynthesizer agent
 */
export async function generateProjectIdea(
  config: LLMConfig,
  input: {
    insights: Array<{
      title: string;
      topics: string[];
      geo?: string[];
      freedomRelevanceScore: number;
    }>;
    patterns: string[];
  }
): Promise<LLMResponse<IdeaSynthesizerResult>> {
  const systemPrompt = loadPromptTemplate('generate-idea');
  const userMessage = JSON.stringify(input, null, 2);

  const response = await callLLM(config, systemPrompt, userMessage);

  if (!response.success) {
    return response as LLMResponse<IdeaSynthesizerResult>;
  }

  // Basic validation (full schema validation would go here)
  const data = response.data as Record<string, unknown>;
  if (!data.problem_statement || !data.threat_model || !data.proposed_solution) {
    return {
      success: false,
      error: 'Idea synthesizer result missing required fields',
    };
  }

  return {
    success: true,
    data: response.data as IdeaSynthesizerResult,
    usage: response.usage,
  };
}

/**
 * Compose weekly digest using the DigestComposer agent
 */
export async function composeDigest(
  config: LLMConfig,
  input: {
    insights: Array<{
      id: string;
      title: string;
      tldr: string;
      topics: string[];
      freedomRelevanceScore: number;
      publishedUrl?: string;
    }>;
    projectIdeas?: Array<{
      id: string;
      problemStatement: string;
      status: string;
    }>;
    periodStart: string;
    periodEnd: string;
  }
): Promise<LLMResponse<DigestResult>> {
  const systemPrompt = loadPromptTemplate('digest');
  const userMessage = JSON.stringify(input, null, 2);

  const response = await callLLM(config, systemPrompt, userMessage);

  if (!response.success) {
    return response as LLMResponse<DigestResult>;
  }

  // Basic validation
  const data = response.data as Record<string, unknown>;
  if (!data.executive_tldr || !Array.isArray(data.sections)) {
    return {
      success: false,
      error: 'Digest result missing required fields',
    };
  }

  return {
    success: true,
    data: response.data as DigestResult,
    usage: response.usage,
  };
}

/**
 * Classify intake submission using the IntakeClassifier agent
 */
export async function classifyIntake(
  config: LLMConfig,
  input: {
    message: string;
    contact?: string;
    category?: string;
    safetyMode?: boolean;
  }
): Promise<LLMResponse<IntakeClassificationResult>> {
  const systemPrompt = loadPromptTemplate('intake-classify');
  const userMessage = JSON.stringify(input, null, 2);

  const response = await callLLM(config, systemPrompt, userMessage);

  if (!response.success) {
    return response as LLMResponse<IntakeClassificationResult>;
  }

  // Basic validation
  const data = response.data as Record<string, unknown>;
  if (!data.category || !data.risk_level || !data.summary) {
    return {
      success: false,
      error: 'Intake classification result missing required fields',
    };
  }

  return {
    success: true,
    data: response.data as IntakeClassificationResult,
    usage: response.usage,
  };
}
