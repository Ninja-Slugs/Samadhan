import type { Prisma, ProblemStatus } from "@samadhan/database";
import { recordActivity } from "../activity/activity-log";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { buildPage, resolvePageSize, type PaginationDto } from "../pagination";
import { prisma } from "../prisma";
import { problemsService } from "../problems/problems.service";
import type { OverridePriorityDto } from "./dto/override-priority.dto";
import type { ReviewProblemDto } from "./dto/review-problem.dto";
import type { TransitionProblemDto } from "./dto/transition-problem.dto";

// Explicit state-machine edges (docs/ARCHITECTURE.md). Any transition not
// listed here is rejected with 409.
const ALLOWED_TRANSITIONS: Record<ProblemStatus, ProblemStatus[]> = {
  submitted: ["under_review", "validated", "rejected", "duplicate"],
  under_review: ["validated", "rejected", "duplicate", "submitted"],
  validated: ["prioritized", "rejected", "archived"],
  prioritized: ["assigned", "archived"],
  assigned: ["in_progress", "prioritized", "archived"],
  in_progress: ["resolved", "assigned", "archived"],
  resolved: ["closed", "in_progress"],
  closed: ["archived"],
  rejected: ["submitted"],
  duplicate: ["submitted"],
  archived: []
};

function assertTransition(from: ProblemStatus, to: ProblemStatus): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new AppException(
      HttpStatus.CONFLICT,
      "invalid_transition",
      `A problem cannot move from ${from} to ${to}.`
    );
  }
}

class AdminService {
  private readonly prisma = prisma;

