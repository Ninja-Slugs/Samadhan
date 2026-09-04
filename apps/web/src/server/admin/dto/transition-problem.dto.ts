import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

// Allowed forward transitions an admin can trigger directly.
const TARGETS = [
  "prioritized",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "archived"
] as const;

export class TransitionProblemDto {
  @IsIn(TARGETS)
  toStatus!: (typeof TARGETS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
