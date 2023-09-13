import { Module } from '@nestjs/common';
import { GeneratorController, GeneratorWebController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { OpenAIService } from 'src/providers/openai.provider';
import { UtilityService } from 'src/providers/utility.provider';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';

@Module({
  imports: [],
  controllers: [GeneratorController, GeneratorWebController],
  providers: [GeneratorService, OpenAIService, UtilityService, CloudWatchLogsService],
})
export class GeneratorModule { }
