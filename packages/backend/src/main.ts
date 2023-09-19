import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dynamoose from 'dynamoose';

async function bootstrap() {
  const ddb = new dynamoose.aws.ddb.DynamoDB({
    region: 'eu-central-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  dynamoose.aws.ddb.set(ddb);
  const app = await NestFactory.create(AppModule, { rawBody: true });
  console.log(process.env.PORT)

  app.enableCors()
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
