import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

// `prisma db seed` loads .env for us, but a bare `node prisma/seed.ts` does
// not - resolve the nearest .env (package dir, then repo root) so both work.
if (!process.env.DATABASE_URL) {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const candidate of [
    resolve(here, "../.env"),
    resolve(here, "../../../.env")
  ]) {
    if (existsSync(candidate)) {
      process.loadEnvFile(candidate);
      break;
    }
  }
}

const prisma = new PrismaClient();

// Safe development fixtures only (docs/adr/0002-database.md): a stable
// problem taxonomy plus a handful of universities and expertise tags so the
// matching engine has something to rank. No user accounts - those come from
// the real signup flow; promote the first admin with:
//   UPDATE users SET role = 'admin' WHERE email = '<you>';

const CATEGORIES: Array<{ name: string; slug: string; weight: number }> = [
  { name: "Water and Sanitation", slug: "water-sanitation", weight: 1.3 },
  { name: "Roads and Transport", slug: "roads-transport", weight: 1.1 },
  { name: "Electricity and Energy", slug: "electricity-energy", weight: 1.1 },
  { name: "Waste Management", slug: "waste-management", weight: 1.0 },
  { name: "Public Health", slug: "public-health", weight: 1.4 },
  { name: "Education", slug: "education", weight: 1.0 },
  { name: "Environment", slug: "environment", weight: 1.2 },
  { name: "Public Safety", slug: "public-safety", weight: 1.3 },
  {
    name: "Digital and Connectivity",
    slug: "digital-connectivity",
    weight: 0.9
  },
  { name: "Other", slug: "other", weight: 0.8 }
];

const UNIVERSITIES: Array<{
  name: string;
  state: string;
  district: string;
  city: string;
  expertise: string[];
}> = [
  {
    name: "Indian Institute of Technology Bombay",
    state: "Maharashtra",
    district: "Mumbai Suburban",
    city: "Mumbai",
    expertise: [
      "Water Management",
      "Environmental Engineering",
      "IoT",
      "Civil Engineering",
      "Energy Systems"
    ]
  },
  {
    name: "College of Engineering Pune",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    expertise: [
      "Structural Engineering",
      "Transport Planning",
      "Sensors",
      "Waste Management"
    ]
  },
  {
    name: "National Institute of Technology Trichy",
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
    city: "Tiruchirappalli",
    expertise: [
      "Public Health Informatics",
      "Data Science",
      "Renewable Energy",
      "Community Systems"
    ]
  }
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.problemCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, defaultPriorityWeight: category.weight },
      create: {
        name: category.name,
        slug: category.slug,
        defaultPriorityWeight: category.weight
      }
    });
  }

  for (const university of UNIVERSITIES) {
    const record = await prisma.university.upsert({
      where: { name: university.name },
      update: {
        state: university.state,
        district: university.district,
        city: university.city
      },
      create: {
        name: university.name,
        state: university.state,
        district: university.district,
        city: university.city
      }
    });

    for (const tag of university.expertise) {
      const existing = await prisma.universityExpertise.findFirst({
        where: { universityId: record.id, expertiseTag: tag }
      });
      if (!existing) {
        await prisma.universityExpertise.create({
          data: { universityId: record.id, expertiseTag: tag }
        });
      }
    }
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories and ${UNIVERSITIES.length} universities.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
