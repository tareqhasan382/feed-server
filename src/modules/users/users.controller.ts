import {
  Controller,
  Get,
  NotFoundException,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UPLOAD_FOLDERS } from '../uploads/constants/upload.constants';
import { imageFilePipe } from '../uploads/pipes/image-file.pipe';
import { UploadsService } from '../uploads/uploads.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({
    description: 'Authenticated user profile',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const profile = await this.usersService.findById(user.id);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image (jpg, jpeg, png, webp; max 5MB)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload or replace the authenticated user avatar' })
  @ApiOkResponse({
    description: 'Updated user profile with new avatar',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid file type or file exceeds size limit',
  })
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const upload = await this.uploadsService.uploadImage(
      file,
      UPLOAD_FOLDERS.AVATARS,
    );

    return this.usersService.updateAvatar(user.id, upload);
  }
}
