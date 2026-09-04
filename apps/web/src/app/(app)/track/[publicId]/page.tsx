"use client";

import { use, useEffect, useState } from "react";
import { Alert } from "@/components/ui/primitives";
import { ProblemDetailView } from "@/components/problems/problem-detail-view";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { ProblemDetail } from "@/lib/types";

export default function TrackProblemPage({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ProblemDetail>(`/problems/${publicId}`)
      .then(setProblem)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load.")
      );
  }, [publicId]);

  if (error) {
    return <Alert tone="error">{error}</Alert>;
  }
  if (!problem) {
    return <p className="text-sm text-[var(--muted)]">Loading...</p>;
  }
  return <ProblemDetailView problem={problem} />;
}
