import { PrismaClient } from "@samadhan/database";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Tolerate a value pasted with surrounding quotes/whitespace in a hosting
// panel's env editor, and cap the pool (containerized hosts over-report CPU
// count, which would otherwise balloon Prisma's default pool and exhaust the
// Supabase pooler). Validation of the URL itself is left to Prisma, which
// does it lazily on first query - so `next build` never needs a live
// DATABASE_URL.
function resolveDatabaseUrl(): string {
  const raw = (process.env.DATABASE_URL ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!raw || raw.includes("connection_limit=")) {
    return raw;
  }
  return `${raw}${raw.includes("?") ? "&" : "?"}connection_limit=5`;
}

// Cache on `global` in every environment: Next.js compiles route handlers
// into separate chunks even under a single `next start` process, and without
// this each chunk would open its own pool.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } }
  });

globalForPrisma.prisma = prisma;
