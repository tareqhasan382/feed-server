import {
  HttpStatus,
  ParseFilePipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { MAX_IMAGE_FILE_SIZE_BYTES } from '../constants/upload.constants';

export const optionalImageFilePipe: ParseFilePipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /^image\/(jpe?g|png|webp)$/,
  })
  .addMaxSizeValidator({
    maxSize: MAX_IMAGE_FILE_SIZE_BYTES,
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    fileIsRequired: false,
  });
