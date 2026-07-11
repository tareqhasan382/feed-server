import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Social Feed API')
  .setDescription('API documentation for the Social Feed application')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT access token',
      in: 'header',
    },
    'access-token',
  )
  .build();
