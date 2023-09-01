import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratorModule } from './generator/generator.module';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';
import { RateLimitMiddleware } from './middleware/rate-limiter';
import { CloudWatchLogsService } from './providers/cloudwatch-logs.service';

@Module({
  imports: [
    GeneratorModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudWatchLogsService],
  exports: [CloudWatchLogsService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes({ path: 'your-endpoint', method: RequestMethod.ALL });
  }
}
