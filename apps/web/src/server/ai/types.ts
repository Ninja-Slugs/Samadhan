// Structured AI output contract (docs/AI_RULES.md). Unknown, missing or
// invalid provider output is an error and must never be silently turned
// into a confident recommendation.

export interface ProblemAnalysis {
  categorySlug: string | null;
  subcategoryGuess: string | null;
  severityGuess: "low" | "medium" | "high" | "critical" | null;
  urgencyGuess: "routine" | "elevated" | "urgent" | "emergency" | null;
  requiredExpertise: string[];
  suggestedSolutionAreas: string[];
  summary: string;
  reasons: string[];
  uncertainties: string[];
  confidenceScore: number; // 0..1
  needsReview: boolean;
  model: string;
}
