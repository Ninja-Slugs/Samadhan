import { buildPage, resolvePageSize, type PaginationDto } from "../pagination";
import { prisma } from "../prisma";

interface NotifyInput {
  type: string;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}

class NotificationsService {
  private readonly prisma = prisma;

  async notify(recipientId: string, input: NotifyInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          recipientId,
          type: input.type,
          title: input.title,
          body: input.body,
          entityType: input.entityType,
          entityId: input.entityId
        }
      });
    } catch (error) {
      console.error("[notifications] failed to create", error);
    }
  }

  async list(userId: string, pagination: PaginationDto) {
    const pageSize = resolvePageSize(pagination);
    const rows = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      ...(pagination.cursor
        ? { skip: 1, cursor: { id: pagination.cursor } }
        : {})
    });
    return buildPage(rows, pageSize);
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, readAt: null }
    });
    return { count };
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId, readAt: null },
      data: { readAt: new Date() }
    });
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() }
    });
    return { updated: result.count };
  }
}

export const notificationsService = new NotificationsService();
