import { AppException, HttpStatus } from "../http";
import { prisma } from "../prisma";

// University matching (docs/SAMADHAN_Technical_Documentation.md #18). Every
// recommendation cites the expertise, department, location and capacity
// signals it used - never a bare number, and never inferred from prestige
// (docs/AI_RULES.md).

interface MatchReason {
  code: string;
  detail: string;
  points: number;
}

export interface UniversityMatch {
  universityId: string;
  name: string;
  district: string | null;
  state: string | null;
  score: number;
  capacityScore: number;
  reasons: MatchReason[];
}

const WEIGHTS = {
  expertise: 35,
  faculty: 20,
  lab: 15,
  pastWork: 10,
  studentSkills: 10,
  proximity: 5,
  capacity: 5
};

class MatchingService {
  private readonly prisma = prisma;

  async matchForProblem(publicId: string): Promise<UniversityMatch[]> {
    const problem = await this.prisma.problem.findUnique({
      where: { publicId },
      include: { aiAnalysis: true, category: true }
    });
    if (!problem) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "not_found",
        "Problem not found."
      );
    }

    const requiredExpertise = new Set(
      (problem.aiAnalysis?.requiredExpertise ?? []).map((tag) =>
        tag.toLowerCase()
      )
    );
    if (problem.category) {
      requiredExpertise.add(problem.category.name.toLowerCase());
    }

    const universities = await this.prisma.university.findMany({
      where: { status: "active" },
      include: {
        expertise: true,
        _count: { select: { members: true, projects: true } }
      }
    });

    const matches: UniversityMatch[] = universities.map((university) => {
      const reasons: MatchReason[] = [];
      const tags = university.expertise.map((entry) =>
        entry.expertiseTag.toLowerCase()
      );

      const overlap = tags.filter((tag) =>
        [...requiredExpertise].some(
          (required) => tag.includes(required) || required.includes(tag)
        )
      );
      const expertisePoints =
        requiredExpertise.size === 0
          ? 0
          : Math.round(
              (overlap.length / requiredExpertise.size) * WEIGHTS.expertise
            );
      if (overlap.length > 0) {
        reasons.push({
          code: "expertise_match",
          detail: `Matches expertise: ${[...new Set(overlap)].join(", ")}.`,
          points: expertisePoints
        });
      }

      const departments = new Set(
        university.expertise.map((entry) => entry.department).filter(Boolean)
      );
      const facultyPoints = Math.min(
        WEIGHTS.faculty,
        departments.size * 6 + (university._count.members > 0 ? 4 : 0)
      );
      if (facultyPoints > 0) {
        reasons.push({
          code: "faculty_capacity",
          detail: `${departments.size} relevant department(s), ${university._count.members} member(s) on platform.`,
          points: facultyPoints
        });
      }

      const labPoints = university.expertise.some((entry) => entry.labName)
        ? WEIGHTS.lab
        : Math.round(WEIGHTS.lab / 3);
      reasons.push({
        code: "facilities",
        detail: university.expertise.some((entry) => entry.labName)
          ? "Named labs registered for relevant areas."
          : "General facilities assumed - not yet verified.",
        points: labPoints
      });

      const pastWorkPoints = Math.min(
        WEIGHTS.pastWork,
        university._count.projects * 3
      );
      if (pastWorkPoints > 0) {
        reasons.push({
          code: "past_projects",
          detail: `${university._count.projects} prior SAMADHAN project(s).`,
          points: pastWorkPoints
        });
      }

      let proximityPoints = 0;
      if (problem.district && university.district === problem.district) {
        proximityPoints = WEIGHTS.proximity;
        reasons.push({
          code: "proximity",
          detail: `Same district as the problem (${problem.district}).`,
          points: proximityPoints
        });
      } else if (problem.state && university.state === problem.state) {
        proximityPoints = Math.round(WEIGHTS.proximity / 2);
        reasons.push({
          code: "proximity",
          detail: `Same state as the problem (${problem.state}).`,
          points: proximityPoints
        });
      }

      const capacityPoints = Math.round(
        (university.capacityScore / 100) * WEIGHTS.capacity
      );
      reasons.push({
        code: "capacity",
        detail: `Capacity score ${university.capacityScore}/100.`,
        points: capacityPoints
      });

      const studentPoints = Math.min(
        WEIGHTS.studentSkills,
        Math.round(overlap.length * 2.5)
      );

      const score = Math.min(
        100,
        expertisePoints +
          facultyPoints +
          labPoints +
          pastWorkPoints +
          proximityPoints +
          capacityPoints +
          studentPoints
      );

      return {
        universityId: university.id,
        name: university.name,
        district: university.district,
        state: university.state,
        score,
        capacityScore: university.capacityScore,
        reasons: reasons.sort((a, b) => b.points - a.points)
      };
    });

    return matches
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export const matchingService = new MatchingService();
