"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Field,
  Input,
  Select,
  Textarea
} from "@/components/ui/primitives";
import { ApiError, apiRequest } from "@/lib/api/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const URGENCY = [
  { value: "", label: "Not sure" },
  { value: "routine", label: "Routine" },
  { value: "elevated", label: "Elevated" },
  { value: "urgent", label: "Urgent" },
  { value: "emergency", label: "Emergency" }
];

export default function ReportPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categorySlug: "",
    urgencyLevel: "",
    peopleAffected: "",
    district: "",
    city: "",
    state: "",
    address: "",
    gpsLat: "",
    gpsLng: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<Category[]>("/categories", { auth: false })
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setForm((current) => ({
        ...current,
        gpsLat: position.coords.latitude.toFixed(6),
        gpsLng: position.coords.longitude.toFixed(6)
      }));
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      const created = await apiRequest<{ publicId: string }>("/problems", {
        method: "POST",
        body: {
          title: form.title,
          description: form.description,
          categorySlug: form.categorySlug || undefined,
          urgencyLevel: form.urgencyLevel || undefined,
          peopleAffected: form.peopleAffected
            ? Number(form.peopleAffected)
            : undefined,
          district: form.district || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          address: form.address || undefined,
          gpsLat: form.gpsLat ? Number(form.gpsLat) : undefined,
          gpsLng: form.gpsLng ? Number(form.gpsLng) : undefined
        }
      });
      router.push(`/track/${created.publicId}`);
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
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black">Report a problem</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Describe the issue clearly. AI will suggest a category and priority for
        a government reviewer - it never decides on its own.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Field
          label="Title"
          hint="A short summary, e.g. 'Contaminated tap water in Ward 7'."
          error={fields.title}
        >
          <Input
            required
            minLength={6}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field
          label="Description"
          hint="What is happening, since when, and who is affected?"
          error={fields.description}
        >
          <Textarea
            required
            minLength={20}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={fields.categorySlug}>
            <Select
              value={form.categorySlug}
              onChange={(e) =>
                setForm({ ...form, categorySlug: e.target.value })
              }
            >
              <option value="">Let AI suggest</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Urgency" error={fields.urgencyLevel}>
            <Select
              value={form.urgencyLevel}
              onChange={(e) =>
                setForm({ ...form, urgencyLevel: e.target.value })
              }
            >
              {URGENCY.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="People affected"
            hint="Approx."
            error={fields.peopleAffected}
          >
            <Input
              type="number"
              min={0}
              value={form.peopleAffected}
              onChange={(e) =>
                setForm({ ...form, peopleAffected: e.target.value })
              }
            />
          </Field>
          <Field label="District" error={fields.district}>
            <Input
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
          </Field>
          <Field label="City" error={fields.city}>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Address / landmark" error={fields.address}>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <div className="flex items-end gap-3">
          <Field label="Latitude" error={fields.gpsLat}>
            <Input
              value={form.gpsLat}
              onChange={(e) => setForm({ ...form, gpsLat: e.target.value })}
            />
          </Field>
          <Field label="Longitude" error={fields.gpsLng}>
            <Input
              value={form.gpsLng}
              onChange={(e) => setForm({ ...form, gpsLng: e.target.value })}
            />
          </Field>
          <Button type="button" variant="ghost" onClick={useMyLocation}>
            Use my location
          </Button>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit report"}
        </Button>
      </form>
    </div>
  );
}
