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
  { label: "About", href: "/challenges" }
];

const AUDIENCES = [
  {
    icon: Users,
    title: "For Citizens",
    copy: "Report & Track",
    bg: "bg-rose-100 text-rose-600"
  },
  {
    icon: Landmark,
    title: "For Government",
    copy: "Monitor & Collaborate",
    bg: "bg-emerald-100 text-emerald-700"
  },
  {
    icon: GraduationCap,
    title: "For Universities",
    copy: "Innovate & Solve",
    bg: "bg-sky-100 text-sky-700"
  },
  {
    icon: Users,
    title: "For Students",
    copy: "Build for a Better Tomorrow",
    bg: "bg-amber-100 text-amber-700"
  },
  {
    icon: Factory,
    title: "For Industry",
    copy: "Partner & Support",
    bg: "bg-violet-100 text-violet-700"
  }
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

function HeroBackdrop() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
      viewBox="0 0 1200 600"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bfe3f0" />
          <stop offset="55%" stopColor="#8fd0c9" />
          <stop offset="100%" stopColor="#3f8f6e" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3f7d5e" />
          <stop offset="100%" stopColor="#2a5f45" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#245239" />
          <stop offset="100%" stopColor="#123526" />
        </linearGradient>
        <linearGradient id="falls" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect fill="url(#sky)" height="600" width="1200" />
      <path
        d="M0,260 C220,190 420,300 640,250 C860,200 1040,260 1200,220 L1200,600 L0,600 Z"
        fill="url(#hillFar)"
        opacity="0.85"
      />
      <path
        d="M780,120 C795,220 770,300 800,420 C815,470 785,500 810,600 L860,600 C845,500 875,470 855,420 C830,300 855,220 840,120 Z"
        fill="url(#falls)"
      />
      <path
        d="M0,340 C260,300 500,400 760,330 C960,280 1090,360 1200,330 L1200,600 L0,600 Z"
        fill="url(#hillNear)"
      />
    </svg>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats>(PLACEHOLDER_STATS);

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
      tone: "text-[var(--ink)]"
    },
    {
      value: compact(stats.inProgress),
      label: "In Progress",
      tone: "text-[var(--saffron)]"
    },
    {
      value: compact(stats.solutionsDeployed),
      label: "Solutions Deployed",
      tone: "text-[var(--accent)]"
    },
    {
      value: compact(stats.citizensImpacted),
      label: "Citizens Impacted",
      tone: "text-[var(--ink)]"
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
        <section className="relative isolate min-h-[420px] overflow-hidden text-white">
          <HeroBackdrop />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-16 lg:py-20">
            <h1 className="max-w-2xl text-4xl leading-[1.05] font-black tracking-tight drop-shadow-sm sm:text-5xl">
              A Stronger{" "}
              <span className="text-[var(--saffron)]">Jharkhand</span>
              <br />
              Through Solutions
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/90 drop-shadow-sm">
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
                className="flex items-center gap-2 rounded-md border border-white bg-[var(--ink)]/80 px-6 py-3 text-sm font-bold text-white hover:bg-[var(--ink)]"
                href="/login"
              >
                Track My Problem <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-[var(--border)] bg-[var(--panel)]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-6 px-5 py-8 sm:grid-cols-4">
            {statItems.map((item) => (
              <div key={item.label}>
                <dt className={`text-3xl font-black ${item.tone}`}>
                  {item.value}
                </dt>
                <dd className="text-xs font-semibold text-[var(--muted)]">
                  {item.label}
                </dd>
              </div>
            ))}
          </div>
        </section>

        {/* Audience strip */}
        <section className="border-b border-[var(--border)] bg-[var(--panel-soft)]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[var(--border)] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
            {AUDIENCES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="flex items-center gap-3 px-3 py-5"
                  key={item.title}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.bg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
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
