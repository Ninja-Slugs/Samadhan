"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api/client";

interface Metrics {
  totalProblems: number;
  byStatus: Record<string, number>;
  underReview: number;
  verified: number;
  activeProjects: number;
  completedProjects: number;
  registeredCitizens: number;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    apiRequest<Metrics>("/admin/metrics")
      .then(setMetrics)
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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Operations overview</h1>
        <Link
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          href="/admin/review"
        >
          Open review queue
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase">
              {tile.label}
            </p>
            <p className="mt-1 text-3xl font-black">{tile.value}</p>
          </Card>
        ))}
      </div>
      {metrics ? (
        <Card>
          <h2 className="font-bold">Problems by status</h2>
          <div className="mt-3 grid gap-1.5 text-sm">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div className="flex justify-between" key={status}>
                <span className="capitalize">{status.replace("_", " ")}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
