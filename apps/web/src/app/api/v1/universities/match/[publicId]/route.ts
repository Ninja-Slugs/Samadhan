import type { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { matchingService } from "@/server/matching/matching.service";

export const GET = withParamsRoute<{ publicId: string }>(
  async (request: NextRequest, { publicId }) => {
    requireRole(request, "admin", "university_admin");
    return matchingService.matchForProblem(publicId);
  }
);
