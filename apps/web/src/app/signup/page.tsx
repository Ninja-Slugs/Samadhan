"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Field,
  Input,
  Select
} from "@/components/ui/primitives";
import { ApiError, apiRequest } from "@/lib/api/client";
import { setSession } from "@/lib/session";

const ROLES = [
  { value: "citizen", label: "Citizen - report problems" },
  { value: "university_admin", label: "University administrator" },
  { value: "faculty", label: "Faculty / mentor" },
  { value: "student", label: "Student" },
  { value: "industry", label: "Industry partner" }
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "citizen",
    district: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    const email = params.get("email");
    if (
      role &&
      ROLES.some((option) => option.value === role) &&
      role !== "citizen"
    ) {
      setForm((current) => ({ ...current, role }));
    }
    if (email) {
      setForm((current) => ({ ...current, email }));
    }
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      const result = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        user: { role: string };
      }>("/auth/signup", {
        method: "POST",
        auth: false,
        body: {
          fullName: form.fullName,
          email: form.email,
          password: form.password || undefined,
          role: form.role,
          district: form.district || undefined
        }
      });
      setSession(result.accessToken, result.refreshToken);
      router.push(result.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-black">Create your SAMADHAN account</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Just your name and email — no verification needed to get started.
        Government and admin accounts are provisioned separately.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Field label="Full name" error={fields.fullName}>
          <Input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </Field>
        <Field label="Email" error={fields.email}>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field
          label="Password"
          hint="Optional. Set one if you want to log back in later — you're signed in right away either way."
          error={fields.password}
        >
          <Input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label="I am a" error={fields.role}>
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="District" hint="Optional" error={fields.district}>
          <Input
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          />
        </Field>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link className="font-semibold text-[var(--accent)]" href="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
