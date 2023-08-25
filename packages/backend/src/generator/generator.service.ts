import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from "openai";

@Injectable()
export class GeneratorService {
  constructor(private configService: ConfigService) { }

  async generateSingleVue3Template(): Promise<string> {
    const openai = new OpenAI({ apiKey: this.configService.get<string>('OAI_KEY') })
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ "role": "user", "content": "Hello!" }],
    });
    console.log(chatCompletion.choices[0].message);
    return chatCompletion.choices[0].message as unknown as string;
  }
  generateMultipleVue3Templates(): string {
    return 'Hello World!';
  }
}
