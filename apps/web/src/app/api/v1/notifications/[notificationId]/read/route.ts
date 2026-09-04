import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { notificationsService } from "@/server/notifications/notifications.service";

export const POST = withParamsRoute<{ notificationId: string }>(
  async (request: NextRequest, { notificationId }) => {
    const user = requireUser(request);
    await notificationsService.markRead(user.id, notificationId);
    return { success: true };
  }
);
