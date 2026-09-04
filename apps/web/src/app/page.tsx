import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  GaugeCircle,
  GraduationCap,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const STEPS = [
  {
    icon: MessageSquareWarning,
    title: "Citizen reports a problem",
    body: "Text, photos and location. A unique tracking ID is issued immediately."
  },
  {
    icon: Sparkles,
    title: "AI structures it",
    body: "Category, severity, likely expertise and a summary - advisory only, always reviewable."
  },
  {
    icon: ClipboardCheck,
    title: "Government verifies",
    body: "An admin validates, edits or rejects with a reason. Every decision is audited."
  },
  {
    icon: GaugeCircle,
    title: "Transparent prioritisation",
    body: "A 0-100 score from severity, urgency, people affected, duplicates and spread - with the reasons attached."
  },
  {
    icon: GraduationCap,
    title: "Universities take the challenge",
    body: "Matched on expertise, capacity and proximity. Students and faculty form a team."
  },
  {
    icon: MapPin,
    title: "Citizens track the outcome",
    body: "A status timeline from submission to real-world impact, with notifications on meaningful change."
  }
];

const ROLES = [
  "Citizens",
  "Government / Admin",
  "Universities",
  "Students & Faculty",
  "Industry Partners"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-black tracking-tight">
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
            SAMADHAN
          </span>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link
              className="hidden rounded-lg px-3 py-2 hover:bg-[var(--panel-soft)] sm:block"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-white hover:bg-[var(--accent-strong)]"
              href="/signup"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-bold tracking-widest text-[var(--accent)] uppercase">
          From citizen problems to real-world solutions
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-black tracking-tight sm:text-5xl">
          A civic platform that understands problems, verifies them, and tracks
          solutions until impact is real.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
          SAMADHAN turns every citizen report into a structured innovation
          challenge - prioritised transparently, matched to the right
          university, and executed as a tracked project. AI assists; people
          decide.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
            href="/signup"
          >
            Report a problem <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-bold hover:bg-[var(--panel-soft)]"
            href="/challenges"
          >
            Browse challenges
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <span
              className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--muted)]"
              key={role}
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-black">How the civic loop works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
                  key={step.title}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold text-[var(--muted)]">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    {step.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-12 text-sm text-[var(--muted)]">
        <p>
          &copy; {new Date().getFullYear()} SAMADHAN. AI recommendations are
          advisory, explainable and reversible - people make the official
          decisions.
        </p>
      </footer>
    </main>
  );
}
