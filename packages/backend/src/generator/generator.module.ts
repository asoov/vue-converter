import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { OpenAIService } from 'src/providers/openai.provider';
import { UtilityService } from 'src/providers/utility.provider';

@Module({
  imports: [],
  controllers: [GeneratorController],
  providers: [GeneratorService, OpenAIService, UtilityService],
})
export class GeneratorModule {}
