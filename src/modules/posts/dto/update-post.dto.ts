import { ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '../../../../generated/prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Post text content',
    example: 'Updated post content',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    description: 'Post visibility',
    enum: Visibility,
    example: Visibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}

export class UpdatePostBodyDto extends UpdatePostDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional replacement image (jpg, jpeg, png, webp; max 5MB)',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
