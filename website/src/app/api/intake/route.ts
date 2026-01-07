import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =============================================================================
// Request Validation Schema
// =============================================================================

const INTAKE_TYPES = ['project', 'story', 'feedback'] as const;
const URGENCY_LEVELS = ['low', 'normal', 'urgent'] as const;
const FEEDBACK_CATEGORIES = ['bug', 'feature', 'content', 'other'] as const;

const baseSchema = z.object({
  type: z.enum(INTAKE_TYPES),
  contact: z.string().email().optional().or(z.literal('')),
});

const projectSchema = baseSchema.extend({
  type: z.literal('project'),
  title: z.string().min(5).max(120),
  description: z.string().min(50).max(5000),
  problemStatement: z.string().min(20).max(1000),
  urgency: z.enum(URGENCY_LEVELS).optional(),
});

const storySchema = baseSchema.extend({
  type: z.literal('story'),
  title: z.string().min(5).max(120),
  description: z.string().min(50).max(5000),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  region: z.string().max(100).optional(),
  urgency: z.enum(URGENCY_LEVELS).optional(),
});

const feedbackSchema = baseSchema.extend({
  type: z.literal('feedback'),
  message: z.string().min(10).max(5000),
  category: z.enum(FEEDBACK_CATEGORIES).optional(),
});

const intakeSchema = z.discriminatedUnion('type', [projectSchema, storySchema, feedbackSchema]);

// =============================================================================
// Route Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const parseResult = intakeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid submission data',
          details: parseResult.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Generate submission ID
    const submissionId = generateSubmissionId();

    // Prepare payload for n8n webhook
    const webhookPayload = {
      id: submissionId,
      submittedAt: new Date().toISOString(),
      channel: 'web',
      ...data,
      // Normalize contact field
      contact: data.contact || null,
    };

    // Check if n8n webhook is configured
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (webhookUrl) {
      // Forward to n8n webhook
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          console.error('n8n webhook error:', webhookResponse.status, await webhookResponse.text());
          // Don't fail the request if n8n has issues - we still have the data
        }
      } catch (webhookError) {
        console.error('n8n webhook connection error:', webhookError);
        // Don't fail the request - n8n might be temporarily unavailable
      }
    } else {
      // Log submission for development
      console.log('Intake submission (N8N_WEBHOOK_URL not configured):', webhookPayload);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      id: submissionId,
      message: 'Submission received successfully',
    });
  } catch (error) {
    console.error('Intake API error:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate a human-readable submission ID
 * Format: LIB-YYYYMMDD-XXXX (e.g., LIB-20260107-A3K9)
 */
function generateSubmissionId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = generateRandomString(4);
  return `LIB-${dateStr}-${random}`;
}

/**
 * Generate a random alphanumeric string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars (0, O, 1, I)
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
