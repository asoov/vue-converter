import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CompletionCreateParamsNonStreaming } from 'openai/resources/chat';
import { LLMChain, PromptTemplate } from 'langchain';

@Injectable()
export class OpenAIService {
  public readonly client: OpenAI = null;
  private readonly langChainModel: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
    });
    this.langChainModel = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      temperature: 0,
    });
  }

  getChain(prompt: PromptTemplate) {
    return new LLMChain({ llm: this.langChainModel, prompt });
  }

  generateGPTLangChainPrompt(): PromptTemplate {
    return PromptTemplate.fromTemplate<{ stringifiedComponentCode: string }>(`
    This code is VueJS code that is not Version 3 and is not using the composition API. It is code contained in a script tag.
    Please change this code that composition API is implemented. Just return the code, no explaining text.
    The code can be a chunk of a bigger piece of code. If this is the case just format it so it can be combined again.
    This is the code {stringifiedComponentCode}.
    `);
  }

  generateGPTPrompt(
    stringifiedComponentCode: string,
  ): CompletionCreateParamsNonStreaming {
    return {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `
        This code is VueJS code that is not Version 3 and is not using the composition API. 
        Please change this code that composition API is implemented. Just return the code, no explaining text.
        This is the code ${stringifiedComponentCode}.
        Always make sure the whole component is returned including template, script and style.
        If you come across special properties prefixed with a '$' make sure to destructure it from the context parameter in the setup function.
        `,
        },
      ],
    };
  }
}
