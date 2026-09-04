import type { NextRequest } from "next/server";
import { adminService } from "@/server/admin/admin.service";
import { requireRole } from "@/server/auth/require-user";
import { queryToObject, validateDto, withRoute } from "@/server/http";
import { PaginationDto } from "@/server/pagination";

export const GET = withRoute(async (request: NextRequest) => {
  requireRole(request, "admin");
  const pagination = await validateDto(PaginationDto, queryToObject(request));
  return adminService.reviewQueue(pagination);
});
