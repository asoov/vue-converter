import {
  Controller,
  Post,
  Body,
  Headers
} from '@nestjs/common';
import { GeneratorService } from './generator.service';
import {
  GenerateSingleVue3FileResponse,
  GenerateSingleVue3FileRequest,
  GenerateMultipleVue3FilesRequest,
  GenerateMultipleVue3FilesResponse,
} from 'utils';
import { UtilityService } from 'src/providers/utility.provider';

@Controller('generate')
export class GeneratorController {
  constructor(
    private readonly generatorService: GeneratorService, private readonly utilityService: UtilityService,
  ) { }

  @Post()
  public async generateSingle(
    @Body() vueFile: GenerateSingleVue3FileRequest,
    @Headers() headers: Record<string, string>,
  ): Promise<GenerateSingleVue3FileResponse> {
    this.utilityService.checkRapidApiProxySecret(headers)
    return await this.generatorService.generateSingleVue3Template(vueFile);
  }

  @Post('check-component-validity')
  public checkValidity(@Body() { content }: { content: string }): {
    valid: boolean;
  } {
    return this.generatorService.checkVueFileContentLength(content);
  }

  @Post('multiple')
  public async generateMultiple(
    @Body() { vueFilesToConvert }: GenerateMultipleVue3FilesRequest,
  ): Promise<GenerateMultipleVue3FilesResponse> {
    return await this.generatorService.generateMultipleVue3Templates(
      vueFilesToConvert,
    );
  }
}
