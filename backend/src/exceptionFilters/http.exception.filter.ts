import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import fs from 'fs';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
      if (req.file) {
        const file = req.file;
        await fs.promises.unlink(file.path);
      } else if (req.files) {
        const fileskeys = Object.keys(req.files);
        for (const key of fileskeys)
          await fs.promises.unlink(req.files[key][0].path);
      }
    }

    const exceptionResponse = exception.getResponse() as {
      text: string;
      pointer: string;
    };

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: exceptionResponse.text || exception.message,
    });
  }
}

export class HttpExceptionFilterResDto {
  @IsNumber()
  @ApiProperty()
  statusCode: number;

  @IsString()
  @ApiProperty()
  timestamp: string;

  @IsString()
  @ApiProperty()
  path: string;

  @IsString()
  @ApiProperty()
  message: string;
}
