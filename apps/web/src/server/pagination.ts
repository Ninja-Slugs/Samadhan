import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  pageSize?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export interface Page<T> {
  data: T[];
  meta: {
    pageSize: number;
    nextCursor: string | null;
  };
}

export function resolvePageSize(pagination: PaginationDto): number {
  return pagination.pageSize ?? DEFAULT_LIMIT;
}

export function buildPage<T extends { id: string }>(
  rows: T[],
  pageSize: number
): Page<T> {
  const hasMore = rows.length > pageSize;
  const data = hasMore ? rows.slice(0, pageSize) : rows;
  return {
    data,
    meta: {
      pageSize,
      nextCursor: hasMore ? data[data.length - 1].id : null
    }
  };
}
