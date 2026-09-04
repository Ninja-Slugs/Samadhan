import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from "class-validator";

const DECISIONS = ["verify", "reject", "request_info"] as const;
const SEVERITY = ["low", "medium", "high", "critical"] as const;
const URGENCY = ["routine", "elevated", "urgent", "emergency"] as const;

export class ReviewProblemDto {
  @IsIn(DECISIONS)
  decision!: (typeof DECISIONS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  // Admin overrides applied before the priority is recomputed.
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsIn(SEVERITY)
  severity?: (typeof SEVERITY)[number];

  @IsOptional()
  @IsIn(URGENCY)
  urgencyLevel?: (typeof URGENCY)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  peopleAffected?: number;
}
