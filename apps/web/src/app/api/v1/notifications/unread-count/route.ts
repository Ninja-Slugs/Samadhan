import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withRoute } from "@/server/http";
import { notificationsService } from "@/server/notifications/notifications.service";

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  return notificationsService.unreadCount(user.id);
});
