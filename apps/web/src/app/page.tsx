"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Accessibility,
  Building2,
  Factory,
  GraduationCap,
  Landmark,
  Leaf,
  Search,
  Sparkles,
  Target,
  Users,
  Wrench
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Report a Problem", href: "/signup" },
  { label: "Explore", href: "/challenges" },
  { label: "Our Partners", href: "/challenges" },
  { label: "Success Stories", href: "/challenges" },
  { label: "About", href: "/challenges" }
];

const SIGN_IN_TABS = [
  { key: "citizen", label: "Citizen" },
  { key: "university_admin", label: "University" },
  { key: "faculty", label: "Government" },
  { key: "student", label: "Student" },
  { key: "industry", label: "Partner" }
];

const AUDIENCES = [
  { icon: Users, title: "For Citizens", copy: "Report & Track" },
  { icon: Landmark, title: "For Government", copy: "Monitor & Collaborate" },
  { icon: GraduationCap, title: "For Universities", copy: "Innovate & Solve" },
  { icon: Users, title: "For Students", copy: "Build for a Better Tomorrow" },
  { icon: Factory, title: "For Industry", copy: "Partner & Support" },
  { icon: Leaf, title: "For NGOs", copy: "Create Social Impact" }
];

const STEPS = [
  {
    n: 1,
    icon: Search,
    title: "Report",
    copy: "Citizens or government identify a real-world problem.",
    tone: "saffron"
  },
  {
    n: 2,
    icon: Sparkles,
    title: "AI Analysis",
    copy: "AI understands, categorizes, and finds root cause.",
    tone: "ink"
  },
  {
    n: 3,
    icon: Building2,
    title: "Match",
    copy: "Right universities, faculty, and partners are connected.",
    tone: "green"
  },
  {
    n: 4,
    icon: Wrench,
    title: "Solve",
    copy: "Students and experts build and test solutions.",
    tone: "ink"
  },
  {
    n: 5,
    icon: Target,
    title: "Impact",
    copy: "Solutions are deployed and real impact is measured.",
    tone: "green"
  }
];

interface Stats {
  problemsReported: number;
  inProgress: number;
  solutionsDeployed: number;
  citizensImpacted: number;
}

const PLACEHOLDER_STATS: Stats = {
  problemsReported: 12482,
  inProgress: 3218,
  solutionsDeployed: 827,
  citizensImpacted: 1_600_000
};

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value.toLocaleString("en-IN");
}

