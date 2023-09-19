import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIService } from 'src/providers/openai.provider';
import {
  GenerateSingleVue3FileRequest,
  GenerateSingleVue3FileResponse,
  VueFile,
} from 'utils';
import { UtilityService } from 'src/providers/utility.provider';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
import { Model } from 'dynamoose/dist/Model';
import * as dynamoose from 'dynamoose'
import { Customer } from 'src/customer/entities/customer.entity';
import { CustomerSchema } from 'src/customer/customer.schema';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { CustomerService } from 'src/customer/customer.service';
import { randomUUID } from 'crypto';
import * as Archiver from 'archiver';

@Injectable()
export class GeneratorService {

  private MAX_TOKEN_COUNT = 10000;
  private dbInstance: Model<Customer>;
  private s3 = new AWS.S3()

  constructor(
    private readonly openAiService: OpenAIService,
    private readonly utilityService: UtilityService,
    private readonly cloudWatchLogsService: CloudWatchLogsService,
    private readonly customerService: CustomerService
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

  public checkIfCustomerHasEnoughTokens({ customer, tokensNeeded }: { customer: Customer, tokensNeeded: number }): void {
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

  private calculateTokensNeededForMultipleFiles(files: Array<Express.Multer.File>): number {
    let tokensNeeded = 0;
    files.forEach((file) => {
      const fileContent = file.buffer.toString('utf-8')
      const scriptContentOfFile = this.getScriptPartOfFile(fileContent)
      tokensNeeded += this.utilityService.getNeededOpenAiTokenCountForString(scriptContentOfFile)
    })
    return tokensNeeded
  }

  public async createBucketWithLifecyclePolicy(bucketName: string) {
    // Step 1: Create a new bucket
    await this.s3.createBucket({ Bucket: bucketName }).promise();

    // Step 2: Set a lifecycle policy to delete objects after 2 weeks
    const lifecycleConfiguration = {
      Rules: [
        {
          Status: 'Enabled',
          Expiration: { Days: 14 },
          ID: 'Delete after 2 weeks',
          Prefix: '',
        },
      ],
    };

    await this.s3
      .putBucketLifecycleConfiguration({
        Bucket: bucketName,
        LifecycleConfiguration: lifecycleConfiguration,
      })
      .promise();
  }

  public async generateMultipleVue3Templates(
    vueFiles: Array<Express.Multer.File>,
    customerId: string
  ): Promise<any> {
    try {
      const sanitizedCustomerId = this.utilityService.removeAuth0Prefix(customerId)

      // Check if customer has enough tokens for files
      const tokensNeededForAllFiles = this.calculateTokensNeededForMultipleFiles(vueFiles)
      const customer = await this.customerService.getCustomerById(sanitizedCustomerId)
      this.checkIfCustomerHasEnoughTokens({ customer, tokensNeeded: tokensNeededForAllFiles })

      let processedFiles: GenerateSingleVue3FileResponse[] = []

      const bucketName = randomUUID()
      await this.createBucketWithLifecyclePolicy(bucketName)

      for (const file of vueFiles) {
        const fileContent = file.buffer.toString('utf-8');
        const fileName = file.originalname;

        const scriptContentOfFile = this.getScriptPartOfFile(fileContent)
        const tokensNeeded = this.utilityService.getNeededOpenAiTokenCountForString(scriptContentOfFile)

        const result = await this.generateVue3Content(scriptContentOfFile)
        await this.deductTokensFromCustomerAccount(customer, tokensNeeded)

        const newFileContent = this.injectNewScriptIntoVueFile(fileContent, result.text)

        processedFiles.push({ fileName, content: newFileContent })
      }

      const { zipFilePath, zipFileName, unlink } = await this.createZipFile(processedFiles)

      await this.s3.upload({
        Bucket: bucketName,
        Key: zipFileName,
        Body: fs.createReadStream(zipFilePath)
      }).promise()

      const presignedUrl = this.getPresignedUrl({
        bucketName,
        zipFileName
      })

      unlink()

      this.addBucketIdToCustomerDb(bucketName, customer, processedFiles.length, presignedUrl)

      return { presignedUrl }


    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
    finally {

    }
  }

  private getPresignedUrl({ bucketName, zipFileName }: { bucketName: string, zipFileName: string }) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: zipFileName,
      Expires: 60 * 60 * 24 * 7
    })
  }

  private async createZipFile(files: VueFile[]): Promise<{ zipFilePath: string, zipFileName: string, unlink: () => void }> {
    const zip = Archiver('zip');
    const zipFileName = `${randomUUID()}.zip`;
    const zipFilePath = `/tmp/${zipFileName}`;
    const output = fs.createWriteStream(zipFilePath);

    files.forEach(file => {
      zip.append(file.content, { name: file.fileName })
    })
    zip.pipe(output)

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      zip.on('error', reject);
      zip.finalize();
    });

    const unlink = () => fs.unlinkSync(zipFilePath)

    return { zipFilePath, zipFileName, unlink }
  }

  private async addBucketIdToCustomerDb(bucketName: string, customer: Customer, fileCount: number, signedUrl: string) {
    await this.dbInstance.update({ id: customer.id }, {
      finishedProcesses: [
        ...(customer.finishedProcesses),
        {
          timestamp: new Date().toDateString(),
          bucketName: bucketName,
          signedUrls: [signedUrl],
          fileCount: fileCount
        }
      ]
    })
  }

  public checkVueFileContentLength(vueFileContent: string): { valid: boolean } {
    const tokensNeeded =
      this.utilityService.getNeededOpenAiTokenCountForString(vueFileContent);
    return { valid: tokensNeeded <= this.MAX_TOKEN_COUNT };
  }
}
