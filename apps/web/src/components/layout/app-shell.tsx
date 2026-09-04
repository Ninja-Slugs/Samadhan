"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { clearSession, hasSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";

const CITIZEN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report a problem" },
  { href: "/my-problems", label: "My reports" },
  { href: "/challenges", label: "Challenges" }
];

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/review", label: "Review queue" },
  { href: "/challenges", label: "Challenges" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSessionUser();

  useEffect(() => {
    if (!hasSession()) {
      router.replace("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-[var(--muted)]">
        Loading...
      </div>
    );
  }

  const nav = user?.role === "admin" ? ADMIN_NAV : CITIZEN_NAV;

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // ignore - clearing the local session is enough
    }
    clearSession();
    router.push("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            className="flex items-center gap-2 font-black"
            href="/dashboard"
          >
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
            SAMADHAN
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {nav.map((item) => (
              <Link
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold",
                  pathname === item.href
                    ? "bg-[var(--panel-soft)]"
                    : "text-[var(--muted)] hover:bg-[var(--panel-soft)]"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-[var(--muted)] sm:inline">
            {user?.fullName}
          </span>
          <button
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 font-semibold hover:bg-[var(--panel-soft)]"
            onClick={logout}
            type="button"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
