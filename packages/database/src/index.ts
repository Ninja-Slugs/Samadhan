// Single entrypoint for database access across SAMADHAN. Route handlers in
// apps/web import the generated Prisma client and domain types from here so
// there is exactly one place that knows where the schema lives.
export * from "@prisma/client";
export { PrismaClient } from "@prisma/client";
