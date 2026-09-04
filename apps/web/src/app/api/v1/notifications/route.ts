import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { queryToObject, validateDto, withRoute } from "@/server/http";
import { notificationsService } from "@/server/notifications/notifications.service";
import { PaginationDto } from "@/server/pagination";

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const pagination = await validateDto(PaginationDto, queryToObject(request));
  return notificationsService.list(user.id, pagination);
});
