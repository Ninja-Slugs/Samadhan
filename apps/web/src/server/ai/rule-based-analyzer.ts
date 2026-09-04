import type { ProblemAnalysis } from "./types";

// Deterministic fallback classifier. Runs when no AI provider is configured
// or when a provider call fails - the platform never blocks a civic
// submission on a model (docs/AI_RULES.md).

interface Rule {
  slug: string;
  label: string;
  keywords: string[];
  expertise: string[];
  solutionAreas: string[];
  baseSeverity: ProblemAnalysis["severityGuess"];
}

const RULES: Rule[] = [
  {
    slug: "water-sanitation",
    label: "Water and Sanitation",
    keywords: [
      "water",
      "drinking",
      "contaminat",
      "sewage",
      "drainage",
      "toilet",
      "pipeline",
      "leak",
      "borewell",
      "tap"
    ],
    expertise: ["Water Management", "Environmental Engineering", "IoT"],
    solutionAreas: ["Water quality monitoring", "Filtration", "Leak detection"],
    baseSeverity: "high"
  },
  {
    slug: "public-health",
    label: "Public Health",
    keywords: [
      "disease",
      "outbreak",
      "hospital",
      "clinic",
      "mosquito",
      "dengue",
      "malaria",
      "sick",
      "health",
      "medicine",
      "sanitation"
    ],
    expertise: ["Public Health Informatics", "Epidemiology", "Data Science"],
    solutionAreas: ["Surveillance", "Awareness campaigns", "Vector control"],
    baseSeverity: "high"
  },
  {
    slug: "roads-transport",
    label: "Roads and Transport",
    keywords: [
      "road",
      "pothole",
      "traffic",
      "bridge",
      "footpath",
      "bus",
      "accident",
      "signal",
      "street"
    ],
    expertise: [
      "Civil Engineering",
      "Transport Planning",
      "Structural Engineering"
    ],
    solutionAreas: ["Road repair", "Traffic modelling", "Safety audits"],
    baseSeverity: "medium"
  },
  {
    slug: "electricity-energy",
    label: "Electricity and Energy",
    keywords: [
      "electric",
      "power",
      "outage",
      "transformer",
      "streetlight",
      "wire",
      "voltage",
      "solar"
    ],
    expertise: ["Electrical Engineering", "Renewable Energy", "Energy Systems"],
    solutionAreas: ["Grid reliability", "Solar micro-grids", "Load monitoring"],
    baseSeverity: "medium"
  },
  {
    slug: "waste-management",
    label: "Waste Management",
    keywords: [
      "garbage",
      "waste",
      "trash",
      "dump",
      "litter",
      "landfill",
      "compost",
      "plastic"
    ],
    expertise: ["Waste Management", "Environmental Engineering"],
    solutionAreas: ["Segregation systems", "Composting", "Collection routing"],
    baseSeverity: "medium"
  },
  {
    slug: "environment",
    label: "Environment",
    keywords: [
      "pollution",
      "air",
      "smoke",
      "tree",
      "deforest",
      "river",
      "lake",
      "encroach",
      "noise"
    ],
    expertise: ["Environmental Science", "GIS", "Ecology"],
    solutionAreas: ["Monitoring", "Restoration", "Community stewardship"],
    baseSeverity: "medium"
  },
  {
    slug: "public-safety",
    label: "Public Safety",
    keywords: [
      "safety",
      "crime",
      "harass",
      "dark",
      "unsafe",
      "fire",
      "flood",
      "hazard",
      "danger"
    ],
    expertise: ["Urban Planning", "Disaster Management", "Sensors"],
    solutionAreas: ["Lighting", "Early warning", "Risk mapping"],
    baseSeverity: "high"
  },
  {
    slug: "education",
    label: "Education",
    keywords: [
      "school",
      "teacher",
      "student",
      "classroom",
      "book",
      "education",
      "scholarship",
      "college"
    ],
    expertise: ["Education Technology", "Community Systems"],
    solutionAreas: ["Learning access", "Infrastructure", "Mentorship"],
    baseSeverity: "low"
  }
];

const EMERGENCY_WORDS = [
  "emergency",
  "urgent",
  "immediately",
  "dying",
  "death",
  "life threatening",
  "collapse",
  "flood",
  "fire"
];

export function analyzeWithRules(input: {
  title: string;
  description: string;
  citizenUrgency: string | null;
}): ProblemAnalysis {
  const text = `${input.title} ${input.description}`.toLowerCase();

  let best: { rule: Rule; hits: number } | null = null;
  for (const rule of RULES) {
    const hits = rule.keywords.filter((keyword) =>
      text.includes(keyword)
    ).length;
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { rule, hits };
    }
  }

  const emergency = EMERGENCY_WORDS.some((word) => text.includes(word));
  const uncertainties: string[] = [];

  if (!best) {
    uncertainties.push("No category keywords matched - defaulting to 'Other'.");
  }
  if (!input.citizenUrgency) {
    uncertainties.push("Citizen did not provide an urgency level.");
  }
  if (input.description.trim().length < 60) {
    uncertainties.push(
      "Description is short; classification confidence reduced."
    );
  }

  const rule = best?.rule;
  const severityGuess = emergency
    ? "critical"
    : (rule?.baseSeverity ?? "medium");
  const urgencyGuess = emergency
    ? "emergency"
    : input.citizenUrgency === "emergency"
      ? "emergency"
      : input.citizenUrgency === "urgent"
        ? "urgent"
        : "elevated";

  const confidence = best
    ? Math.min(0.85, 0.4 + best.hits * 0.12) - uncertainties.length * 0.05
    : 0.25;

  return {
    categorySlug: rule?.slug ?? "other",
    subcategoryGuess: null,
    severityGuess,
    urgencyGuess,
    requiredExpertise: rule?.expertise ?? ["Community Systems"],
    suggestedSolutionAreas: rule?.solutionAreas ?? ["Needs manual scoping"],
    summary: buildSummary(
      input.title,
      rule?.label ?? "an unclassified civic issue"
    ),
    reasons: best
      ? [
          `Matched ${best.hits} keyword(s) for "${rule?.label}".`,
          emergency ? "Emergency wording detected in the report." : ""
        ].filter(Boolean)
      : ["No strong category signal in the text."],
    uncertainties,
    confidenceScore: Math.max(0.1, Number(confidence.toFixed(2))),
    needsReview: true,
    model: "samadhan/rule-based-v1"
  };
}

function buildSummary(title: string, categoryLabel: string): string {
  const trimmed = title.trim().replace(/\s+/g, " ");
  return `Citizen report concerning ${categoryLabel.toLowerCase()}: "${trimmed}". Generated summary - review against the original submission.`;
}
