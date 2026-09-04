import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

const URGENCY = ["routine", "elevated", "urgent", "emergency"] as const;

export class CreateProblemDto {
  @IsString()
  @MinLength(6)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  description!: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsIn(URGENCY)
  urgencyLevel?: (typeof URGENCY)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  peopleAffected?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  gpsLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  gpsLng?: number;
}