function Tricolor() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 h-40 w-72 overflow-hidden"
    >
      <span className="absolute -top-16 -left-24 h-40 w-[28rem] -rotate-12 rounded-full bg-[var(--saffron)]" />
      <span className="absolute -top-8 -left-24 h-40 w-[28rem] -rotate-12 rounded-full bg-white" />
      <span className="absolute top-0 -left-24 h-40 w-[28rem] -rotate-12 rounded-full bg-[var(--accent)]" />
    </span>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats>(PLACEHOLDER_STATS);
  const [role, setRole] = useState("citizen");
  const [contact, setContact] = useState("");

  useEffect(() => {
    apiRequest<Stats>("/stats", { auth: false })
      .then((value) => {
        // Keep the marketing figure if the live count is still tiny.
        setStats({
          problemsReported: Math.max(
            value.problemsReported,
            PLACEHOLDER_STATS.problemsReported
          ),
          inProgress: Math.max(value.inProgress, PLACEHOLDER_STATS.inProgress),
          solutionsDeployed: Math.max(
            value.solutionsDeployed,
            PLACEHOLDER_STATS.solutionsDeployed
          ),
          citizensImpacted: Math.max(
            value.citizensImpacted,
            PLACEHOLDER_STATS.citizensImpacted
          )
        });
      })
      .catch(() => undefined);
  }, []);

  const statItems = [
    {
      value: compact(stats.problemsReported),
      label: "Problems Reported",
      tone: "ink"
    },
    { value: compact(stats.inProgress), label: "In Progress", tone: "saffron" },
    {
      value: compact(stats.solutionsDeployed),
      label: "Solutions Deployed",
      tone: "green"
    },
    {
      value: compact(stats.citizensImpacted),
      label: "Citizens Impacted",
      tone: "ink"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--accent)] focus:px-3 focus:py-1.5 focus:text-sm focus:font-bold focus:text-white"
        href="#main"
      >
        Skip to main content
      </a>

      {/* Government utility bar */}
      <div className="border-b border-[var(--border)] bg-[var(--panel-soft)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-1.5 text-xs">
          <span className="flex items-center gap-2 font-semibold text-[var(--ink)]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">
              JH
            </span>
            Government of Jharkhand
          </span>
          <div className="hidden items-center gap-4 text-[var(--muted)] sm:flex">
            <a className="hover:text-[var(--ink)]" href="#main">
              Skip to main content
            </a>
            <span className="flex items-center gap-1">
              <button className="hover:text-[var(--ink)]" type="button">
                A-
              </button>
              <button className="font-bold text-[var(--ink)]" type="button">
                A
              </button>
              <button className="hover:text-[var(--ink)]" type="button">
                A+
              </button>
            </span>
            <button className="hover:text-[var(--ink)]" type="button">
              English ▾ | हिंदी
            </button>
            <Accessibility className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-[var(--saffron)] to-[var(--accent)] text-lg font-black text-white">
              स
            </span>
            <div className="leading-tight">
              <p className="text-xl font-black tracking-tight text-[var(--ink)]">
                Samadhan
              </p>
              <p className="text-[11px] font-semibold text-[var(--muted)]">
                From Problems to Solutions.
              </p>
            </div>
            <span className="mx-2 hidden h-9 w-px bg-[var(--border)] lg:block" />
            <p className="hidden max-w-[14rem] text-xs leading-snug text-[var(--muted)] lg:block">
              Jharkhand&apos;s Innovation Network for a Better Tomorrow
            </p>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--ink)] xl:flex">
            {NAV.map((item) => (
              <Link
                className="border-b-2 border-transparent pb-0.5 hover:border-[var(--saffron)]"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-right text-[11px] leading-tight font-bold text-[var(--accent)] md:flex">
              <Leaf className="h-4 w-4" />
              Digital Jharkhand
            </span>
            <Link
              className="rounded-md bg-[var(--accent)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
              href="/login"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a7d3f] via-[#0c6f3c] to-[#08312a] text-white">
          <Tricolor />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgba(255,255,255,0.14),transparent)]"
          />
          <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-5 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
            <div>
              <h1 className="text-4xl leading-[1.05] font-black tracking-tight sm:text-5xl">
                A Stronger{" "}
                <span className="text-[var(--saffron)]">Jharkhand</span>
                <br />
                Through Solutions
              </h1>
              <p className="mt-5 max-w-lg text-base text-white/85">
                An AI-powered platform that connects citizens, government,
                universities, industry and students to solve real-world
                problems.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  className="flex items-center gap-2 rounded-md bg-[var(--saffron)] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--saffron-strong)]"
                  href="/signup"
                >
                  Report a Problem <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className="flex items-center gap-2 rounded-md border border-white/50 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
                  href="/login"
                >
                  Track My Problem <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                {statItems.map((item) => (
                  <div key={item.label}>
                    <dt
                      className={`text-2xl font-black ${
                        item.tone === "saffron"
                          ? "text-[var(--saffron)]"
                          : "text-white"
                      }`}
                    >
                      {item.value}
                    </dt>
                    <dd className="text-xs font-semibold text-white/75">
                      {item.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Sign-in card */}
            <div className="mx-auto w-full max-w-md self-start rounded-2xl bg-[var(--panel)] p-6 text-[var(--foreground)] shadow-2xl">
              <h2 className="text-xl font-black text-[var(--ink)]">
                Welcome to Samadhan
              </h2>
              <p className="text-sm text-[var(--muted)]">Sign in to continue</p>

              <div className="mt-4 flex gap-4 border-b border-[var(--border)] text-sm font-semibold">
                {SIGN_IN_TABS.map((tab) => (
                  <button
                    className={`-mb-px border-b-2 pb-2 ${
                      role === tab.key
                        ? "border-[var(--saffron)] text-[var(--ink)]"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                    key={tab.key}
                    onClick={() => setRole(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-sm font-semibold">
                Email address
                <input
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={contact}
                />
              </label>
              <p className="mt-1 text-xs text-[var(--muted)]">
                We&apos;ll send a one-time code to verify.
              </p>

              <Link
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
                href={
                  contact
                    ? `/login?email=${encodeURIComponent(contact)}`
                    : "/login"
                }
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="my-4 flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="h-px flex-1 bg-[var(--border)]" />
                or
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <Link
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-3 text-sm font-bold hover:bg-[var(--panel-soft)]"
                href={`/signup?role=${role}`}
              >
                Create a {SIGN_IN_TABS.find((t) => t.key === role)?.label ?? ""}{" "}
                account
              </Link>

              <p className="mt-4 text-center text-sm text-[var(--muted)]">
                New to Samadhan?{" "}
                <Link
                  className="font-bold text-[var(--accent)]"
                  href={`/signup?role=${role}`}
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Audience strip */}
        <section className="border-b border-[var(--border)] bg-[var(--panel)]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-[var(--border)] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-6">
            {AUDIENCES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="flex items-center gap-3 px-3 py-5"
                  key={item.title}
                >
                  <Icon className="h-6 w-6 shrink-0 text-[var(--saffron)]" />
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-[var(--ink)]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{item.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-5 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-widest text-[var(--accent)]">
                HOW IT WORKS
              </p>
              <h2 className="mt-1 text-2xl font-black text-[var(--ink)] sm:text-3xl">
                From a problem to a real-world impact
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              A transparent, collaborative and AI-enabled process from report to
              measurable change.
            </p>
          </div>

          <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const badge =
                step.tone === "saffron"
                  ? "bg-[var(--saffron)]"
                  : step.tone === "green"
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--ink)]";
              return (
                <li
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5"
                  key={step.n}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black text-white ${badge}`}
                    >
                      {step.n}
                    </span>
                    <Icon className="h-5 w-5 text-[var(--muted)]" />
                  </div>
                  <p className="mt-3 font-bold text-[var(--ink)]">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {step.copy}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Samadhan - Government of Jharkhand
          </p>
          <p>
            AI recommendations are advisory, explainable and reversible - people
            make the official decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
