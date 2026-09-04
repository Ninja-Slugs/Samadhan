import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { LoginDto } from "@/server/auth/dto/login.dto";
import { extractRequestMeta } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";
import { getClientIp, rateLimit } from "@/server/rate-limit";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(LoginDto, await readJsonBody(request));
  rateLimit(
    `login:${getClientIp(request)}:${dto.email.toLowerCase()}`,
    10,
    15 * 60_000
  );
  return authService.login(
    dto.email,
    dto.password,
    extractRequestMeta(request)
  );
});
