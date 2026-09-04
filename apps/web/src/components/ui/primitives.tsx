import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
        variant === "ghost" &&
          "border border-[var(--border)] hover:bg-[var(--panel-soft)]",
        variant === "danger" &&
          "bg-[var(--danger)] text-white hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-[var(--muted)]">{hint}</span>
      ) : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const controlClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlClass, "min-h-28 resize-y", props.className)}
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, props.className)} {...props} />;
}

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  validated: "Verified",
  prioritized: "Prioritised",
  assigned: "University assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Not accepted",
  duplicate: "Duplicate",
  archived: "Archived"
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-0.5 text-xs font-bold">
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function Alert({
  tone = "info",
  className,
  children
}: {
  tone?: "info" | "error" | "success";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "info" && "border-[var(--border)] bg-[var(--panel-soft)]",
        tone === "error" &&
          "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]",
        tone === "success" &&
          "border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]",
        className
      )}
    >
      {children}
    </div>
  );
}
