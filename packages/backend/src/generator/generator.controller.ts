import { Controller, Get } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { ConfigService } from '@nestjs/config';

@Controller('generate')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) { }

  @Get()
  async generateSingle(): Promise<string> {
    return this.generatorService.generateSingleVue3Template();
  }

  @Get('multiple')
  generateMultiple(): string {
    return this.generatorService.generateMultipleVue3Templates();
  }
}
