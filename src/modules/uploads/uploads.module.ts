import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './config/multer.config';
import { cloudinaryProvider } from './providers/cloudinary.provider';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  providers: [cloudinaryProvider, UploadsService],
  exports: [UploadsService, MulterModule],
})
export class UploadsModule {}
