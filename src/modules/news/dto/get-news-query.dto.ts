import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetNewsQueryDto {
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  competitionSlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
