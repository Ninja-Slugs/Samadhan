import type { NextRequest } from "next/server";
import { adminService } from "@/server/admin/admin.service";
import { ReviewProblemDto } from "@/server/admin/dto/review-problem.dto";
import { extractRequestMeta, requireRole } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ publicId: string }>(
  async (request: NextRequest, { publicId }) => {
    const admin = requireRole(request, "admin");
    const dto = await validateDto(
      ReviewProblemDto,
      await readJsonBody(request)
    );
    return adminService.review(
      admin.id,
      publicId,
      dto,
      extractRequestMeta(request)
    );
  }
);
