"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api/client";
import type { Paginated, ProblemListItem } from "@/lib/types";

export default function ChallengesPage() {
  const [items, setItems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Paginated<ProblemListItem>>("/problems", {
      auth: false,
      query: { sort: "priority", pageSize: 30 }
    })
      .then((page) => setItems(page.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link className="flex items-center gap-2 font-black" href="/">
        <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
        SAMADHAN
      </Link>
      <h1 className="mt-8 text-3xl font-black">Verified civic challenges</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Problems that government has validated, ranked by a transparent priority
        score. Universities can take these on.
      </p>

      <div className="mt-8 grid gap-3">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        ) : items.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--muted)]">
              No verified challenges yet.
            </p>
          </Card>
        ) : (
          items.map((problem) => (
            <Link
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 hover:bg-[var(--panel-soft)]"
              href={`/problems/${problem.publicId}`}
              key={problem.id}
            >
              <div>
                <p className="font-semibold">{problem.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {problem.category ?? "Uncategorised"}
                  {problem.district ? ` - ${problem.district}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {problem.priorityScore != null ? (
                  <span className="text-sm font-black">
                    {problem.priorityScore}
                  </span>
                ) : null}
                <StatusBadge status={problem.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
