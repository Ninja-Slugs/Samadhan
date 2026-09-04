import type { NextRequest } from "next/server";
import { adminService } from "@/server/admin/admin.service";
import { TransitionProblemDto } from "@/server/admin/dto/transition-problem.dto";
import { requireRole } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ publicId: string }>(
  async (request: NextRequest, { publicId }) => {
    const admin = requireRole(request, "admin");
    const dto = await validateDto(
      TransitionProblemDto,
      await readJsonBody(request)
    );
    return adminService.transition(admin.id, publicId, dto);
  }
);
