import { ConfigService } from "@nestjs/config";
import { Injectable } from '@nestjs/common';
import OpenAI from "openai";

@Injectable()
export class OpenAIService {
  public readonly client: OpenAI = null;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({ apiKey: configService.get<string>('OAI_KEY') })
  }
}