'use client';

import { useState, useEffect } from 'react';
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

interface IntakeResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}

// =============================================================================
// Rate Limiting
// =============================================================================

const RATE_LIMIT_KEY = 'libertas_intake_submissions';
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 3; // Max 3 submissions per hour

function checkRateLimit(): { allowed: boolean; remaining: number; resetIn: number } {
  if (typeof window === 'undefined') return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: 0 };

  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const submissions: number[] = stored ? JSON.parse(stored) : [];
  const now = Date.now();

  // Filter to only recent submissions
  const recent = submissions.filter((ts: number) => now - ts < RATE_LIMIT_WINDOW);

  const remaining = Math.max(0, RATE_LIMIT_MAX - recent.length);
  const resetIn = recent.length > 0 ? Math.ceil((RATE_LIMIT_WINDOW - (now - recent[0])) / 1000 / 60) : 0;

  return {
    allowed: recent.length < RATE_LIMIT_MAX,
    remaining,
    resetIn,
  };
}

function recordSubmission(): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const submissions: number[] = stored ? JSON.parse(stored) : [];
  const now = Date.now();

  // Keep only recent + new
  const recent = submissions.filter((ts: number) => now - ts < RATE_LIMIT_WINDOW);
  recent.push(now);

  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
}

// =============================================================================
// Component
// =============================================================================

export default function IntakePage() {
  const [type, setType] = useState<IntakeType>('story');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<IntakeResponse | null>(null);
  const [rateLimit, setRateLimit] = useState({ allowed: true, remaining: RATE_LIMIT_MAX, resetIn: 0 });

  // Check rate limit on mount
  useEffect(() => {
    setRateLimit(checkRateLimit());
  }, []);

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

    // Check rate limit
    const limit = checkRateLimit();
    setRateLimit(limit);

    if (!limit.allowed) {
      setErrors({ _form: `Rate limit reached. Please try again in ${limit.resetIn} minutes.` });
      return;
    }

    const validated = validateForm();
    if (!validated) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const result: IntakeResponse = await response.json();

      if (result.success) {
        recordSubmission();
        setRateLimit(checkRateLimit());
        setSubmitResult(result);
      } else {
        setErrors({ _form: result.error || 'Submission failed. Please try again.' });
      }
    } catch {
      setErrors({ _form: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitResult?.success) {
    return (
      <div className="matrix-bg min-h-screen">
        <div className="container container-narrow py-20">
          <div className="card card-glow text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-muted)]">
              <CheckIcon />
            </div>

            <h1 className="text-h1 mb-4">Submission Received</h1>

            <p className="text-body mb-6 text-[var(--fg-secondary)]">
              Thank you for your contribution to freedom tech research. We review every submission and publish relevant insights.
            </p>

            {submitResult.id && (
              <div className="mb-6 rounded-md bg-[var(--bg-secondary)] p-4">
                <p className="text-mono text-sm text-[var(--fg-tertiary)]">Submission ID</p>
                <p className="text-mono text-[var(--accent-primary)]">{submitResult.id}</p>
              </div>
            )}

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
            Every submission is reviewed by our research pipeline.
          </p>
        </div>

        {/* Rate Limit Warning */}
        {!rateLimit.allowed && (
          <div className="mb-6 rounded-md border border-[var(--warning)] bg-[var(--warning)]/10 p-4">
            <p className="text-sm text-[var(--warning)]">
              Rate limit reached. You can submit again in {rateLimit.resetIn} minutes.
            </p>
          </div>
        )}

        {rateLimit.allowed && rateLimit.remaining <= 2 && (
          <div className="mb-6 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
            <p className="text-sm text-[var(--fg-secondary)]">
              {rateLimit.remaining} submission{rateLimit.remaining !== 1 ? 's' : ''} remaining this hour.
            </p>
          </div>
        )}

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
            hint="Only if you'd like us to follow up. We'll never share or sell your email."
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
              <li>You can request deletion by emailing privacy@libertas.fgu.tech</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitting || !rateLimit.allowed}
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
        hint="Include as much detail as you can. We verify all submissions before publishing."
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
        hint="Link to a news article, social media post, or other source."
      />

      <FormField
        id="region"
        label="Region/Location (optional)"
        value={formData.region || ''}
        onChange={(v) => onChange('region', v)}
        error={errors.region}
        placeholder="e.g., Southeast Asia, Global, Online"
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
