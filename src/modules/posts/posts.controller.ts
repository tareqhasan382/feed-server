import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CursorPaginationQueryDto } from '../../common/dto/cursor-pagination-query.dto';
import { successResponse } from '../../common/utils/api-response.util';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { optionalImageFilePipe } from '../uploads/pipes/optional-image-file.pipe';
import { CreatePostBodyDto, CreatePostDto } from './dto/create-post.dto';
import {
  CreatePostApiResponseDto,
  PostDetailApiResponseDto,
  PostFeedApiResponseDto,
} from './dto/post-api-response.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@ApiBearerAuth('access-token')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostBodyDto })
  @ApiOperation({ summary: 'Create a new post with optional image' })
  @ApiCreatedResponse({
    description: 'Post created successfully',
    type: CreatePostApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid file type or file exceeds size limit',
  })
  async createPost(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(optionalImageFilePipe) image?: Express.Multer.File,
  ) {
    const post = await this.postsService.createPost(
      user.id,
      createPostDto,
      image,
    );

    return successResponse({ post }, 'Post created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get the social feed with cursor pagination' })
  @ApiOkResponse({
    description: 'Feed retrieved successfully',
    type: PostFeedApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid cursor or pagination params' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getFeed(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const feed = await this.postsService.getFeed(
      user.id,
      query.cursor,
      query.limit,
    );

    return successResponse(feed, 'Feed retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post details by ID' })
  @ApiOkResponse({
    description: 'Post retrieved successfully',
    type: PostDetailApiResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'Private post access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPostById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') postId: string,
  ) {
    const post = await this.postsService.getPostById(user.id, postId);

    return successResponse(post, 'Post retrieved successfully');
  }
}
