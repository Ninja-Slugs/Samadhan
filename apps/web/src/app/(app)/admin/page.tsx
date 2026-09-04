"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api/client";
import type { Paginated, ProblemListItem } from "@/lib/types";

interface Metrics {
  totalProblems: number;
  byStatus: Record<string, number>;
  underReview: number;
  verified: number;
  activeProjects: number;
  completedProjects: number;
  registeredCitizens: number;
}

const TILE_TONES = [
  "text-[var(--ink)]",
  "text-[var(--saffron)]",
  "text-[var(--accent)]",
  "text-sky-600",
  "text-violet-600",
  "text-[var(--ink)]"
];

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);

  useEffect(() => {
    apiRequest<Metrics>("/admin/metrics")
      .then(setMetrics)
      .catch(() => undefined);
    apiRequest<Paginated<ProblemListItem>>("/problems", {
      query: { pageSize: 100 }
    })
      .then((page) => setProblems(page.data))
      .catch(() => undefined);
  }, []);

  const tiles = metrics
    ? [
        { label: "Total problems", value: metrics.totalProblems },
        { label: "Awaiting review", value: metrics.underReview },
        { label: "Verified", value: metrics.verified },
        { label: "Active projects", value: metrics.activeProjects },
        { label: "Completed projects", value: metrics.completedProjects },
        { label: "Registered citizens", value: metrics.registeredCitizens }
      ]
    : [];

  const districts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const problem of problems) {
      if (!problem.district) continue;
      counts.set(problem.district, (counts.get(problem.district) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [problems]);

  const maxDistrictCount = districts[0]?.[1] ?? 1;
  const maxStatusCount = metrics
    ? Math.max(1, ...Object.values(metrics.byStatus))
    : 1;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-widest text-[var(--accent)]">
            JHARKHAND COMMAND CENTER
          </p>
          <h1 className="mt-1 text-2xl font-black text-[var(--ink)]">
            Real-time insights, real-world impact
          </h1>
        </div>
        <Link
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          href="/admin/review"
        >
          Open review queue
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile, index) => (
          <Card key={tile.label}>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase">
              {tile.label}
            </p>
            <p
              className={`mt-1 text-3xl font-black ${TILE_TONES[index % TILE_TONES.length]}`}
            >
              {tile.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {metrics ? (
          <Card>
            <h2 className="font-bold text-[var(--ink)]">
              Problems by status
            </h2>
            <div className="mt-3 grid gap-2.5">
              {Object.entries(metrics.byStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-[var(--ink)]">
                      {status.replace("_", " ")}
                    </span>
                    <span className="font-semibold text-[var(--muted)]">
                      {count}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[var(--panel-soft)]">
                    <div
                      className="h-2 rounded-full bg-[var(--accent)]"
                      style={{
                        width: `${Math.max(4, (count / maxStatusCount) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--ink)]">District overview</h2>
            <Link
              className="text-xs font-bold text-[var(--accent)]"
              href="/challenges"
            >
              View all districts
            </Link>
          </div>
          {districts.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              No district data yet.
            </p>
          ) : (
            <div className="mt-3 grid gap-2.5">
              {districts.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--ink)]">{name}</span>
                    <span className="font-semibold text-[var(--muted)]">
                      {count}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[var(--panel-soft)]">
                    <div
                      className="h-2 rounded-full bg-[var(--saffron)]"
                      style={{
                        width: `${Math.max(4, (count / maxDistrictCount) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
