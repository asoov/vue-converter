import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from "openai";
import { OpenAIService } from 'src/providers/openai.provider';
import { generateGPTPrompt } from './generator.utils';
import { CompletionCreateParamsNonStreaming } from 'openai/resources/chat';

@Injectable()
export class GeneratorService {
  constructor(private readonly openAiService: OpenAIService) { }

  async generateSingleVue3Template(vueFileContent: string): Promise<string> {
    const chatCompletion = await this.openAiService.client.chat.completions.create(generateGPTPrompt(vueFileContent));
    console.log(chatCompletion.choices[0].message);
    return chatCompletion.choices[0].message as unknown as string;
  }
  generateMultipleVue3Templates(): string {
    return 'Hello World!';
  }
}
