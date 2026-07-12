import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from '../constants/upload.constants';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_IMAGE_FILE_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (_req, file, callback) => {
        const isAllowed = (
          ALLOWED_IMAGE_MIME_TYPES as readonly string[]
        ).includes(file.mimetype);

        callback(null, isAllowed);
      },
    };
  }
}
