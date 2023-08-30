import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIService } from 'src/providers/openai.provider';
import {
  GenerateMultipleVue3FilesResponse,
  GenerateSingleVue3FileRequest,
  GenerateSingleVue3FileResponse,
  VueFile,
} from 'utils';
import { UtilityService } from 'src/providers/utility.provider';

@Injectable()
export class GeneratorService {
  private MAX_TOKEN_COUNT = 10000;
  constructor(
    private readonly openAiService: OpenAIService,
    private readonly utilityService: UtilityService,
  ) { }

  private getScriptPartOfFile(string: string): string {
    return this.utilityService.extractJavaScriptFromHTML(string);
  }

  private injectNewScriptIntoVueFile(inputString: string, replacement: string) {
    return this.utilityService.replaceScriptTags(inputString, replacement);
  }

  private async generateVue3Content(scriptToConvert: string) {
    const tokensNeeded =
      this.utilityService.getNeededOpenAiTokenCountForString(scriptToConvert);
    if (tokensNeeded >= this.MAX_TOKEN_COUNT) {
      throw new BadRequestException('File is too large');
    }
    const prompt = this.openAiService.generateGPTLangChainPrompt();
    const chain = this.openAiService.getChain(prompt);

    return await chain.call({ stringifiedComponentCode: scriptToConvert });
  }

  public async generateSingleVue3Template(
    vueFile: GenerateSingleVue3FileRequest,
  ): Promise<GenerateSingleVue3FileResponse> {
    const scriptToConvert = this.getScriptPartOfFile(vueFile.content);
    const result = await this.generateVue3Content(scriptToConvert);
    return {
      content: this.injectNewScriptIntoVueFile(vueFile.content, result.text),
      fileName: vueFile.fileName,
    };
  }

  public async generateMultipleVue3Templates(
    vueFiles: Array<VueFile>,
  ): Promise<GenerateMultipleVue3FilesResponse> {
    const resultData: Array<VueFile> = await Promise.all(
      vueFiles.map(async (vueFile: VueFile) => {
        return await this.generateSingleVue3Template(vueFile);
      }),
    );
    return {
      id: 'example',
      generatedVueFiles: resultData,
    };
  }

  public checkVueFileContentLength(vueFileContent: string): { valid: boolean } {
    const tokensNeeded =
      this.utilityService.getNeededOpenAiTokenCountForString(vueFileContent);
    return { valid: tokensNeeded <= this.MAX_TOKEN_COUNT };
  }
}
