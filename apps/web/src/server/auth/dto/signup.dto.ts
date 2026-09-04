import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

const SELF_SERVICE_ROLES = [
  "citizen",
  "university_admin",
  "student",
  "faculty",
  "industry"
] as const;

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  fullName!: string;

  @IsOptional()
  @IsIn(SELF_SERVICE_ROLES)
  role?: (typeof SELF_SERVICE_ROLES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(160)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organizationName?: string;
}
