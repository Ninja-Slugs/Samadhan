"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Image as ImageIcon, Mic, Square, Type, Video } from "lucide-react";
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

const STEPS = ["Describe", "Location", "Add Media", "Review"];

const INPUT_TABS = [
  { key: "type", label: "Type", icon: Type },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "video", label: "Video", icon: Video }
] as const;

type InputTab = (typeof INPUT_TABS)[number]["key"];

// Minimal shape of the (non-standard) SpeechRecognition API.
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inputTab, setInputTab] = useState<InputTab>("type");
  const [recording, setRecording] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

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

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError(
        "Voice input isn't supported in this browser. Try the Type tab instead."
      );
      return;
    }
    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as ArrayLike<any>)
        .map((result: any) => result[0].transcript)
        .join(" ");
      setForm((current) => ({ ...current, description: transcript }));
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

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

  function onPickMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(event.target.files ?? []).map((f) => f.name);
    setMediaFiles((current) => [...current, ...names]);
  }

  const canAdvance = useMemo(() => {
    if (step === 0) return form.title.trim().length >= 6 && form.description.trim().length >= 20;
    return true;
  }, [step, form.title, form.description]);

  async function onSubmit() {
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
        if (err.fields?.title || err.fields?.description) {
          setStep(0);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black text-[var(--ink)]">
        Report a problem
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Describe the issue clearly. AI will suggest a category and priority
        for a government reviewer - it never decides on its own.
      </p>

      {/* Step indicator */}
      <ol className="mt-6 flex items-center gap-2 text-sm font-semibold">
        {STEPS.map((label, index) => (
          <li className="flex flex-1 items-center gap-2" key={label}>
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                index < step
                  ? "bg-[var(--accent)] text-white"
                  : index === step
                    ? "bg-[var(--saffron)] text-white"
                    : "bg-[var(--panel-soft)] text-[var(--muted)]"
              }`}
            >
              {index < step ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={
                index === step
                  ? "text-[var(--ink)]"
                  : "hidden text-[var(--muted)] sm:inline"
              }
            >
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="h-px flex-1 bg-[var(--border)]" />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-4">
        {error ? <Alert tone="error">{error}</Alert> : null}

        {step === 0 ? (
          <>
            <div className="flex gap-1 rounded-lg bg-[var(--panel-soft)] p-1 text-sm font-semibold">
              {INPUT_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 ${
                      inputTab === tab.key
                        ? "bg-[var(--panel)] text-[var(--ink)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                    key={tab.key}
                    onClick={() => setInputTab(tab.key)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {inputTab === "voice" ? (
              <div className="grid place-items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] py-10 text-center">
                <button
                  className={`grid h-16 w-16 place-items-center rounded-full text-white shadow-lg ${
                    recording
                      ? "bg-[var(--danger)]"
                      : "bg-[var(--accent)] hover:bg-[var(--accent-strong)]"
                  }`}
                  onClick={toggleRecording}
                  type="button"
                >
                  {recording ? (
                    <Square className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </button>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {recording ? "Listening... tap to stop" : "Tap to record"}
                </p>
                <p className="max-w-xs text-xs text-[var(--muted)]">
                  Speak in Hindi, English or any local language. We&apos;ll
                  turn it into text below.
                </p>
              </div>
            ) : null}

            {inputTab === "image" || inputTab === "video" ? (
              <label className="grid cursor-pointer place-items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-10 text-center">
                <input
                  accept={inputTab === "image" ? "image/*" : "video/*"}
                  className="hidden"
                  multiple
                  onChange={onPickMedia}
                  type="file"
                />
                {inputTab === "image" ? (
                  <ImageIcon className="h-6 w-6 text-[var(--muted)]" />
                ) : (
                  <Video className="h-6 w-6 text-[var(--muted)]" />
                )}
                <p className="text-sm font-semibold text-[var(--ink)]">
                  Tap to upload {inputTab === "image" ? "photos" : "a video"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {mediaFiles.length > 0
                    ? mediaFiles.join(", ")
                    : "AI will look for visual clues automatically."}
                </p>
              </label>
            ) : null}

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
              label="What's the problem?"
              hint="What is happening, since when, and who is affected?"
              error={fields.description}
            >
              <Textarea
                required
                minLength={20}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="District" error={fields.district}>
                <Input
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
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
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </Field>
            <div className="flex items-end gap-3">
              <Field label="Latitude" error={fields.gpsLat}>
                <Input
                  value={form.gpsLat}
                  onChange={(e) =>
                    setForm({ ...form, gpsLat: e.target.value })
                  }
                />
              </Field>
              <Field label="Longitude" error={fields.gpsLng}>
                <Input
                  value={form.gpsLng}
                  onChange={(e) =>
                    setForm({ ...form, gpsLng: e.target.value })
                  }
                />
              </Field>
              <Button type="button" variant="ghost" onClick={useMyLocation}>
                Use current location
              </Button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label className="grid cursor-pointer place-items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-10 text-center">
              <input
                accept="image/*,video/*"
                className="hidden"
                multiple
                onChange={onPickMedia}
                type="file"
              />
              <ImageIcon className="h-6 w-6 text-[var(--muted)]" />
              <p className="text-sm font-semibold text-[var(--ink)]">
                Add photos or a video (optional)
              </p>
              <p className="text-xs text-[var(--muted)]">
                {mediaFiles.length > 0
                  ? mediaFiles.join(", ")
                  : "Helps government reviewers and AI verify the report."}
              </p>
            </label>
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
          </>
        ) : null}

        {step === 3 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <p className="text-xs font-black tracking-widest text-[var(--accent)]">
              REVIEW
            </p>
            <h2 className="mt-1 text-lg font-black text-[var(--ink)]">
              {form.title || "Untitled report"}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {form.description}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-semibold text-[var(--ink)]">Location</dt>
                <dd className="text-[var(--muted)]">
                  {[form.address, form.city, form.district, form.state]
                    .filter(Boolean)
                    .join(", ") || "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--ink)]">Category</dt>
                <dd className="text-[var(--muted)]">
                  {categories.find((c) => c.slug === form.categorySlug)
                    ?.name ?? "AI will suggest"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--ink)]">Urgency</dt>
                <dd className="text-[var(--muted)]">
                  {URGENCY.find((u) => u.value === form.urgencyLevel)
                    ?.label ?? "Not sure"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--ink)]">
                  People affected
                </dt>
                <dd className="text-[var(--muted)]">
                  {form.peopleAffected || "Unknown"}
                </dd>
              </div>
            </dl>
            {mediaFiles.length > 0 ? (
              <p className="mt-4 text-xs text-[var(--muted)]">
                Attached: {mediaFiles.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          <Button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            type="button"
            variant="ghost"
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              disabled={!canAdvance}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button disabled={submitting} onClick={onSubmit} type="button">
              {submitting ? "Submitting..." : "Submit report"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
