import { createHash, randomBytes, randomInt } from "node:crypto";

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const DURATION_UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000
};

export function addDuration(base: Date, duration: string): Date {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  const [, amount, unit] = match;
  return new Date(base.getTime() + Number(amount) * DURATION_UNIT_MS[unit]);
}
