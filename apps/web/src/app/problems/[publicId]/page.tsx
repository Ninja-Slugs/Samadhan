"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/primitives";
import { ProblemDetailView } from "@/components/problems/problem-detail-view";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { ProblemDetail } from "@/lib/types";

export default function PublicProblemPage({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ProblemDetail>(`/problems/${publicId}`, { auth: false })
      .then(setProblem)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load problem."
        )
      );
  }, [publicId]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link className="flex items-center gap-2 font-black" href="/challenges">
        <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
        SAMADHAN
      </Link>
      <div className="mt-8">
        {error ? (
          <Alert tone="error">{error}</Alert>
        ) : !problem ? (
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        ) : (
          <ProblemDetailView problem={problem} />
        )}
      </div>
    </main>
  );
}
