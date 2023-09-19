import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { GeneratorService } from './generator.service';
import {
  GenerateSingleVue3FileResponse,
  GenerateSingleVue3FileRequest,
  GenerateMultipleVue3FilesRequest,
  GenerateMultipleVue3FilesResponse,
} from 'utils';
import fs from 'fs';
import path from 'path';
import { UtilityService } from 'src/providers/utility.provider';
import { AuthorizationGuard } from 'src/authorization/authorization.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('generate-web')
export class GeneratorWebController {
  constructor(
    private readonly generatorService: GeneratorService, private readonly utilityService: UtilityService,
  ) { }

  @UseGuards(AuthorizationGuard)
  @Post()
  public async generateSingle(
    @Body() vueFile: GenerateSingleVue3FileRequest,
    @Headers() headers: Record<string, string>,
  ): Promise<GenerateSingleVue3FileResponse> {
    return await this.generatorService.generateSingleVue3Template(vueFile);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async generateMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('customerId') customerId: string
  ) {
    return await this.generatorService.generateMultipleVue3Templates(files, customerId)
  }

}

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

  // @Post('multiple')
  // public async generateMultiple(
  //   @Body() { vueFilesToConvert }: GenerateMultipleVue3FilesRequest,
  // ): Promise<GenerateMultipleVue3FilesResponse> {
  //   return await this.generatorService.generateMultipleVue3Templates(
  //     vueFilesToConvert,
  //   );
  // }
}
