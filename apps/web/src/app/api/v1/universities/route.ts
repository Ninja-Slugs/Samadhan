import { withRoute } from "@/server/http";
import { prisma } from "@/server/prisma";

export const GET = withRoute(async () => {
  const universities = await prisma.university.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    include: { expertise: { select: { expertiseTag: true } } }
  });
  return universities.map((university) => ({
    id: university.id,
    name: university.name,
    district: university.district,
    state: university.state,
    capacityScore: university.capacityScore,
    expertise: university.expertise.map((entry) => entry.expertiseTag)
  }));
});
