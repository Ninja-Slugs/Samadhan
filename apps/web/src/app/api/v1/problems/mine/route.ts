import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { queryToObject, validateDto, withRoute } from "@/server/http";
import { PaginationDto } from "@/server/pagination";
import { problemsService } from "@/server/problems/problems.service";

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const pagination = await validateDto(PaginationDto, queryToObject(request));
  return problemsService.listMine(user.id, pagination);
});
