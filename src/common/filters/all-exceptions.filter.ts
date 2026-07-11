import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.resolveException(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return { statusCode, message: exceptionResponse };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as Record<string, unknown>;
        const message = response.message;

        if (Array.isArray(message)) {
          return { statusCode, message: message.join(', ') };
        }

        if (typeof message === 'string') {
          return { statusCode, message };
        }
      }

      return { statusCode, message: exception.message };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(`Prisma error [${exception.code}]`, exception.message);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'A database error occurred',
      };
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error('Prisma validation error', exception.message);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided',
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error('Prisma initialization error', exception.message);
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database service is unavailable',
      };
    }

    if (exception instanceof Error) {
      this.logger.error('Unhandled exception', exception.stack);
    } else {
      this.logger.error('Unhandled exception', String(exception));
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
