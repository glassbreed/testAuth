import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'fs';
import { RootModule } from './modules/root.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpException, HttpStatus, LogLevel, ValidationError, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import { CONSOLE_LOG_LEVELS, NODE_ENV } from './constants';

const httpsOptions =
  NODE_ENV === 'production'
    ? undefined
    : {
        key: readFileSync('./certs/localhost.key'),
        cert: readFileSync('./certs/localhost.pem'),
      };

async function initializeApp() {
  const app = await NestFactory.create<NestExpressApplication>(
    RootModule,
    {
      httpsOptions,
      logger: CONSOLE_LOG_LEVELS as LogLevel[],
    }
  );
  app.useStaticAssets(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.use(json({ limit: '2mb' }));
  app.use(cookieParser());
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (
        validationErrors: ValidationError[] = []
      ) => {
        return new HttpException(
          validationErrors.reduce((acc, validationError, index) => {
            const childrenErrors = validationError.children.reduce(
              (acc, validationError, index) => {
                return (acc +=
                  (index ? ', ' : '') +
                  Object.values(
                    validationError.constraints || {}
                  ).join(', '));
              },
              ''
            );

            const errors = Object.values(
              validationError.constraints || {}
            );
            if (childrenErrors) errors.push(childrenErrors);
            return (
              acc +
              (index && validationErrors.length - 1 !== index
                ? ', '
                : '') +
              errors.join(', ')
            );
          }, ''),
          HttpStatus.BAD_REQUEST
        );
      },
    })
  );

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Test Auth Service')
    .setVersion('0.1')
    .addCookieAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3005);
}

initializeApp();
