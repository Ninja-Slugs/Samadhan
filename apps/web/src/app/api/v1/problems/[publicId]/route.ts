import type { NextRequest } from "next/server";
import { optionalUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { problemsService } from "@/server/problems/problems.service";

export const GET = withParamsRoute<{ publicId: string }>(
  async (request: NextRequest, { publicId }) => {
    const user = optionalUser(request);
    if (!user) {
      return problemsService.getPublic(publicId);
    }
    return problemsService.getForRequester(publicId, user.id, user.role);
  }
);
