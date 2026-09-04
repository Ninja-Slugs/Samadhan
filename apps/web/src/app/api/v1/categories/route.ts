import { withRoute } from "@/server/http";
import { prisma } from "@/server/prisma";

export const GET = withRoute(async () => {
  const categories = await prisma.problemCategory.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true }
  });
  return categories;
});
