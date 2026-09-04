"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { ApiError, apiRequest } from "@/lib/api/client";
import { setSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        user: { role: string };
      }>("/auth/login", { method: "POST", auth: false, body: form });
      setSession(result.accessToken, result.refreshToken);
      router.push(result.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.code === "email_not_verified") {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-black">Log in to SAMADHAN</h1>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Field label="Email">
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        New here?{" "}
        <Link className="font-semibold text-[var(--accent)]" href="/signup">
          Create an account
        </Link>
      </p>
    </main>
  );
}
