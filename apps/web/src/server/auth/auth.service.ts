import type { AppRole, User } from "@samadhan/database";
import { getEnv } from "../env";
import { AppException, HttpStatus } from "../http";
import { prisma } from "../prisma";
import { signAccessToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password.util";
import { addDuration, generateOpaqueToken, hashOpaqueToken } from "./token.util";

const EMAIL_PROVIDER = "email";

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

  async signup(
    input: {
      email: string;
      password?: string;
      fullName: string;
      role?: AppRole;
      district?: string;
      organizationName?: string;
    },
    meta?: SessionMeta
  ): Promise<{ user: ReturnType<typeof toPublicUser> } & TokenPair> {
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

    // No verification step for now: accounts (including throwaway/temp
    // emails) are created and signed in immediately from just a name and
    // email address. A password is optional; when omitted we still set one
    // internally so the account can also use password login later.
    const passwordHash = await hashPassword(
      input.password ?? generateOpaqueToken()
    );
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: input.fullName.trim(),
        role,
        district: input.district?.trim() || null,
        organizationName: input.organizationName?.trim() || null,
        emailVerifiedAt: new Date(),
        authAccounts: {
          create: {
            provider: EMAIL_PROVIDER,
            providerAccountId: email,
            passwordHash
          }
        }
      }
    });

    const tokens = await this.issueSession(user, meta);
    return { user: toPublicUser(user), ...tokens };
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

}

export const authService = new AuthService();
