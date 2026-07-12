import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadResult } from '../uploads/interfaces/upload-result.interface';
import { UploadsService } from '../uploads/uploads.service';
import { SafeUser, safeUserSelect } from './types/safe-user.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async findByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    refreshTokenHash: string | null;
  } | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        refreshTokenHash: true,
      },
    });
  }

  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<SafeUser> {
    return this.prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
      },
      select: safeUserSelect,
    });
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async findByIdWithRefreshToken(userId: string): Promise<{
    id: string;
    email: string;
    refreshTokenHash: string | null;
  } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        refreshTokenHash: true,
      },
    });
  }

  async updateAvatar(userId: string, upload: UploadResult): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true },
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: upload.secure_url,
        avatarPublicId: upload.public_id,
      },
      select: safeUserSelect,
    });

    if (existing?.avatarPublicId) {
      await this.uploadsService.deleteImage(existing.avatarPublicId);
    }

    return updated;
  }
}
