import type { NextRequest } from "next/server";
import { AppException, HttpStatus } from "./http";

// In-memory fixed-window counter. Single Node process on Hostinger, so no
// Redis needed - resets on redeploy/restart, which is fine for an abuse
// throttle (a cost/spam guard, not a security boundary on its own).
const hits = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();

  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.resetAt <= now) {
        hits.delete(k);
      }
    }
  }

  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (entry.count >= limit) {
    throw new AppException(
      HttpStatus.TOO_MANY_REQUESTS,
      "rate_limited",
      "Too many requests. Please wait a bit and try again."
    );
  }

  entry.count += 1;
}
