'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';

// =============================================================================
// Types and Validation
// =============================================================================

const INTAKE_TYPES = ['project', 'story', 'feedback'] as const;
type IntakeType = (typeof INTAKE_TYPES)[number];

const URGENCY_LEVELS = ['low', 'normal', 'urgent'] as const;

// Dynamic schema based on submission type
const baseSchema = z.object({
  type: z.enum(INTAKE_TYPES),
  contact: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
});

const projectSchema = baseSchema.extend({
  type: z.literal('project'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be under 120 characters'),
  description: z.string().min(50, 'Please provide at least 50 characters describing your project idea').max(5000, 'Description must be under 5000 characters'),
  problemStatement: z.string().min(20, 'Please describe the problem in at least 20 characters').max(1000, 'Problem statement must be under 1000 characters'),
  urgency: z.enum(URGENCY_LEVELS).optional(),
});

const storySchema = baseSchema.extend({
  type: z.literal('story'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be under 120 characters'),
  description: z.string().min(50, 'Please provide at least 50 characters describing your story').max(5000, 'Description must be under 5000 characters'),
  sourceUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  region: z.string().max(100, 'Region must be under 100 characters').optional(),
  urgency: z.enum(URGENCY_LEVELS).optional(),
});

const feedbackSchema = baseSchema.extend({
  type: z.literal('feedback'),
  message: z.string().min(10, 'Please provide at least 10 characters of feedback').max(5000, 'Feedback must be under 5000 characters'),
  category: z.enum(['bug', 'feature', 'content', 'other'] as const).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type StoryFormData = z.infer<typeof storySchema>;
type FeedbackFormData = z.infer<typeof feedbackSchema>;
type FormData = ProjectFormData | StoryFormData | FeedbackFormData;

// Response types for different submission types
interface StoryResponse {
  success: boolean;
  type: 'story';
  submissionId: string;
  queuedForPublishing: boolean;
  scores: {
    freedomRelevance: number;
    credibility: number;
  };
  thresholds?: {
    relevanceRequired: number;
    credibilityRequired: number;
  };
  notQueuedReasons?: string[];
  isSpam?: boolean;
  message: string;
}

interface ProjectResponse {
  success: boolean;
  type: 'project';
  submissionId: string;
  projectIdeaId: string | null;
  githubIssueUrl: string | null;
  githubIssueCreated: boolean;
  scores?: {
    feasibility: number;
    impact: number;
  };
  priority?: string;
  isSpam?: boolean;
  message: string;
}

interface FeedbackResponse {
  success: boolean;
  type: 'feedback';
  submissionId: string;
  githubIssueUrl: string | null;
  githubIssueCreated: boolean;
  category?: string;
  isSpam?: boolean;
  message: string;
}

type IntakeResponse = StoryResponse | ProjectResponse | FeedbackResponse | { success: boolean; id?: string; message?: string; error?: string };

// =============================================================================
// Honeypot Spam Prevention
// =============================================================================

// Honeypot field name - bots will fill this, humans won't see it
const HONEYPOT_FIELD = 'website_url';

// Minimum time (ms) a human would take to fill the form
const MIN_SUBMISSION_TIME = 3000; // 3 seconds

// =============================================================================
// Component
// =============================================================================

export default function IntakePage() {
  const [type, setType] = useState<IntakeType>('story');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<IntakeResponse | null>(null);

  // Honeypot and timing-based spam prevention
  const [honeypot, setHoneypot] = useState('');
  const [formLoadTime] = useState(() => Date.now());

  const handleTypeChange = (newType: IntakeType) => {
    setType(newType);
    setFormData({});
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): FormData | null => {
    const data = { type, ...formData };

    let schema;
    switch (type) {
      case 'project':
        schema = projectSchema;
        break;
      case 'story':
        schema = storySchema;
        break;
      case 'feedback':
        schema = feedbackSchema;
        break;
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return result.data as FormData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check - if filled, silently "succeed" (bot trap)
    if (honeypot) {
      // Fake success to confuse bots
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitResult({ success: true, id: 'LIB-RECEIVED' });
      return;
    }

    // Timing check - reject if form was submitted too quickly
    const timeSpent = Date.now() - formLoadTime;
    if (timeSpent < MIN_SUBMISSION_TIME) {
      setErrors({ _form: 'Please take a moment to review your submission before sending.' });
      return;
    }

    const validated = validateForm();
    if (!validated) return;

    setIsSubmitting(true);
    setErrors({});

    // Get webhook URL from environment
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_INTAKE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N webhook URL not configured');
      setErrors({ _form: 'Submission service is temporarily unavailable. Please try again later.' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate a client-side submission ID for user reference
      const submissionId = generateSubmissionId();

      // Prepare payload for n8n webhook
      const webhookPayload = {
        id: submissionId,
        submittedAt: new Date().toISOString(),
        channel: 'web',
        ...validated,
        // Normalize contact field
        contact: validated.contact || null,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (response.ok) {
        // Parse the response JSON from n8n workflow
        const responseData = await response.json().catch(() => null);
        if (responseData && responseData.success !== undefined) {
          setSubmitResult(responseData as IntakeResponse);
        } else {
          // Fallback if response doesn't match expected format
          setSubmitResult({ success: true, id: submissionId });
        }
      } else {
        // n8n may return error details
        const errorText = await response.text().catch(() => '');
        console.error('Webhook error:', response.status, errorText);
        setErrors({ _form: 'Submission failed. Please try again later.' });
      }
    } catch (error) {
      console.error('Webhook connection error:', error);
      setErrors({ _form: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a human-readable submission ID
  function generateSubmissionId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 4; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `LIB-${dateStr}-${random}`;
  }

  // Success state
  if (submitResult?.success) {
    const submissionId = 'submissionId' in submitResult ? submitResult.submissionId : ('id' in submitResult ? submitResult.id : undefined);
    const submissionType = 'type' in submitResult ? submitResult.type : undefined;

    return (
      <div className="matrix-bg min-h-screen">
        <div className="container container-narrow py-20">
          <div className="card card-glow text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-muted)]">
              <CheckIcon />
            </div>

            <h1 className="text-h1 mb-4">Submission Received</h1>

            <p className="text-body mb-6 text-[var(--fg-secondary)]">
              {'message' in submitResult && submitResult.message
                ? submitResult.message
                : 'Thank you for your contribution to freedom tech research.'}
            </p>

            {submissionId && (
              <div className="mb-6 rounded-md bg-[var(--bg-secondary)] p-4">
                <p className="text-mono text-sm text-[var(--fg-tertiary)]">Submission ID</p>
                <p className="text-mono text-[var(--accent-primary)]">{submissionId}</p>
              </div>
            )}

            {/* Story-specific results */}
            {submissionType === 'story' && 'scores' in submitResult && (() => {
              const storyResult = submitResult as StoryResponse;

              // Don't show detailed results for spam
              if (storyResult.isSpam) {
                return null;
              }

              return (
                <div className="mb-6 space-y-4">
                  <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-left">
                    <h3 className="text-sm font-medium text-[var(--fg-primary)] mb-3">Analysis Results</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--fg-tertiary)]">Relevance Score</p>
                        <p className="text-mono text-[var(--fg-primary)]">{storyResult.scores.freedomRelevance}/100</p>
                      </div>
                      <div>
                        <p className="text-[var(--fg-tertiary)]">Credibility Score</p>
                        <p className="text-mono text-[var(--fg-primary)]">{storyResult.scores.credibility}/100</p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-md p-4 ${storyResult.queuedForPublishing ? 'bg-[var(--accent-muted)]' : 'bg-[var(--bg-tertiary)]'}`}>
                    {storyResult.queuedForPublishing ? (
                      <p className="text-sm text-[var(--accent-primary)]">
                        Your story has been queued for publishing review.
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm text-[var(--fg-secondary)] mb-2">
                          Story did not meet auto-publishing thresholds.
                        </p>
                        {storyResult.notQueuedReasons && storyResult.notQueuedReasons.length > 0 && (
                          <ul className="text-xs text-[var(--fg-tertiary)] list-disc list-inside">
                            {storyResult.notQueuedReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Project-specific results */}
            {submissionType === 'project' && 'githubIssueCreated' in submitResult && (() => {
              const projectResult = submitResult as ProjectResponse;

              // Don't show detailed results for spam
              if (projectResult.isSpam) {
                return null;
              }

              return (
                <div className="mb-6 space-y-4">
                  {projectResult.scores && (
                    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-left">
                      <h3 className="text-sm font-medium text-[var(--fg-primary)] mb-3">Analysis Results</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[var(--fg-tertiary)]">Feasibility Score</p>
                          <p className="text-mono text-[var(--fg-primary)]">{projectResult.scores.feasibility}/100</p>
                        </div>
                        <div>
                          <p className="text-[var(--fg-tertiary)]">Impact Score</p>
                          <p className="text-mono text-[var(--fg-primary)]">{projectResult.scores.impact}/100</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {projectResult.githubIssueCreated && projectResult.githubIssueUrl ? (
                    <div className="rounded-md bg-[var(--accent-muted)] p-4">
                      <p className="text-sm text-[var(--fg-secondary)] mb-2">
                        A GitHub issue has been created to track your project idea.
                      </p>
                      <a
                        href={projectResult.githubIssueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mono text-sm text-[var(--accent-primary)] hover:underline break-all"
                      >
                        {projectResult.githubIssueUrl}
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-md bg-[var(--bg-tertiary)] p-4">
                      <p className="text-sm text-[var(--fg-secondary)]">
                        GitHub issue creation is pending. Your project idea has been recorded.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Feedback-specific results */}
            {submissionType === 'feedback' && 'githubIssueCreated' in submitResult && (() => {
              const feedbackResult = submitResult as FeedbackResponse;

              // Don't show detailed results for spam
              if (feedbackResult.isSpam) {
                return null;
              }

              return (
                <div className="mb-6">
                  {feedbackResult.githubIssueCreated && feedbackResult.githubIssueUrl ? (
                    <div className="rounded-md bg-[var(--accent-muted)] p-4">
                      <p className="text-sm text-[var(--fg-secondary)] mb-2">
                        A tracking issue has been created for your feedback.
                      </p>
                      <a
                        href={feedbackResult.githubIssueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mono text-sm text-[var(--accent-primary)] hover:underline break-all"
                      >
                        {feedbackResult.githubIssueUrl}
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-md bg-[var(--bg-tertiary)] p-4">
                      <p className="text-sm text-[var(--fg-secondary)]">
                        Your feedback has been recorded. A tracking issue will be created.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setSubmitResult(null);
                  setFormData({});
                }}
                className="btn btn-secondary"
              >
                Submit Another
              </button>
              <Link href="/posts" className="btn btn-primary">
                Browse Posts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix-bg min-h-screen">
      <main className="container container-narrow py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 pt-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-mono text-[var(--accent-primary)]">{'>'} intake</span>
            <span className="terminal-cursor inline-block h-4 w-2 bg-[var(--accent-primary)]" />
          </div>

          <h1 className="text-h1 mb-4">Submit a Signal</h1>

          <p className="text-body text-[var(--fg-secondary)]">
            Share project ideas, stories about freedom tech, or feedback on our platform.
            Every submission is reviewed by the Libertas AI agent research pipeline.
          </p>
        </div>

        {/* Type Selector */}
        <div className="mb-8">
          <label className="mb-3 block text-small font-medium text-[var(--fg-primary)]">
            What are you submitting?
          </label>
          <div className="flex flex-wrap gap-2">
            {INTAKE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`btn ${type === t ? 'btn-primary' : 'btn-ghost'}`}
              >
                <TypeIcon type={t} />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field - hidden from humans, bots will fill it */}
          <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px]">
            <label htmlFor={HONEYPOT_FIELD}>
              Leave this field empty
            </label>
            <input
              type="text"
              id={HONEYPOT_FIELD}
              name={HONEYPOT_FIELD}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Global Error */}
          {errors._form && (
            <div className="rounded-md border border-[var(--error)] bg-[var(--error)]/10 p-4">
              <p className="text-sm text-[var(--error)]">{errors._form}</p>
            </div>
          )}

          {/* Dynamic Fields */}
          {type === 'project' && (
            <ProjectFields
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}

          {type === 'story' && (
            <StoryFields
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}

          {type === 'feedback' && (
            <FeedbackFields
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}

          {/* Contact Field (all types) */}
          <FormField
            id="contact"
            label="Contact (optional)"
            type="email"
            value={formData.contact || ''}
            onChange={(v) => handleInputChange('contact', v)}
            error={errors.contact}
            placeholder="email@example.com"
            hint="Only if you're interested in potential follow ups. We'll never share or sell your email."
          />

          {/* Urgency (project and story only) */}
          {(type === 'project' || type === 'story') && (
            <div>
              <label className="mb-2 block text-small font-medium text-[var(--fg-primary)]">
                Urgency (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleInputChange('urgency', level)}
                    className={`btn ${formData.urgency === level ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--fg-tertiary)]">
                Mark urgent only for time-sensitive information (e.g., active censorship events).
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--fg-primary)]">
              <LockIcon />
              Privacy Notice
            </h3>
            <ul className="space-y-1 text-xs text-[var(--fg-tertiary)]">
              <li>We store submission content to review and potentially publish insights.</li>
              <li>We do not store IP addresses or browser fingerprints.</li>
              <li>Your email (if provided) is only used for follow-up and never shared.</li>
              <li>Published content is anonymized unless you explicitly request attribution.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  Submitting...
                </>
              ) : (
                <>
                  <SendIcon />
                  Submit Signal
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// =============================================================================
// Form Field Components
// =============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'url' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  hint,
  required,
  rows = 4,
}: FormFieldProps) {
  const inputClasses = `input ${error ? 'border-[var(--error)]' : ''}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-small font-medium text-[var(--fg-primary)]">
        {label}
        {required && <span className="text-[var(--error)]"> *</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClasses} textarea`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}

      {error && <p className="mt-1 text-xs text-[var(--error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--fg-tertiary)]">{hint}</p>}
    </div>
  );
}

interface FieldsProps {
  formData: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

function ProjectFields({ formData, errors, onChange }: FieldsProps) {
  return (
    <>
      <FormField
        id="title"
        label="Project Title"
        value={formData.title || ''}
        onChange={(v) => onChange('title', v)}
        error={errors.title}
        placeholder="e.g., Mesh Network Bitcoin Wallet"
        required
      />

      <FormField
        id="problemStatement"
        label="Problem Statement"
        type="textarea"
        value={formData.problemStatement || ''}
        onChange={(v) => onChange('problemStatement', v)}
        error={errors.problemStatement}
        placeholder="What problem does this project solve? Who is affected?"
        hint="Describe the specific challenge or threat this addresses."
        required
        rows={3}
      />

      <FormField
        id="description"
        label="Proposed Solution"
        type="textarea"
        value={formData.description || ''}
        onChange={(v) => onChange('description', v)}
        error={errors.description}
        placeholder="Describe your project idea in detail. What would it do? How would it work?"
        required
        rows={6}
      />
    </>
  );
}

function StoryFields({ formData, errors, onChange }: FieldsProps) {
  return (
    <>
      <FormField
        id="title"
        label="Story Title"
        value={formData.title || ''}
        onChange={(v) => onChange('title', v)}
        error={errors.title}
        placeholder="e.g., Activists Using Signal in Myanmar"
        required
      />

      <FormField
        id="description"
        label="Story Details"
        type="textarea"
        value={formData.description || ''}
        onChange={(v) => onChange('description', v)}
        error={errors.description}
        placeholder="Describe what happened, who was involved, and why it matters for freedom tech."
        hint="Include as much detail as you can. This helps improve publications."
        required
        rows={6}
      />

      <FormField
        id="sourceUrl"
        label="Source URL (optional)"
        type="url"
        value={formData.sourceUrl || ''}
        onChange={(v) => onChange('sourceUrl', v)}
        error={errors.sourceUrl}
        placeholder="https://example.com/article"
        hint="Link to a news article, social media post, or other source about the story."
      />

      <FormField
        id="region"
        label="Region/Location (optional)"
        value={formData.region || ''}
        onChange={(v) => onChange('region', v)}
        error={errors.region}
        placeholder="e.g., Southeast Asia, Venezuela, Global, Online"
      />
    </>
  );
}

function FeedbackFields({ formData, errors, onChange }: FieldsProps) {
  const categories = ['bug', 'feature', 'content', 'other'] as const;

  return (
    <>
      <div>
        <label className="mb-2 block text-small font-medium text-[var(--fg-primary)]">
          Category (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange('category', cat)}
              className={`btn ${formData.category === cat ? 'btn-primary' : 'btn-ghost'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <FormField
        id="message"
        label="Your Feedback"
        type="textarea"
        value={formData.message || ''}
        onChange={(v) => onChange('message', v)}
        error={errors.message}
        placeholder="Tell us what's on your mind. Bug reports, feature requests, content suggestions - all welcome."
        required
        rows={6}
      />
    </>
  );
}

// =============================================================================
// Icons
// =============================================================================

function TypeIcon({ type }: { type: IntakeType }) {
  switch (type) {
    case 'project':
      return (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case 'story':
      return (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      );
    case 'feedback':
      return (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

function CheckIcon() {
  return (
    <svg className="h-8 w-8 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="icon icon-sm animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}
