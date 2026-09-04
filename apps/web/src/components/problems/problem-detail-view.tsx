import { Card, StatusBadge } from "@/components/ui/primitives";
import type { ProblemDetail } from "@/lib/types";

export function ProblemDetailView({ problem }: { problem: ProblemDetail }) {
  const explanation = problem.priorityExplanation;
  const components = explanation?.components ?? [];
  const reasons =
    explanation?.explanation?.reasons ?? explanation?.reasons ?? [];

  return (
    <div className="grid gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black">{problem.title}</h1>
          <StatusBadge status={problem.status} />
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {problem.publicId}
          {problem.category ? ` - ${problem.category}` : ""}
          {problem.district ? ` - ${problem.district}` : ""}
        </p>
      </div>

      {problem.rejectionReason ? (
        <Card className="border-[var(--danger)]/40">
          <p className="text-sm font-semibold text-[var(--danger)]">
            Not accepted
          </p>
          <p className="mt-1 text-sm">{problem.rejectionReason}</p>
        </Card>
      ) : null}

      <Card>
        <h2 className="font-bold">Description</h2>
        <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--muted)]">
          {problem.description}
        </p>
      </Card>

      <Card>
        <h2 className="font-bold">Progress timeline</h2>
        <ol className="mt-4 grid gap-3">
          {problem.timeline.map((step) => (
            <li className="flex items-start gap-3" key={step.status}>
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  step.reachedAt ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-semibold ${
                    step.current ? "text-[var(--accent)]" : ""
                  }`}
                >
                  {step.label}
                </p>
                {step.reachedAt ? (
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(step.reachedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {problem.priorityScore != null ? (
        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Priority score</h2>
            <span className="text-2xl font-black">
              {problem.priorityScore}
              <span className="text-sm text-[var(--muted)]">/100</span>
            </span>
          </div>
          {components.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {components.map((component) => (
                <div key={component.key}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{component.label}</span>
                    <span className="text-[var(--muted)]">
                      {component.value} / {component.max}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[var(--panel-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{
                        width: `${Math.min(100, (component.value / component.max) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {component.reason}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {reasons.length > 0 ? (
            <ul className="mt-4 list-disc pl-5 text-xs text-[var(--muted)]">
              {reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}

      {problem.ai ? (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">AI analysis</h2>
            <span className="text-xs font-semibold text-[var(--muted)]">
              {problem.ai.label ?? "AI-generated - advisory only"}
            </span>
          </div>
          {problem.ai.summary ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {problem.ai.summary}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Analysis {problem.ai.status ?? "pending"}.
            </p>
          )}
          {problem.ai.uncertainties?.length ? (
            <div className="mt-3">
              <p className="text-xs font-semibold">Known uncertainties</p>
              <ul className="mt-1 list-disc pl-5 text-xs text-[var(--muted)]">
                {problem.ai.uncertainties.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
