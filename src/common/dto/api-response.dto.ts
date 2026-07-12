import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data: T;
}

export class PaginatedMetaDto {
  @ApiProperty({
    description: 'Cursor for the next page, null when no more results',
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTEyVDEwOjAwOjAwLjAwMFoiLCJpZCI6ImNseHl6MTIzIn0',
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;
}
