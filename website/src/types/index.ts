/**
 * Core TypeScript types for the Libertas website
 */

// Post types
export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  citations: Citation[];
  freedomRelevanceScore: number;
  credibilityScore: number;
}

export interface Citation {
  url: string;
  title: string;
  source: string;
  accessedAt: string;
}

// User types
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  starknetAddress?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  avatarUrl?: string;
  bio?: string;
}

// Reaction types
export type ReactionType = 'like' | 'dislike';

export interface Reaction {
  id: string;
  userId: string;
  postSlug: string;
  type: ReactionType;
  starknetTxHash?: string;
  createdAt: string;
}

export interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction?: ReactionType;
}

// Comment types
export interface Comment {
  id: string;
  userId: string;
  postSlug: string;
  parentId?: string;
  content: string;
  starknetTxHash?: string;
  createdAt: string;
  updatedAt?: string;
  author?: UserProfile;
  replies?: Comment[];
}

// Intake types
export type IntakeType = 'project' | 'story' | 'feedback';
export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface IntakeSubmission {
  type: IntakeType;
  title: string;
  description: string;
  contact?: string;
  urgency?: UrgencyLevel;
}

export interface IntakeResponse {
  success: boolean;
  id?: string;
  error?: string;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
