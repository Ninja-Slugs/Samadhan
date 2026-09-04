import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { RefreshDto } from "@/server/auth/dto/refresh.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(RefreshDto, await readJsonBody(request));
  return authService.refresh(dto.refreshToken);
});
