import type { NextRequest } from "next/server";
import type { AppRole } from "@samadhan/database";
import { AppException, HttpStatus } from "../http";
import { verifyAccessToken } from "./jwt";

export interface AuthenticatedUser {
  id: string;
  sessionId: string;
  role: AppRole;
}

export function extractRequestMeta(request: NextRequest): {
  userAgent?: string;
  ipAddress?: string;
} {
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? undefined;
  return { userAgent, ipAddress };
}

function extractBearerToken(request: NextRequest): string | undefined {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  return header.slice("Bearer ".length);
}

export function requireUser(request: NextRequest): AuthenticatedUser {
  const token = extractBearerToken(request);
  if (!token) {
    throw new AppException(
      HttpStatus.UNAUTHORIZED,
      "unauthenticated",
      "Authentication is required."
    );
  }

  try {
    const payload = verifyAccessToken(token);
    return { id: payload.sub, sessionId: payload.sid, role: payload.role };
  } catch {
    throw new AppException(
      HttpStatus.UNAUTHORIZED,
      "unauthenticated",
      "Invalid or expired access token."
    );
  }
}

// The signed access token is short-lived (15m), so its role claim is a
// safe first gate. Workflow services still re-check ownership and, for
// material actions, re-read the role from the database.
export function requireRole(
  request: NextRequest,
  ...roles: AppRole[]
): AuthenticatedUser {
  const user = requireUser(request);
  if (!roles.includes(user.role)) {
    throw new AppException(
      HttpStatus.FORBIDDEN,
      "forbidden",
      "You do not have permission to perform this action."
    );
  }
  return user;
}

export function optionalUser(request: NextRequest): AuthenticatedUser | null {
  try {
    return requireUser(request);
  } catch {
    return null;
  }
}
