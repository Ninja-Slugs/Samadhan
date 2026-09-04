import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { requireUser } from "@/server/auth/require-user";
import { withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  await authService.logout(user.sessionId);
  return { success: true };
});
