import jwt, { type SignOptions } from "jsonwebtoken";
import type { AppRole } from "@samadhan/database";
import { getEnv, requireEnv } from "../env";

export interface AccessTokenClaims {
  sub: string;
  sid: string;
  role: AppRole;
}

export function signAccessToken(claims: AccessTokenClaims): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const expiresIn = getEnv("JWT_ACCESS_TTL", "15m") as SignOptions["expiresIn"];
  return jwt.sign(claims, secret, { expiresIn });
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret) as unknown as AccessTokenClaims;
}
