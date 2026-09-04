"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api/client";
import { clearSession, hasSession } from "@/lib/session";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role:
    | "citizen"
    | "admin"
    | "university_admin"
    | "student"
    | "faculty"
    | "industry";
  district: string | null;
  emailVerified: boolean;
}

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!hasSession()) {
      setLoading(false);
      return;
    }
    apiRequest<SessionUser>("/auth/me")
      .then((value) => {
        if (active) {
          setUser(value);
        }
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
