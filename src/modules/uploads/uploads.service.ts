import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadResponseCallback,
} from 'cloudinary';
import { v2 as CloudinaryV2 } from 'cloudinary';
import { UploadFolder } from './constants/upload.constants';
import { UploadResult } from './interfaces/upload-result.interface';
import { CLOUDINARY } from './providers/cloudinary.provider';

interface CloudinaryUploadOptions {
  folder: UploadFolder;
  public_id: string;
  resource_type: 'image';
  overwrite: boolean;
  unique_filename: boolean;
  use_filename: boolean;
  transformation: Array<{ quality: string; fetch_format: string }>;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof CloudinaryV2,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadResult> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.uploadFromBuffer(file.buffer, {
        folder,
        public_id: randomUUID(),
        resource_type: 'image',
        overwrite: false,
        unique_filename: false,
        use_filename: false,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      return this.mapUploadResult(result);
    } catch (error) {
      this.logger.error(
        `Cloudinary upload failed for folder "${folder}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Image upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    const trimmedPublicId = publicId.trim();

    if (!trimmedPublicId) {
      throw new BadRequestException('public_id is required');
    }

    try {
      const result = await this.cloudinary.uploader.destroy(trimmedPublicId, {
        resource_type: 'image',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Unexpected destroy result: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(
        `Cloudinary delete failed for public_id "${trimmedPublicId}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Image deletion failed');
    }
  }

  private uploadFromBuffer(
    buffer: Buffer,
    options: CloudinaryUploadOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const callback: UploadResponseCallback = (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary returned an empty upload result'));
          return;
        }

        resolve(result);
      };

      const uploadStream = this.cloudinary.uploader.upload_stream(
        options,
        callback,
      );

      uploadStream.end(buffer);
    });
  }

  private mapUploadResult(result: UploadApiResponse): UploadResult {
    if (
      !result.secure_url ||
      !result.public_id ||
      result.width == null ||
      result.height == null ||
      !result.format ||
      result.bytes == null
    ) {
      throw new Error('Incomplete Cloudinary upload response');
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }
}
