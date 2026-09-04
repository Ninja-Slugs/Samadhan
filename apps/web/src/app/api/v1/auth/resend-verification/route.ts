import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { ResendVerificationDto } from "@/server/auth/dto/resend-verification.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";
import { getClientIp, rateLimit } from "@/server/rate-limit";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(
    ResendVerificationDto,
    await readJsonBody(request)
  );
  rateLimit(`resend:${getClientIp(request)}`, 5, 15 * 60_000);
  return authService.resendVerification(dto.email);
});
