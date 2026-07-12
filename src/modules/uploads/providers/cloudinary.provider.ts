import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { EnvironmentVariables } from '../../../config/env.validation';

export const CLOUDINARY = Symbol('CLOUDINARY');

export const cloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<EnvironmentVariables, true>) => {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      api_key: configService.get('CLOUDINARY_API_KEY', { infer: true }),
      api_secret: configService.get('CLOUDINARY_API_SECRET', { infer: true }),
      secure: true,
    });

    return cloudinary;
  },
};
