import type { ProblemSeverity, UrgencyLevel } from "@samadhan/database";

// Transparent priority engine (docs/SAMADHAN_Technical_Documentation.md #16).
//
//   Priority = Severity + Urgency + Population + Duplicate pressure
//            + Geographic spread + Social impact
//
// Every component is a bounded, explainable number. The engine is
// deterministic and reproducible - AI may *suggest* a severity or urgency
// classification upstream, but the score itself never comes from a model.

export interface PriorityInput {
  severity: ProblemSeverity | null;
  urgencyLevel: UrgencyLevel | null;
  peopleAffected: number | null;
  duplicateCount: number;
  districtSpread: number; // distinct districts the cluster touches
  categoryWeight: number; // from ProblemCategory.defaultPriorityWeight
}

export interface PriorityComponent {
  key: string;
  label: string;
  value: number;
  max: number;
  reason: string;
}

export interface PriorityResult {
  finalScore: number;
  components: PriorityComponent[];
  weights: {
    severityWeight: number;
    urgencyWeight: number;
    populationWeight: number;
    duplicateWeight: number;
    geographicWeight: number;
    socialImpactWeight: number;
  };
  explanation: {
    summary: string;
    reasons: string[];
  };
}

const SEVERITY_POINTS: Record<ProblemSeverity, number> = {
  low: 8,
  medium: 16,
  high: 24,
  critical: 30
};

const URGENCY_POINTS: Record<UrgencyLevel, number> = {
  routine: 4,
  elevated: 10,
  urgent: 16,
  emergency: 20
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computePriority(input: PriorityInput): PriorityResult {
  const reasons: string[] = [];

  const severity = input.severity ? SEVERITY_POINTS[input.severity] : 10;
  if (input.severity) {
    reasons.push(`Severity assessed as ${input.severity}.`);
  } else {
    reasons.push("Severity not yet assessed - provisional midpoint used.");
  }

  const urgency = input.urgencyLevel ? URGENCY_POINTS[input.urgencyLevel] : 6;
  if (input.urgencyLevel) {
    reasons.push(`Citizen-reported urgency: ${input.urgencyLevel}.`);
  }

  const people = input.peopleAffected ?? 0;
  // 0 people -> 0, ~5000+ -> full 20, logarithmic in between.
  const population =
    people <= 0
      ? 0
      : clamp((Math.log10(people + 1) / Math.log10(5001)) * 20, 0, 20);
  if (people > 0) {
    reasons.push(
      `Approximately ${people.toLocaleString("en-IN")} people affected.`
    );
  }

  const duplicate = clamp(input.duplicateCount * 2.5, 0, 10);
  if (input.duplicateCount > 0) {
    reasons.push(
      `${input.duplicateCount} similar report(s) reinforce this problem.`
    );
  }

  const geographic = clamp((input.districtSpread - 1) * 5, 0, 10);
  if (input.districtSpread > 1) {
    reasons.push(`Reported across ${input.districtSpread} districts.`);
  }

  // Social impact potential scales the category weight into a 0-10 band.
  const socialImpact = clamp((input.categoryWeight - 0.8) * 12.5, 0, 10);
  if (socialImpact >= 6) {
    reasons.push(
      "Category carries high social-benefit potential once resolved."
    );
  }

  const components: PriorityComponent[] = [
    {
      key: "severity",
      label: "Severity",
      value: round1(severity),
      max: 30,
      reason: reasons[0]
    },
    {
      key: "urgency",
      label: "Urgency",
      value: round1(urgency),
      max: 20,
      reason: input.urgencyLevel
        ? `Citizen-reported urgency: ${input.urgencyLevel}.`
        : "No explicit urgency provided."
    },
    {
      key: "population",
      label: "Population impact",
      value: round1(population),
      max: 20,
      reason:
        people > 0
          ? `Scaled from ~${people.toLocaleString("en-IN")} people affected.`
          : "No population estimate provided."
    },
    {
      key: "duplicate",
      label: "Duplicate pressure",
      value: round1(duplicate),
      max: 10,
      reason: `${input.duplicateCount} similar report(s).`
    },
    {
      key: "geographic",
      label: "Geographic spread",
      value: round1(geographic),
      max: 10,
      reason: `${input.districtSpread} district(s) touched.`
    },
    {
      key: "socialImpact",
      label: "Social impact potential",
      value: round1(socialImpact),
      max: 10,
      reason: `Category weight ${input.categoryWeight}.`
    }
  ];

  const finalScore = round1(
    components.reduce((total, component) => total + component.value, 0)
  );

  return {
    finalScore,
    components,
    weights: {
      severityWeight: round1(severity),
      urgencyWeight: round1(urgency),
      populationWeight: round1(population),
      duplicateWeight: round1(duplicate),
      geographicWeight: round1(geographic),
      socialImpactWeight: round1(socialImpact)
    },
    explanation: {
      summary: `Priority ${finalScore}/100 - ${describeBand(finalScore)}.`,
      reasons
    }
  };
}

export function describeBand(score: number): string {
  if (score >= 75) return "critical priority";
  if (score >= 55) return "high priority";
  if (score >= 35) return "moderate priority";
  return "low priority";
}
