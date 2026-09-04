import type { AppRole, Prisma, ProblemStatus } from "@samadhan/database";
import { recordActivity } from "../activity/activity-log";
import { analyzeProblem, inputHash } from "../ai/problem-analyzer";
import { AppException, HttpStatus } from "../http";
import { buildPage, resolvePageSize, type PaginationDto } from "../pagination";
import { computePriority } from "../priority/priority-engine";
import { prisma } from "../prisma";
import type { CreateProblemDto } from "./dto/create-problem.dto";
import type { ListProblemsDto } from "./dto/list-problems.dto";
import {
  findSimilarProblems,
  persistDuplicateSuggestions
} from "./duplicate-detector";
import { generatePublicId } from "./public-id";

// Statuses that are safe to expose on public pages (after moderation).
const PUBLIC_STATUSES: ProblemStatus[] = [
  "validated",
  "prioritized",
  "assigned",
  "in_progress",
  "resolved",
  "closed"
];

const CITIZEN_TIMELINE: Array<{ status: ProblemStatus; label: string }> = [
  { status: "submitted", label: "Problem submitted" },
  { status: "under_review", label: "Under government review" },
  { status: "validated", label: "Problem verified" },
  { status: "prioritized", label: "Priority assigned" },
  { status: "assigned", label: "University assigned" },
  { status: "in_progress", label: "Solution in progress" },
  { status: "resolved", label: "Resolved" },
  { status: "closed", label: "Closed" }
];

class ProblemsService {
  private readonly prisma = prisma;

  async create(citizenId: string, dto: CreateProblemDto) {
    const category = dto.categorySlug
      ? await this.prisma.problemCategory.findUnique({
          where: { slug: dto.categorySlug }
        })
      : null;

    const problem = await this.prisma.problem.create({
      data: {
        publicId: generatePublicId(),
        citizenId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        categoryId: category?.id ?? null,
        urgencyLevel: dto.urgencyLevel ?? null,
        peopleAffected: dto.peopleAffected ?? null,
        district: dto.district?.trim() || null,
        city: dto.city?.trim() || null,
        state: dto.state?.trim() || null,
        address: dto.address?.trim() || null,
        gpsLat: dto.gpsLat ?? null,
        gpsLng: dto.gpsLng ?? null,
        status: "submitted",
        statusEvents: {
          create: { toStatus: "submitted", actorId: citizenId }
        }
      }
    });

    await recordActivity({
      actorId: citizenId,
      action: "problem.submitted",
      entityType: "problem",
      entityId: problem.id,
      metadata: { publicId: problem.publicId }
    });

    // Best-effort enrichment - a failure here must not fail the submission.
    await this.runIntakePipeline(problem.id).catch((error) => {
      console.error("[problems] intake pipeline failed", error);
    });

    return this.getForOwner(problem.id, citizenId);
  }

