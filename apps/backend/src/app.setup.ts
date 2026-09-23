import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import cookieParser = require('cookie-parser');

/** Global HTTP wiring shared by the real server (main.ts) and the e2e suite,
 *  so tests exercise exactly the pipes, interceptors and prefix production
 *  runs with. */
export function configureApp(app: INestApplication): INestApplication {
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable Class Serializer globally to respect @Exclude/@Expose
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  // cookie parser for refresh token cookie
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.setGlobalPrefix('api/v1');

  return app;
}
