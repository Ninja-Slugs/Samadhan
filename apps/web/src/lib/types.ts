export interface ProblemListItem {
  id: string;
  publicId: string;
  title: string;
  status: string;
  category: string | null;
  district: string | null;
  severity: string | null;
  priorityScore: number | null;
  createdAt: string;
}

export interface PriorityComponent {
  key: string;
  label: string;
  value: number;
  max: number;
  reason: string;
}

export interface ProblemDetail {
  publicId: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  severity: string | null;
  urgencyLevel: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  priorityScore: number | null;
  priorityExplanation: {
    finalScore?: number;
    components?: PriorityComponent[];
    explanation?: { summary: string; reasons: string[] };
    summary?: string;
    reasons?: string[];
  } | null;
  createdAt: string;
  mediaCount: number;
  timeline: Array<{
    status: string;
    label: string;
    reachedAt: string | null;
    current: boolean;
  }>;
  peopleAffected?: number | null;
  rejectionReason?: string | null;
  ai?: {
    status?: string;
    summary: string | null;
    uncertainties: string[];
    confidenceScore: number | null;
    label?: string;
  } | null;
}

export interface Paginated<T> {
  data: T[];
  meta: { pageSize: number; nextCursor: string | null };
}
