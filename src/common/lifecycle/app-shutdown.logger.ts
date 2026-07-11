import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class AppShutdownLogger implements OnApplicationShutdown {
  private readonly logger = new Logger(AppShutdownLogger.name);

  onApplicationShutdown(signal?: string): void {
    this.logger.log(
      `Application shutting down${signal ? ` (${signal})` : ''}`,
    );
  }
}
