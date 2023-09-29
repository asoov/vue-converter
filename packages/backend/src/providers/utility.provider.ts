import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { encode } from 'gpt-3-encoder';
@Injectable()
export class UtilityService {
  private RAPID_API_PROXY_SECRET_HEADER_KEY = 'x-rapidapi-proxy-secret';
  constructor(private readonly configService: ConfigService) { }

  checkRapidApiProxySecret(headers: Record<string, string>): void {
    if (!headers[this.RAPID_API_PROXY_SECRET_HEADER_KEY]) {
      throw new BadRequestException('No Proxy Secret provided.');
    }
    const receivedRapidApiProxySecret =
      headers[this.RAPID_API_PROXY_SECRET_HEADER_KEY];
    const correctRapidApiProxySecret = this.configService.get<string>(
      'RAPID_API_PROXY_SECRET',
    );
    if (receivedRapidApiProxySecret !== correctRapidApiProxySecret) {
      throw new BadRequestException('Incorrect Proxy Secret');
    }
  }

  getNeededOpenAiTokenCountForString(string: string): number {
    try {
      const encoded = encode(string);
      return encoded.length;
    } catch (error) {
      console.error(error);
    }
  }

  removeAuth0Prefix(string: string): string {
    return string.replace(/^auth0\|/, '');
  }

  replaceScriptTags(inputString: string, replacement: string) {
    console.log('INPUT', inputString)
    console.log('REPLACEMENT', replacement)
    return inputString.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      replacement,
    );
  }

  extractJavaScriptFromHTML(string: string): string {
    const scriptTags = string.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi);

    if (scriptTags) {
      const javascriptCode = scriptTags.join('\n');
      return javascriptCode;
    }

    return '';
  }
}
