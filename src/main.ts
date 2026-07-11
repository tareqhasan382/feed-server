import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { NodeEnvironment } from './config/env.validation';
import { setupSwagger } from './swagger/swagger.setup';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', { infer: true });
  const nodeEnv = configService.get<NodeEnvironment>('NODE_ENV', { infer: true });
  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS', {
    infer: true,
  });
  const corsOrigins = (corsOriginsRaw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api/v1');

  app.use(
    helmet({
      contentSecurityPolicy:
        nodeEnv === NodeEnvironment.Production
          ? undefined
          : {
              directives: {
                defaultSrc: [`'self'`],
                styleSrc: [`'self'`, `'unsafe-inline'`],
                imgSrc: [`'self'`, 'data:', 'https://cdn.jsdelivr.net'],
                scriptSrc: [`'self'`, `'unsafe-inline'`],
              },
            },
    }),
  );

  app.enableCors({
    origin:
      nodeEnv === NodeEnvironment.Production
        ? corsOrigins
        : corsOrigins.length > 0
          ? corsOrigins
          : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupSwagger(app);

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`Application running on port ${port} [${nodeEnv}]`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Failed to start application',
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
