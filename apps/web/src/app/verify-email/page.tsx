"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { ApiError, apiRequest } from "@/lib/api/client";
import { setSession } from "@/lib/session";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiRequest<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/verify-email", {
        method: "POST",
        auth: false,
        body: { email, code }
      });
      setSession(result.accessToken, result.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setNotice(null);
    setError(null);
    try {
      await apiRequest("/auth/resend-verification", {
        method: "POST",
        auth: false,
        body: { email }
      });
      setNotice("If that address is unverified, a new code is on its way.");
    } catch {
      setNotice("If that address is unverified, a new code is on its way.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-black">Verify your email</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        We sent a 6-digit code to <strong>{email || "your email"}</strong>.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        {notice ? <Alert tone="success">{notice}</Alert> : null}
        <Field label="Verification code">
          <Input
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Button type="submit" disabled={submitting || code.length !== 6}>
          {submitting ? "Verifying..." : "Verify and continue"}
        </Button>
      </form>
      <button
        className="mt-4 text-sm font-semibold text-[var(--accent)]"
        onClick={resend}
        type="button"
      >
        Resend code
      </button>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
