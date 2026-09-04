import type { NextRequest } from "next/server";
import { adminService } from "@/server/admin/admin.service";
import { OverridePriorityDto } from "@/server/admin/dto/override-priority.dto";
import { requireRole } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { problemsService } from "@/server/problems/problems.service";

// PATCH recomputes the transparent score from current inputs; POST applies a
// manual override with a recorded reason.
export const PATCH = withParamsRoute<{ publicId: string }>(
  async (request: NextRequest, { publicId }) => {
    const admin = requireRole(request, "admin");
    return problemsService.recomputeByPublicId(publicId, admin.id);
  }
);

export const POST = withParamsRoute<{ publicId: string }>(
  async (request: NextRequest, { publicId }) => {
    const admin = requireRole(request, "admin");
    const dto = await validateDto(
      OverridePriorityDto,
      await readJsonBody(request)
    );
    return adminService.overridePriority(admin.id, publicId, dto);
  }
);
