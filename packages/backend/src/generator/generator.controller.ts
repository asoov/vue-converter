import { Controller, Post, Body } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { GenerateSingleVue3FileResponse, GenerateSingleVue3FileRequest, GenerateMultipleVue3FilesRequest, GenerateMultipleVue3FilesResponse } from 'utils'

@Controller('generate')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) { }

  @Post()
  public async generateSingle(@Body() vueFile: GenerateSingleVue3FileRequest): Promise<GenerateSingleVue3FileResponse> {
    return this.generatorService.generateSingleVue3Template(vueFile);
  }

  @Post('multiple')
  generateMultiple(@Body() { vueFilesToConvert }: GenerateMultipleVue3FilesRequest): Promise<GenerateMultipleVue3FilesResponse> {
    return this.generatorService.generateMultipleVue3Templates(vueFilesToConvert);
  }
}