  async reviewQueue(pagination: PaginationDto) {
    const pageSize = resolvePageSize(pagination);
    const rows = await this.prisma.problem.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      orderBy: [{ priorityScore: "desc" }, { createdAt: "asc" }],
      take: pageSize + 1,
      ...(pagination.cursor
        ? { skip: 1, cursor: { id: pagination.cursor } }
        : {}),
      include: {
        category: true,
        aiAnalysis: { select: { status: true, confidenceScore: true } },
        _count: { select: { duplicateOf: true } }
      }
    });

    return buildPage(
      rows.map((problem) => ({
        id: problem.id,
        publicId: problem.publicId,
        title: problem.title,
        status: problem.status,
        district: problem.district,
        category: problem.category?.name ?? null,
        priorityScore: problem.priorityScore,
        aiStatus: problem.aiAnalysis?.status ?? "pending",
        aiConfidence: problem.aiAnalysis?.confidenceScore ?? null,
        duplicateCount: problem._count.duplicateOf,
        createdAt: problem.createdAt
      })),
      pageSize
    );
  }

  async review(
    adminId: string,
    publicId: string,
    dto: ReviewProblemDto,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { publicId }
    });
    if (!problem) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }

    const category = dto.categorySlug
      ? await this.prisma.problemCategory.findUnique({
          where: { slug: dto.categorySlug }
        })
      : null;

    const overrides: Prisma.ProblemUpdateInput = {};
    if (category) overrides.category = { connect: { id: category.id } };
    if (dto.severity) overrides.severity = dto.severity;
    if (dto.urgencyLevel) overrides.urgencyLevel = dto.urgencyLevel;
    if (dto.peopleAffected !== undefined)
      overrides.peopleAffected = dto.peopleAffected;

    let toStatus: ProblemStatus;
    if (dto.decision === "verify") {
      toStatus = "validated";
    } else if (dto.decision === "reject") {
      toStatus = "rejected";
      overrides.rejectionReason =
        dto.note?.trim() || "Rejected during government review.";
    } else {
      toStatus = "under_review";
    }

    assertTransition(problem.status, toStatus);

    await this.prisma.$transaction([
      this.prisma.problem.update({
        where: { id: problem.id },
        data: {
          ...overrides,
          status: toStatus,
          ...(dto.decision === "verify"
            ? {
                verifiedBy: { connect: { id: adminId } },
                verifiedAt: new Date()
              }
            : {})
        }
      }),
      this.prisma.problemStatusEvent.create({
        data: {
          problemId: problem.id,
          fromStatus: problem.status,
          toStatus,
          actorId: adminId,
          note: dto.note?.trim() || null
        }
      })
    ]);

    if (dto.decision === "verify") {
      await problemsService.recomputePriority(problem.id, adminId);
    }

    await recordActivity({
      actorId: adminId,
      action: `problem.review.${dto.decision}`,
      entityType: "problem",
      entityId: problem.id,
      metadata: {
        publicId,
        from: problem.status,
        to: toStatus,
        overrides: {
          category: dto.categorySlug,
          severity: dto.severity,
          urgencyLevel: dto.urgencyLevel,
          peopleAffected: dto.peopleAffected
        }
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent
    });

    await notificationsService.notify(problem.citizenId, {
      type: `problem.${dto.decision}`,
      title:
        dto.decision === "verify"
          ? "Your report was verified"
          : dto.decision === "reject"
            ? "Your report was not accepted"
            : "More information needed",
      body:
        dto.note?.trim() ||
        `Report ${publicId} moved to ${toStatus.replace("_", " ")}.`,
      entityType: "problem",
      entityId: problem.id
    });

    return problemsService.getForRequester(publicId, adminId, "admin");
  }

  async overridePriority(
    adminId: string,
    publicId: string,
    dto: OverridePriorityDto
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { publicId }
    });
    if (!problem) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }

    await this.prisma.$transaction([
      this.prisma.priorityScore.upsert({
        where: { problemId: problem.id },
        update: {
          finalScore: dto.finalScore,
          manualOverride: true,
          calculatedById: adminId,
          calculatedAt: new Date(),
          explanation: {
            summary: `Manual override to ${dto.finalScore}/100 by government reviewer.`,
            reasons: [dto.reason.trim()],
            manualOverride: true
          } as unknown as Prisma.InputJsonValue
        },
        create: {
          problemId: problem.id,
          finalScore: dto.finalScore,
          manualOverride: true,
          calculatedById: adminId,
          explanation: {
            summary: `Manual override to ${dto.finalScore}/100 by government reviewer.`,
            reasons: [dto.reason.trim()],
            manualOverride: true
          } as unknown as Prisma.InputJsonValue
        }
      }),
      this.prisma.problem.update({
        where: { id: problem.id },
        data: { priorityScore: dto.finalScore }
      })
    ]);

    await recordActivity({
      actorId: adminId,
      action: "problem.priority.override",
      entityType: "problem",
      entityId: problem.id,
      metadata: { publicId, finalScore: dto.finalScore, reason: dto.reason }
    });

    return problemsService.getForRequester(publicId, adminId, "admin");
  }

  async transition(
    adminId: string,
    publicId: string,
    dto: TransitionProblemDto
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { publicId }
    });
    if (!problem) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }
    assertTransition(problem.status, dto.toStatus as ProblemStatus);

    await this.prisma.$transaction([
      this.prisma.problem.update({
        where: { id: problem.id },
        data: { status: dto.toStatus as ProblemStatus }
      }),
      this.prisma.problemStatusEvent.create({
        data: {
          problemId: problem.id,
          fromStatus: problem.status,
          toStatus: dto.toStatus as ProblemStatus,
          actorId: adminId,
          note: dto.note?.trim() || null
        }
      })
    ]);

    await recordActivity({
      actorId: adminId,
      action: "problem.transition",
      entityType: "problem",
      entityId: problem.id,
      metadata: { publicId, from: problem.status, to: dto.toStatus }
    });

    await notificationsService.notify(problem.citizenId, {
      type: "problem.status",
      title: "Your report was updated",
      body: `Report ${publicId} is now ${dto.toStatus.replace("_", " ")}.`,
      entityType: "problem",
      entityId: problem.id
    });

    return problemsService.getForRequester(publicId, adminId, "admin");
  }

  async metrics() {
    const [byStatus, activeProjects, completedProjects, citizens] =
      await Promise.all([
        this.prisma.problem.groupBy({
          by: ["status"],
          _count: { _all: true }
        }),
        this.prisma.project.count({ where: { status: "active" } }),
        this.prisma.project.count({ where: { status: "completed" } }),
        this.prisma.user.count({ where: { role: "citizen" } })
      ]);

    const statusCounts = Object.fromEntries(
      byStatus.map((row) => [row.status, row._count._all])
    );

    return {
      totalProblems: byStatus.reduce((sum, row) => sum + row._count._all, 0),
      byStatus: statusCounts,
      underReview:
        (statusCounts.submitted ?? 0) + (statusCounts.under_review ?? 0),
      verified: statusCounts.validated ?? 0,
      activeProjects,
      completedProjects,
      registeredCitizens: citizens
    };
  }
}

export const adminService = new AdminService();
