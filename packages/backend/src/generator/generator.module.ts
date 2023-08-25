import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { OpenAIService } from 'src/providers/openai.provider';

@Module({
  imports: [],
  controllers: [GeneratorController],
  providers: [GeneratorService, OpenAIService],
})
export class GeneratorModule { }
