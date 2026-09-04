import bcrypt from "bcryptjs";

// Pure-JS bcrypt (ADR 0003): no native toolchain on the Hostinger build
// box, and the cost factor is tuned for a civic-scale login volume.
const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
