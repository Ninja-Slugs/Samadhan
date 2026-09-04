import type { AppRole, User } from "@samadhan/database";
import { getEnv } from "../env";
import { AppException, HttpStatus } from "../http";
import { sendMail } from "../mail/mailer";
import { prisma } from "../prisma";
import { signAccessToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password.util";
import {
  addDuration,
  generateOpaqueToken,
  generateOtp,
  hashOpaqueToken
} from "./token.util";

const EMAIL_PROVIDER = "email";
const OTP_TTL = "15m";
const MAX_OTP_ATTEMPTS = 5;

// Self-service signup can never mint an admin. Government/admin accounts are
// provisioned out of band (docs/DATA_AND_SECURITY.md - "Admin access is
// explicit, reviewable, and audited").
const SELF_SERVICE_ROLES: AppRole[] = [
  "citizen",
  "university_admin",
  "student",
  "faculty",
  "industry"
];

export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    district: user.district,
    city: user.city,
    state: user.state,
    organizationName: user.organizationName,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerifiedAt !== null
  };
}

class AuthService {
  private readonly prisma = prisma;
  private readonly refreshTtl = getEnv("JWT_REFRESH_TTL", "30d");

  async signup(input: {
    email: string;
    password: string;
    fullName: string;
    role?: AppRole;
    district?: string;
    organizationName?: string;
  }): Promise<{ email: string }> {
    const email = normalizeEmail(input.email);
    const role = input.role ?? "citizen";

    if (!SELF_SERVICE_ROLES.includes(role)) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "role_not_self_service",
        "This account type cannot be created through signup."
      );
    }

    const existing = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: EMAIL_PROVIDER,
          providerAccountId: email
        }
      }
    });
    if (existing) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "email_already_registered",
        "An account with this email already exists."
      );
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: input.fullName.trim(),
        role,
        district: input.district?.trim() || null,
        organizationName: input.organizationName?.trim() || null,
        authAccounts: {
          create: {
            provider: EMAIL_PROVIDER,
            providerAccountId: email,
            passwordHash
          }
        }
      }
    });

    await this.issueVerificationOtp(user.id, email);
    return { email };
  }

  async resendVerification(email: string): Promise<{ email: string }> {
    const normalized = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalized }
    });
    // Do not reveal whether the address exists.
    if (user && !user.emailVerifiedAt) {
      await this.issueVerificationOtp(user.id, normalized);
    }
    return { email: normalized };
  }

  async verifyEmail(email: string, code: string, meta?: SessionMeta) {
    const normalized = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalized }
    });
    if (!user) {
      throw this.invalidCode();
    }
    if (user.emailVerifiedAt) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "already_verified",
        "This email address is already verified."
      );
    }

    const token = await this.prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: "desc" }
    });
    if (!token || token.expiresAt < new Date()) {
      throw this.invalidCode();
    }
    if (token.attempts >= MAX_OTP_ATTEMPTS) {
      throw new AppException(
        HttpStatus.TOO_MANY_REQUESTS,
        "too_many_attempts",
        "Too many incorrect attempts. Request a new code."
      );
    }
    if (token.tokenHash !== hashOpaqueToken(code)) {
      await this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } }
      });
      throw this.invalidCode();
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() }
      })
    ]);

    const verified = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id }
    });
    const tokens = await this.issueSession(verified, meta);
    return { user: toPublicUser(verified), ...tokens };
  }

  async login(email: string, password: string, meta?: SessionMeta) {
    const normalized = normalizeEmail(email);
    const account = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: EMAIL_PROVIDER,
          providerAccountId: normalized
        }
      },
      include: { user: true }
    });

    if (
      !account?.passwordHash ||
      !(await verifyPassword(account.passwordHash, password))
    ) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "invalid_credentials",
        "Invalid email or password."
      );
    }
    if (!account.user.isActive) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "account_disabled",
        "This account has been disabled."
      );
    }
    if (!account.user.emailVerifiedAt) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "email_not_verified",
        "Please verify your email address before logging in."
      );
    }

    const tokens = await this.issueSession(account.user, meta);
    return { user: toPublicUser(account.user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hashOpaqueToken(refreshToken) },
      include: { user: true }
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "invalid_refresh_token",
        "Invalid or expired refresh token."
      );
    }

    const newRefreshToken = generateOpaqueToken();
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashOpaqueToken(newRefreshToken),
        expiresAt: addDuration(new Date(), this.refreshTtl)
      }
    });

    return {
      accessToken: signAccessToken({
        sub: session.userId,
        sid: session.id,
        role: session.user.role
      }),
      refreshToken: newRefreshToken
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "unauthenticated",
        "Session is no longer valid."
      );
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() }
    });
    return toPublicUser(user);
  }

  private async issueSession(
    user: User,
    meta?: SessionMeta
  ): Promise<TokenPair> {
    const refreshToken = generateOpaqueToken();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashOpaqueToken(refreshToken),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt: addDuration(new Date(), this.refreshTtl)
      }
    });
    return {
      accessToken: signAccessToken({
        sub: user.id,
        sid: session.id,
        role: user.role
      }),
      refreshToken
    };
  }

  private async issueVerificationOtp(
    userId: string,
    email: string
  ): Promise<void> {
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() }
    });
    const code = generateOtp();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashOpaqueToken(code),
        expiresAt: addDuration(new Date(), OTP_TTL)
      }
    });
    await sendMail({
      to: email,
      subject: "Your SAMADHAN verification code",
      text: `Your verification code is ${code}. It expires in 15 minutes.`
    });
  }

  private invalidCode(): AppException {
    return new AppException(
      HttpStatus.BAD_REQUEST,
      "invalid_or_expired_code",
      "This code is invalid or has expired."
    );
  }
}

export const authService = new AuthService();
