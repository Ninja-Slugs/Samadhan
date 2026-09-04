"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui/primitives";
import { ApiError, apiRequest } from "@/lib/api/client";

interface MatchReason {
  code: string;
  detail: string;
  points: number;
}

interface UniversityMatch {
  universityId: string;
  name: string;
  district: string | null;
  state: string | null;
  score: number;
  capacityScore: number;
  reasons: MatchReason[];
}

export default function UniversityMatchingPage() {
  const params = useParams<{ publicId: string }>();
  const router = useRouter();
  const [matches, setMatches] = useState<UniversityMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<UniversityMatch[]>(
      `/universities/match/${params.publicId}`
    )
      .then((data) => setMatches(data.sort((a, b) => b.score - a.score)))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load matches.");
      });
  }, [params.publicId]);

  async function assign(match: UniversityMatch) {
    setAssigning(match.universityId);
    setNotice(null);
    setError(null);
    try {
      await apiRequest(`/admin/problems/${params.publicId}/transition`, {
        method: "POST",
        body: {
          toStatus: "assigned",
          note: `Assigned to ${match.name} via AI matching (score ${match.score}/100).`
        }
      });
      setNotice(`Marked as assigned to ${match.name}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not assign.");
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div>
      <Link
        className="text-sm font-semibold text-[var(--accent)]"
        href="/admin/review"
      >
        &larr; Back to review queue
      </Link>
      <h1 className="mt-3 text-2xl font-black text-[var(--ink)]">
        Top university matches
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Based on AI analysis, here are the best matched institutions to solve
        this challenge.
      </p>

      {error ? <Alert className="mt-4" tone="error">{error}</Alert> : null}
      {notice ? <Alert className="mt-4" tone="success">{notice}</Alert> : null}

      {matches === null ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading matches...</p>
      ) : matches.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-[var(--muted)]">
            No active universities registered yet.
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card className="flex flex-col gap-3" key={match.universityId}>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--panel-soft)] text-[var(--accent)]">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-black text-[var(--ink)]">{match.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {[match.district, match.state].filter(Boolean).join(", ") ||
                      "Location not set"}
                  </p>
                </div>
              </div>

              <p className="text-2xl font-black text-[var(--accent)]">
                {match.score}% Match
              </p>

              <ul className="grid gap-1 text-xs text-[var(--muted)]">
                {match.reasons.map((reason) => (
                  <li key={reason.code}>
                    - {reason.detail} (+{reason.points})
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  disabled={assigning === match.universityId}
                  onClick={() => assign(match)}
                  type="button"
                >
                  {assigning === match.universityId
                    ? "Assigning..."
                    : "Assign this university"}
                </Button>
                <Button
                  onClick={() => router.push(`/problems/${params.publicId}`)}
                  type="button"
                  variant="ghost"
                >
                  View problem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
