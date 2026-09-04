import { Type } from "class-transformer";
import { IsNumber, IsString, Max, MaxLength, Min } from "class-validator";

export class OverridePriorityDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  finalScore!: number;

  @IsString()
  @MaxLength(1000)
  reason!: string;
}
