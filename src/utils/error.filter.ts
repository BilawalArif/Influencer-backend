import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppError } from './appError'; 

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    if (exception instanceof AppError) {
      const responseBody = {
        statusCode: exception.statusCode,
        timestamp: new Date().toISOString(),
        message: exception.message,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, exception.statusCode);
    } else if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        message: exception.message,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
     else {
      const responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        message: 'Internal Server Error',
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };

      httpAdapter.reply(
        ctx.getResponse(),
        responseBody,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
