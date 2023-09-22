import { AxiosResponse } from "axios"
import { GenerateSingleVue3FileResponse } from 'utils'
import { BaseService } from "./BaseService"

export class GeneratorService extends BaseService {
  constructor(authToken: string) {
    super(authToken)
  }

  public async transformSingleFile({ content, customerId }: { content: string, customerId: string }): Promise<AxiosResponse<GenerateSingleVue3FileResponse>> {
    return await this.axios.post('/generate-web', {
      fileName: 'singlevuefile.vue',
      content,
      customerId
    })
  }

  public async transformMultipleFiles({ files }: { files: FormData }): Promise<any> {
    return await this.axios.post('http://localhost:9000/generate-web/multiple', files, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  public async calculateTokensForMultipleFiles({ files }: { files: FormData }): Promise<any> {
    return await this.axios.post('/generate-web/calculate-tokens', files, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

  }
}