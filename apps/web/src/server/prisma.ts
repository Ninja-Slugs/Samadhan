import { PrismaClient } from "@samadhan/database";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// On shared/containerized hosting `os.cpus().length` often reports the host
// machine's full core count, so Prisma's default pool size
// (num_cpus * 2 + 1) can silently balloon and exhaust the Supabase pooler.
// Force a small, known-safe limit.
function withConnectionLimit(url: string, limit: number): string {
  if (!url || url.includes("connection_limit=")) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=${limit}`;
}

// Cache on `global` in every environment: Next.js compiles route handlers
// into separate chunks even under a single `next start` process, and without
// this each chunk would open its own pool.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: withConnectionLimit(process.env.DATABASE_URL ?? "", 5) }
    }
  });

globalForPrisma.prisma = prisma;
