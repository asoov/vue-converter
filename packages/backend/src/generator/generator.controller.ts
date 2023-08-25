import { Controller, Post, Body } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { ConfigService } from '@nestjs/config';

@Controller('generate')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) { }

  @Post()
  public async generateSingle(@Body() vueFile): Promise<string> {
    return this.generatorService.generateSingleVue3Template(vueFile.content);
  }

  @Post('multiple')
  generateMultiple(): string {
    return this.generatorService.generateMultipleVue3Templates();
  }
}
