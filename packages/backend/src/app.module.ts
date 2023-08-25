import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratorModule } from './generator/generator.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [GeneratorModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
