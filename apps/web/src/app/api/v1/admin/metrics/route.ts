import type { NextRequest } from "next/server";
import { adminService } from "@/server/admin/admin.service";
import { requireRole } from "@/server/auth/require-user";
import { withRoute } from "@/server/http";

export const GET = withRoute(async (request: NextRequest) => {
  requireRole(request, "admin");
  return adminService.metrics();
});
