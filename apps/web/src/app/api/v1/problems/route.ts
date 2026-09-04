import type { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/require-user";
import {
  HttpStatus,
  queryToObject,
  readJsonBody,
  validateDto,
  withRoute
} from "@/server/http";
import { CreateProblemDto } from "@/server/problems/dto/create-problem.dto";
import { ListProblemsDto } from "@/server/problems/dto/list-problems.dto";
import { problemsService } from "@/server/problems/problems.service";
import { getClientIp, rateLimit } from "@/server/rate-limit";

export const GET = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(ListProblemsDto, queryToObject(request));
  return problemsService.listPublic(dto);
});

export const POST = withRoute(async (request: NextRequest) => {
  // Only citizens and admins may file a report (docs role matrix).
  const user = requireRole(request, "citizen", "admin");
  rateLimit(`problem:create:${getClientIp(request)}`, 12, 60 * 60_000);
  const dto = await validateDto(CreateProblemDto, await readJsonBody(request));
  return problemsService.create(user.id, dto);
}, HttpStatus.CREATED);
