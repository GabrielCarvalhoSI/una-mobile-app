import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // B09 — Validação global com mensagens descritivas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remove campos não declarados no DTO
      forbidNonWhitelisted: true,// Rejeita requisições com campos extras
      transform: true,           // Converte tipos automaticamente (string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // B09 — Filtro global de erros com resposta padronizada
  app.useGlobalFilters(new AllExceptionsFilter())

  // CORS para mobile e web
  app.enableCors()

  // Swagger — documentação da API
  const config = new DocumentBuilder()
    .setTitle('Una API')
    .setDescription('Backend da plataforma de saúde menstrual Una — UFPE')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Una API rodando em http://localhost:${port}`)
  console.log(`Documentação em http://localhost:${port}/docs`)
}

bootstrap()
