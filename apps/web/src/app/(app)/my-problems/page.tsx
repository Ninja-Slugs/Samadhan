"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api/client";
import type { Paginated, ProblemListItem } from "@/lib/types";

export default function MyProblemsPage() {
  const [items, setItems] = useState<ProblemListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(next?: string) {
    const page = await apiRequest<Paginated<ProblemListItem>>(
      "/problems/mine",
      { query: { pageSize: 20, cursor: next } }
    );
    setItems((current) => (next ? [...current, ...page.data] : page.data));
    setCursor(page.meta.nextCursor);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-black">My reports</h1>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--muted)]">
            You have not reported anything yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {items.map((problem) => (
            <Link
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3 hover:bg-[var(--panel-soft)]"
              href={`/track/${problem.publicId}`}
              key={problem.id}
            >
              <div>
                <p className="text-sm font-semibold">{problem.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {problem.publicId} -{" "}
                  {new Date(problem.createdAt).toLocaleDateString()}
                  {problem.priorityScore != null
                    ? ` - priority ${problem.priorityScore}`
                    : ""}
                </p>
              </div>
              <StatusBadge status={problem.status} />
            </Link>
          ))}
        </div>
      )}
      {cursor ? (
        <button
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() => load(cursor)}
          type="button"
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}
