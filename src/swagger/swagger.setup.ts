import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { NodeEnvironment } from '../config/env.validation';
import { swaggerConfig } from './swagger.config';

export function setupSwagger(app: INestApplication): void {
  const logger = new Logger('Swagger');
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<NodeEnvironment>('NODE_ENV', { infer: true });
  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED') ??
    (nodeEnv !== NodeEnvironment.Production ? 'true' : 'false');

  if (swaggerEnabled !== 'true') {
    logger.log('Swagger documentation is disabled');
    return;
  }

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    useGlobalPrefix: false,
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  logger.log('Swagger documentation available at /api/docs');
}
