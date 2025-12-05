import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_API_URL ? [
      process.env.NEXT_PUBLIC_API_URL.replace('/api', ''),
      'https://cryptomonitor.app',
      'http://localhost:3001'
    ] : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
