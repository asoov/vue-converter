import { Injectable } from '@nestjs/common';
import { OpenAIService } from 'src/providers/openai.provider';
import { generateGPTPrompt } from './generator.utils';
import { GenerateMultipleVue3FilesResponse, GenerateSingleVue3FileRequest, GenerateSingleVue3FileResponse, VueFile } from 'utils';

@Injectable()
export class GeneratorService {
  constructor(private readonly openAiService: OpenAIService) { }

  async generateSingleVue3Template(vueFile: GenerateSingleVue3FileRequest): Promise<GenerateSingleVue3FileResponse> {
    const openAiResponse = await this.openAiService.client.chat.completions.create(generateGPTPrompt(vueFile.content));
    // TODO: sanitize Ai response
    console.log(openAiResponse.choices[0].message);
    return {
      content: openAiResponse.choices[0].message.content,
      fileName: vueFile.fileName
    }
  }

  async generateMultipleVue3Templates(vueFiles: Array<VueFile>): Promise<GenerateMultipleVue3FilesResponse> {
    const resultData: Array<VueFile> = await Promise.all(vueFiles.map(async (vueFile: VueFile) => {
      const openAiResponse = await this.openAiService.client.chat.completions.create(generateGPTPrompt(vueFile.content))
      return {
        content: openAiResponse.choices[0].message.content,
        fileName: vueFile.fileName
      }
    }))
    return {
      id: 'example',
      generatedVueFiles: resultData
    }
  }

}
