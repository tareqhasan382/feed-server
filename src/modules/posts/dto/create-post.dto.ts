import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '../../../../generated/prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post text content',
    example: 'Hello from my first post!',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    description: 'Post visibility',
    enum: Visibility,
    example: Visibility.PUBLIC,
  })
  @IsEnum(Visibility)
  visibility: Visibility;
}

export class CreatePostBodyDto extends CreatePostDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional post image (jpg, jpeg, png, webp; max 5MB)',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
