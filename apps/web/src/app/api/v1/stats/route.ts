import { withRoute } from "@/server/http";
import { prisma } from "@/server/prisma";

// Public headline counters for the landing page. Aggregate only.
export const GET = withRoute(async () => {
  const [reported, inProgress, deployed, citizens] = await Promise.all([
    prisma.problem.count(),
    prisma.problem.count({
      where: { status: { in: ["assigned", "in_progress"] } }
    }),
    prisma.project.count({ where: { status: "completed" } }),
    prisma.user.count({ where: { role: "citizen" } })
  ]);

  return {
    problemsReported: reported,
    inProgress,
    solutionsDeployed: deployed,
    citizensImpacted: citizens
  };
});
