import { GenerateMultipleVue3FilesRequest, GenerateMultipleVue3FilesResponse, VueFile, handleError } from "utils"
import axios, { AxiosResponse } from 'axios'

export const executeApiRequest = async (vueFiles: Array<VueFile>) => {
  const url = 'http://localhost:3000/generate/multiple';

  try {
    const response = await axios.post<GenerateMultipleVue3FilesResponse, AxiosResponse<GenerateMultipleVue3FilesResponse>, GenerateMultipleVue3FilesRequest>(url, { vueFilesToConvert: vueFiles }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.log((error as any).message)
  }
}