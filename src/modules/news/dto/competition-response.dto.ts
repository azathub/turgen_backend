import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompetitionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Premier League' })
  name!: string;

  @ApiProperty({ example: 'premier-league' })
  slug!: string;

  @ApiProperty({ example: 1 })
  category_id!: number;

  @ApiPropertyOptional({
    example: 'https://placehold.co/600x400?text=Premier%20League',
    nullable: true,
  })
  image_url!: string | null;
}
