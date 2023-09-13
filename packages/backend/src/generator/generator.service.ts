import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIService } from 'src/providers/openai.provider';
import {
  GenerateSingleVue3FileRequest,
  GenerateSingleVue3FileResponse,
} from 'utils';
import { UtilityService } from 'src/providers/utility.provider';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
import { Model } from 'dynamoose/dist/Model';
import * as dynamoose from 'dynamoose'
import { Customer } from 'src/customer/entities/customer.entity';
import { CustomerSchema } from 'src/customer/customer.schema';

@Injectable()
export class GeneratorService {
  private MAX_TOKEN_COUNT = 10000;
  private dbInstance: Model<Customer>;
  constructor(
    private readonly openAiService: OpenAIService,
    private readonly utilityService: UtilityService,
    private readonly cloudWatchLogsService: CloudWatchLogsService
  ) {
    this.dbInstance = dynamoose.model<Customer>('VueConverterTable2', CustomerSchema)
  }

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

  public async checkIfCustomerHasEnoughTokens({ customer, tokensNeeded }: { customer: Customer, tokensNeeded: number }): Promise<void> {
    if (customer.aiCredits < tokensNeeded) {
      throw new BadRequestException('You dont have enough AI Tokens. Make sure you recharge tokens in your account!')
    }
  }

  private async deductTokensFromCustomerAccount(customer: Customer, tokensNeeded: number) {
    const newTokenCount = customer.aiCredits - tokensNeeded
    await this.dbInstance.update({ id: customer.id }, {
      aiCredits: newTokenCount
    })
  }

  public async generateSingleVue3Template(
    vueFile: GenerateSingleVue3FileRequest,
  ): Promise<GenerateSingleVue3FileResponse> {
    const customerId = this.utilityService.removeAuth0Prefix(vueFile.customerId)
    const customer = await this.dbInstance.get({ id: customerId })
    const scriptToConvert = this.getScriptPartOfFile(vueFile.content);
    const tokensNeeded = this.utilityService.getNeededOpenAiTokenCountForString(scriptToConvert)
    this.checkIfCustomerHasEnoughTokens({ customer, tokensNeeded })

    const result = await this.generateVue3Content(scriptToConvert);
    await this.deductTokensFromCustomerAccount(customer, tokensNeeded)

    this.cloudWatchLogsService.logMessage(`successfully converted file: ${vueFile.fileName}`)
    console.log('RESULT', result)
    return {
      content: this.injectNewScriptIntoVueFile(vueFile.content, result.text),
      fileName: vueFile.fileName,
    };
  }

  // public async generateMultipleVue3Templates(
  //   vueFiles: Array<VueFile>,
  // ): Promise<GenerateMultipleVue3FilesResponse> {
  //   const resultData: Array<VueFile> = await Promise.all(
  //     vueFiles.map(async (vueFile: VueFile) => {
  //       return await this.generateSingleVue3Template(vueFile);
  //     }),
  //   );
  //   return {
  //     id: 'example',
  //     generatedVueFiles: resultData,
  //   };
  // }

  public checkVueFileContentLength(vueFileContent: string): { valid: boolean } {
    const tokensNeeded =
      this.utilityService.getNeededOpenAiTokenCountForString(vueFileContent);
    return { valid: tokensNeeded <= this.MAX_TOKEN_COUNT };
  }
}