  private async runIntakePipeline(problemId: string): Promise<void> {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: { category: true }
    });
    if (!problem) {
      return;
    }

    const analyzerInput = {
      title: problem.title,
      description: problem.description,
      citizenUrgency: problem.urgencyLevel,
      district: problem.district
    };

    let analysis;
    try {
      analysis = await analyzeProblem(analyzerInput);
      const resolvedCategory = analysis.categorySlug
        ? await this.prisma.problemCategory.findUnique({
            where: { slug: analysis.categorySlug }
          })
        : null;

      await this.prisma.problemAiAnalysis.upsert({
        where: { problemId },
        update: {
          status: "completed",
          modelName: analysis.model,
          inputHash: inputHash(analyzerInput),
          categoryGuess: analysis.categorySlug,
          subcategoryGuess: analysis.subcategoryGuess,
          severityGuess: analysis.severityGuess,
          requiredExpertise: analysis.requiredExpertise,
          suggestedSolutionAreas: analysis.suggestedSolutionAreas,
          summary: analysis.summary,
          reasons: analysis.reasons,
          uncertainties: analysis.uncertainties,
          confidenceScore: analysis.confidenceScore,
          needsReview: true,
          analysisJson: analysis as unknown as Prisma.InputJsonValue,
          errorMessage: null
        },
        create: {
          problemId,
          status: "completed",
          modelName: analysis.model,
          inputHash: inputHash(analyzerInput),
          categoryGuess: analysis.categorySlug,
          subcategoryGuess: analysis.subcategoryGuess,
          severityGuess: analysis.severityGuess,
          requiredExpertise: analysis.requiredExpertise,
          suggestedSolutionAreas: analysis.suggestedSolutionAreas,
          summary: analysis.summary,
          reasons: analysis.reasons,
          uncertainties: analysis.uncertainties,
          confidenceScore: analysis.confidenceScore,
          needsReview: true,
          analysisJson: analysis as unknown as Prisma.InputJsonValue
        }
      });

      await this.prisma.problem.update({
        where: { id: problemId },
        data: {
          categoryId: problem.categoryId ?? resolvedCategory?.id ?? null,
          severity: problem.severity ?? analysis.severityGuess ?? null,
          urgencyLevel: problem.urgencyLevel ?? analysis.urgencyGuess ?? null
        }
      });
    } catch (error) {
      await this.prisma.problemAiAnalysis.upsert({
        where: { problemId },
        update: {
          status: "failed",
          errorMessage: String(error)
        },
        create: {
          problemId,
          status: "failed",
          errorMessage: String(error)
        }
      });
    }

    // Duplicate suggestions (advisory).
    const refreshed = await this.prisma.problem.findUniqueOrThrow({
      where: { id: problemId }
    });
    const suggestions = await findSimilarProblems(refreshed);
    await persistDuplicateSuggestions(suggestions);

    // Provisional transparent priority. A verified score is recomputed by
    // an admin during review; this just orders the intake queue.
    await this.recomputePriority(problemId, null);
  }

  async recomputeByPublicId(publicId: string, actorId: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { publicId },
      select: { id: true }
    });
    if (!problem) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }
    await this.recomputePriority(problem.id, actorId);
    return this.getForRequester(publicId, actorId, "admin");
  }

  async recomputePriority(problemId: string, actorId: string | null) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: { category: true }
    });
    if (!problem) {
      return;
    }

    const duplicateCount = await this.prisma.problemDuplicate.count({
      where: { problemId, reviewStatus: { not: "rejected" } }
    });

    const districts = await this.prisma.problemDuplicate.findMany({
      where: { problemId },
      select: { similarProblem: { select: { district: true } } }
    });
    const districtSet = new Set(
      [
        problem.district,
        ...districts.map((d) => d.similarProblem.district)
      ].filter(Boolean) as string[]
    );

    const result = computePriority({
      severity: problem.severity,
      urgencyLevel: problem.urgencyLevel,
      peopleAffected: problem.peopleAffected,
      duplicateCount,
      districtSpread: Math.max(1, districtSet.size),
      categoryWeight: problem.category?.defaultPriorityWeight ?? 1
    });

    await this.prisma.$transaction([
      this.prisma.priorityScore.upsert({
        where: { problemId },
        update: {
          severityWeight: result.weights.severityWeight,
          urgencyWeight: result.weights.urgencyWeight,
          populationWeight: result.weights.populationWeight,
          duplicateWeight: result.weights.duplicateWeight,
          geographicWeight: result.weights.geographicWeight,
          socialImpactWeight: result.weights.socialImpactWeight,
          finalScore: result.finalScore,
          explanation: result as unknown as Prisma.InputJsonValue,
          calculatedById: actorId
        },
        create: {
          problemId,
          severityWeight: result.weights.severityWeight,
          urgencyWeight: result.weights.urgencyWeight,
          populationWeight: result.weights.populationWeight,
          duplicateWeight: result.weights.duplicateWeight,
          geographicWeight: result.weights.geographicWeight,
          socialImpactWeight: result.weights.socialImpactWeight,
          finalScore: result.finalScore,
          explanation: result as unknown as Prisma.InputJsonValue,
          calculatedById: actorId
        }
      }),
      this.prisma.problem.update({
        where: { id: problemId },
        data: { priorityScore: result.finalScore }
      })
    ]);

    return result;
  }

  async listMine(citizenId: string, pagination: PaginationDto) {
    const pageSize = resolvePageSize(pagination);
    const rows = await this.prisma.problem.findMany({
      where: { citizenId },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      ...(pagination.cursor
        ? { skip: 1, cursor: { id: pagination.cursor } }
        : {}),
      include: { category: true }
    });
    return buildPage(rows.map(toListItem), pageSize);
  }

  async listPublic(dto: ListProblemsDto) {
    const pageSize = resolvePageSize(dto);
    const where: Prisma.ProblemWhereInput = {
      status: dto.status
        ? { equals: dto.status as ProblemStatus }
        : { in: PUBLIC_STATUSES }
    };
    if (dto.district) {
      where.district = dto.district;
    }
    if (dto.categorySlug) {
      where.category = { slug: dto.categorySlug };
    }

    const rows = await this.prisma.problem.findMany({
      where,
      orderBy:
        dto.sort === "priority"
          ? [{ priorityScore: "desc" }, { createdAt: "desc" }]
          : { createdAt: "desc" },
      take: pageSize + 1,
      ...(dto.cursor ? { skip: 1, cursor: { id: dto.cursor } } : {}),
      include: { category: true }
    });
    return buildPage(rows.map(toListItem), pageSize);
  }

  async getPublic(publicId: string) {
    const problem = await this.loadDetail(publicId);
    if (!PUBLIC_STATUSES.includes(problem.status)) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }
    return this.present(problem, "public");
  }

  async getForRequester(publicId: string, requesterId: string, role: AppRole) {
    const problem = await this.loadDetail(publicId);
    if (role === "admin") {
      return this.present(problem, "admin");
    }
    if (problem.citizenId === requesterId) {
      return this.present(problem, "owner");
    }
    return this.getPublic(publicId);
  }

  private async getForOwner(problemId: string, ownerId: string) {
    const problem = await this.prisma.problem.findUniqueOrThrow({
      where: { id: problemId },
      include: DETAIL_INCLUDE
    });
    void ownerId;
    return this.present(problem, "owner");
  }

  private async loadDetail(publicId: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { publicId },
      include: DETAIL_INCLUDE
    });
    if (!problem) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }
    return problem;
  }

  private present(
    problem: Prisma.ProblemGetPayload<{ include: typeof DETAIL_INCLUDE }>,
    view: "public" | "owner" | "admin"
  ) {
    const timeline = CITIZEN_TIMELINE.map((step) => {
      const event = problem.statusEvents.find(
        (candidate) => candidate.toStatus === step.status
      );
      return {
        status: step.status,
        label: step.label,
        reachedAt: event?.createdAt ?? null,
        current: problem.status === step.status
      };
    });

    const base = {
      publicId: problem.publicId,
      title: problem.title,
      description: problem.description,
      status: problem.status,
      category: problem.category?.name ?? null,
      severity: problem.severity,
      urgencyLevel: problem.urgencyLevel,
      district: problem.district,
      city: problem.city,
      state: problem.state,
      gps:
        problem.gpsLat != null && problem.gpsLng != null
          ? { lat: problem.gpsLat, lng: problem.gpsLng }
          : null,
      priorityScore: problem.priorityScore,
      priorityExplanation: problem.priority?.explanation ?? null,
      createdAt: problem.createdAt,
      timeline,
      mediaCount: problem.media.length
    };

    if (view === "public") {
      return base;
    }

    const aiView = problem.aiAnalysis
      ? {
          status: problem.aiAnalysis.status,
          summary: problem.aiAnalysis.summary,
          uncertainties: problem.aiAnalysis.uncertainties,
          confidenceScore: problem.aiAnalysis.confidenceScore,
          label: "AI-generated - advisory only"
        }
      : null;

    if (view === "owner") {
      return {
        ...base,
        peopleAffected: problem.peopleAffected,
        rejectionReason: problem.rejectionReason,
        ai: aiView
      };
    }

    // admin
    return {
      ...base,
      citizen: {
        id: problem.citizen.id,
        fullName: problem.citizen.fullName,
        email: problem.citizen.email,
        district: problem.citizen.district
      },
      peopleAffected: problem.peopleAffected,
      rejectionReason: problem.rejectionReason,
      ai: problem.aiAnalysis,
      priority: problem.priority,
      duplicates: problem.duplicateOf.map((duplicate) => ({
        similarProblemId: duplicate.similarProblemId,
        similarityScore: duplicate.similarityScore,
        components: {
          text: duplicate.textScore,
          location: duplicate.locationScore,
          category: duplicate.categoryScore,
          date: duplicate.dateScore
        },
        reviewStatus: duplicate.reviewStatus
      })),
      statusEvents: problem.statusEvents
    };
  }
}

const DETAIL_INCLUDE = {
  category: true,
  citizen: true,
  aiAnalysis: true,
  priority: true,
  media: true,
  duplicateOf: true,
  statusEvents: { orderBy: { createdAt: "asc" } }
} satisfies Prisma.ProblemInclude;

function toListItem(
  problem: Prisma.ProblemGetPayload<{ include: { category: true } }>
) {
  return {
    id: problem.id,
    publicId: problem.publicId,
    title: problem.title,
    status: problem.status,
    category: problem.category?.name ?? null,
    district: problem.district,
    severity: problem.severity,
    priorityScore: problem.priorityScore,
    createdAt: problem.createdAt
  };
}

export const problemsService = new ProblemsService();
