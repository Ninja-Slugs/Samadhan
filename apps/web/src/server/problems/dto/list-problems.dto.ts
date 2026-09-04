import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../pagination";

const SORTS = ["recent", "priority"] as const;

export class ListProblemsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsIn(SORTS)
  sort?: (typeof SORTS)[number];
}
