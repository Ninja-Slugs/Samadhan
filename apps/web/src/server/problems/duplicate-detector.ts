import type { Problem } from "@samadhan/database";
import { prisma } from "../prisma";

// Composite similarity (docs/SAMADHAN_Technical_Documentation.md #17). Stores
// the component scores separately and only ever produces a *suggestion* -
// merges require an authorised human (see admin duplicate review).

const REVIEW_THRESHOLD = 60;

export interface SimilarityBreakdown {
  problemId: string;
  similarProblemId: string;
  textScore: number;
  locationScore: number;
  categoryScore: number;
  dateScore: number;
  similarityScore: number;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 3)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  return intersection / (a.size + b.size - intersection);
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function findSimilarProblems(
  problem: Problem
): Promise<SimilarityBreakdown[]> {
  const candidates = await prisma.problem.findMany({
    where: {
      id: { not: problem.id },
      status: { notIn: ["rejected", "archived"] },
      OR: [
        problem.district ? { district: problem.district } : {},
        problem.categoryId ? { categoryId: problem.categoryId } : {}
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const sourceTokens = tokenize(`${problem.title} ${problem.description}`);
  const results: SimilarityBreakdown[] = [];

  for (const candidate of candidates) {
    const textScore = Math.round(
      jaccard(
        sourceTokens,
        tokenize(`${candidate.title} ${candidate.description}`)
      ) * 100
    );

    let locationScore = 0;
    if (
      problem.gpsLat != null &&
      problem.gpsLng != null &&
      candidate.gpsLat != null &&
      candidate.gpsLng != null
    ) {
      const distance = haversineKm(
        problem.gpsLat,
        problem.gpsLng,
        candidate.gpsLat,
        candidate.gpsLng
      );
      locationScore = Math.round(Math.max(0, 100 - distance * 20));
    } else if (problem.district && problem.district === candidate.district) {
      locationScore = 55;
    }

    const categoryScore =
      problem.categoryId && problem.categoryId === candidate.categoryId
        ? 100
        : 0;

    const daysApart = Math.abs(
      (problem.createdAt.getTime() - candidate.createdAt.getTime()) / 86_400_000
    );
    const dateScore = Math.round(Math.max(0, 100 - daysApart * 3));

    const composite = Math.round(
      textScore * 0.45 +
        locationScore * 0.25 +
        categoryScore * 0.2 +
        dateScore * 0.1
    );

    if (composite >= 35) {
      results.push({
        problemId: problem.id,
        similarProblemId: candidate.id,
        textScore,
        locationScore,
        categoryScore,
        dateScore,
        similarityScore: composite
      });
    }
  }

  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

export async function persistDuplicateSuggestions(
  suggestions: SimilarityBreakdown[]
): Promise<number> {
  let flagged = 0;
  for (const suggestion of suggestions) {
    await prisma.problemDuplicate.upsert({
      where: {
        problemId_similarProblemId: {
          problemId: suggestion.problemId,
          similarProblemId: suggestion.similarProblemId
        }
      },
      update: {
        similarityScore: suggestion.similarityScore,
        textScore: suggestion.textScore,
        locationScore: suggestion.locationScore,
        categoryScore: suggestion.categoryScore,
        dateScore: suggestion.dateScore
      },
      create: {
        problemId: suggestion.problemId,
        similarProblemId: suggestion.similarProblemId,
        similarityScore: suggestion.similarityScore,
        textScore: suggestion.textScore,
        locationScore: suggestion.locationScore,
        categoryScore: suggestion.categoryScore,
        dateScore: suggestion.dateScore,
        reviewStatus:
          suggestion.similarityScore >= REVIEW_THRESHOLD
            ? "needs_review"
            : "pending"
      }
    });
    if (suggestion.similarityScore >= REVIEW_THRESHOLD) {
      flagged += 1;
    }
  }
  return flagged;
}
