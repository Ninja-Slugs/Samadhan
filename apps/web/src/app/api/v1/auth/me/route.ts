import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { requireUser } from "@/server/auth/require-user";
import { withRoute } from "@/server/http";

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  return authService.me(user.id);
});
