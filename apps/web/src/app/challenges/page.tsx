"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { Card, Select, StatusBadge } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api/client";
import type { Paginated, ProblemListItem } from "@/lib/types";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700"
};

function severityLabel(severity: string | null): string {
  if (!severity) return "Unrated";
  return severity[0].toUpperCase() + severity.slice(1);
}

export default function ChallengesPage() {
  const [items, setItems] = useState<ProblemListItem[]>([]);
  const [allItems, setAllItems] = useState<ProblemListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorySlug, setCategorySlug] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    apiRequest<Category[]>("/categories", { auth: false })
      .then(setCategories)
      .catch(() => undefined);
    // Unfiltered snapshot, used only to build the district counts sidebar.
    apiRequest<Paginated<ProblemListItem>>("/problems", {
      auth: false,
      query: { sort: "priority", pageSize: 100 }
    })
      .then((page) => setAllItems(page.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    apiRequest<Paginated<ProblemListItem>>("/problems", {
      auth: false,
      query: {
        sort: "priority",
        pageSize: 40,
        categorySlug: categorySlug || undefined,
        district: district || undefined
      }
    })
      .then((page) => setItems(page.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [categorySlug, district]);

  const districts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allItems) {
      if (!item.district) continue;
      counts.set(item.district, (counts.get(item.district) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [allItems]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link className="flex items-center gap-2 font-black" href="/">
        <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
        SAMADHAN
      </Link>
      <p className="mt-8 text-xs font-black tracking-widest text-[var(--accent)]">
        PROBLEM INTELLIGENCE
      </p>
      <h1 className="mt-1 text-3xl font-black text-[var(--ink)]">
        Explore problem clusters across Jharkhand
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Problems that government has validated, ranked by a transparent
        priority score. Universities can take these on.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          className="max-w-xs"
          onChange={(e) => setCategorySlug(e.target.value)}
          value={categorySlug}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          className="max-w-xs"
          onChange={(e) => setDistrict(e.target.value)}
          value={district}
        >
          <option value="">All districts</option>
          {districts.map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="grid gap-3">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading...</p>
          ) : items.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">
                No verified challenges match these filters yet.
              </p>
            </Card>
          ) : (
            items.map((problem) => (
              <Link
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 hover:bg-[var(--panel-soft)]"
                href={`/problems/${problem.publicId}`}
                key={problem.id}
              >
                <div>
                  <p className="font-semibold text-[var(--ink)]">
                    {problem.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
                    {problem.category ?? "Uncategorised"}
                    {problem.district ? (
                      <>
                        <MapPin className="h-3 w-3" /> {problem.district}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {problem.priorityScore != null ? (
                    <span className="text-sm font-black text-[var(--ink)]">
                      {problem.priorityScore}
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      SEVERITY_STYLE[problem.severity ?? ""] ??
                      "bg-[var(--panel-soft)] text-[var(--muted)]"
                    }`}
                  >
                    {severityLabel(problem.severity)}
                  </span>
                  <StatusBadge status={problem.status} />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* District summary */}
        <aside className="h-fit rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <p className="text-sm font-black text-[var(--ink)]">
            By district
          </p>
          {districts.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--muted)]">
              No district data yet.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {districts.map(([name, count]) => (
                <li key={name}>
                  <button
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm ${
                      district === name
                        ? "bg-[var(--accent)] text-white"
                        : "hover:bg-[var(--panel-soft)]"
                    }`}
                    onClick={() =>
                      setDistrict((current) =>
                        current === name ? "" : name
                      )
                    }
                    type="button"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="h-3.5 w-3.5" /> {name}
                    </span>
                    <span className="font-black">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
