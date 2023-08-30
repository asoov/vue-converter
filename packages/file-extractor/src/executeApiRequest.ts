import { GenerateSingleVue3FileRequest, GenerateSingleVue3FileResponse, VueFile } from "utils";
import axios, { AxiosResponse } from 'axios';

const MAX_CONCURRENT_REQUESTS = 5; // set your own limit

export async function executeApiRequest(vueFiles: Array<VueFile>) {
  const singleUrl = 'http://localhost:3000/generate';

  const executeRequest = async (file: VueFile) => {
    try {
      const response = await axios.post<GenerateSingleVue3FileResponse, AxiosResponse<GenerateSingleVue3FileResponse>, GenerateSingleVue3FileRequest>(singleUrl, file, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  };

  let activePromises = 0;
  const results: GenerateSingleVue3FileResponse[] = [];
  const errors: any[] = [];

  const processQueue = async () => {
    if (vueFiles.length === 0) return;

    const file = vueFiles.pop();
    activePromises += 1;

    const result = await executeRequest(file!);

    if (result.success) {
      results.push(result.data as any);
    } else {
      errors.push(result.error as never);
    }

    activePromises -= 1;
    if (activePromises < MAX_CONCURRENT_REQUESTS) {
      processQueue(); // process next file if we're below the limit
    }
  };

  // Kickstart the initial batch
  for (let i = 0; i < Math.min(MAX_CONCURRENT_REQUESTS, vueFiles.length); i++) {
    processQueue();
  }

  // Wait for all to complete
  while (activePromises > 0 || vueFiles.length > 0) {
    await new Promise(r => setTimeout(r, 100));
  }

  return { generatedVueFiles: results, errors };
}

export default executeApiRequest;
