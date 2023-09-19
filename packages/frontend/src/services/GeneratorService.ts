import axios, { Axios, AxiosResponse } from "axios"
import { GenerateSingleVue3FileResponse } from 'utils'

export class GeneratorService {

  private serverURL = import.meta.env.VITE_API_SERVER_URL
  private axios: Axios

  constructor(authToken: string) {
    console.log(this.serverURL)
    this.axios = axios.create({ baseURL: this.serverURL })
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  public async transformSingleFile({ content, customerId }: { content: string, customerId: string }): Promise<AxiosResponse<GenerateSingleVue3FileResponse>> {
    return await this.axios.post('/generate-web', {
      fileName: 'singlevuefile.vue',
      content,
      customerId
    })
  }

  public async transformMultipleFiles({ files }: { files: FormData }): Promise<any> {
    try {
      const response = await axios.post('http://localhost:9000/generate-web/multiple', files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response
    } catch (error) {
      console.error('An error occurred while uploading the files:', error);
    }
  }
}