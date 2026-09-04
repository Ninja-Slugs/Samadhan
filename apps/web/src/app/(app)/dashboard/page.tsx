"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { useSessionUser } from "@/hooks/use-session-user";
import { apiRequest } from "@/lib/api/client";
import type { Paginated, ProblemListItem } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useSessionUser();
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    apiRequest<Paginated<ProblemListItem>>("/problems/mine", {
      query: { pageSize: 5 }
    })
      .then((page) => setProblems(page.data))
      .catch(() => undefined);
    apiRequest<{ count: number }>("/notifications/unread-count")
      .then((value) => setUnread(value.count))
      .catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">
            Welcome{user ? `, ${user.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {unread > 0
              ? `${unread} unread update${unread === 1 ? "" : "s"}.`
              : "You are all caught up."}
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          href="/report"
        >
          <Plus className="h-4 w-4" /> Report a problem
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Your recent reports</h2>
          <Link
            className="text-sm font-semibold text-[var(--accent)]"
            href="/my-problems"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-2">
          {problems.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No reports yet. Your first submission will appear here with a
              tracking ID.
            </p>
          ) : (
            problems.map((problem) => (
              <Link
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5 hover:bg-[var(--panel-soft)]"
                href={`/track/${problem.publicId}`}
                key={problem.id}
              >
                <div>
                  <p className="text-sm font-semibold">{problem.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {problem.publicId}
                    {problem.category ? ` - ${problem.category}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={problem.status} />
                  <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
