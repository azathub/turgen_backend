import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great analysis!', maxLength: 5000 })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}
