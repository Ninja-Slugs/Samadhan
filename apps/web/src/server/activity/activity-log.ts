import { prisma } from "../prisma";

interface ActivityInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Immutable audit trail for material civic actions (verification, priority
// overrides, university assignment, project creation). Never copies secrets
// or unnecessary personal data - callers pass a minimal before/after summary.
export async function recordActivity(input: ActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: (input.metadata ?? undefined) as never,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  } catch (error) {
    // Audit logging must never break the workflow it records.
    console.error("[activity-log] failed to persist", error);
  }
}
