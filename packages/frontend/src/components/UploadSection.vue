<template>
  <template v-if="!loadingUpload">
    <DropZone @files-changed="onFileChange" class="col bg-primary text-white" />
    <q-card class="text-white col bg-primary">
      <q-card-section>
        Available Tokens:
        <q-spinner v-if="loadingGettingAvailableTokens" />
        <span v-else class="text-h4">
          <q-chip>
            {{ tokensAvailable }}
          </q-chip>
        </span>
      </q-card-section>
      <q-card-section>
        Tokens Needed:
        <q-spinner v-if="loadingCalculateNecessaryTokens" />
        <span v-if="tokensNeeded" class="text-h4">
          <q-chip>
            {{ tokensNeeded }}
          </q-chip>
        </span>
        <span v-else>-</span>
      </q-card-section>
    </q-card>
  </template>
  <div class="q-flex column q-gutter-md button-container">
    <div class="row q-gutter-sm q-mx-auto">
      <q-btn @click="uploadFiles" :disable="uploadButtonDisabled" :loading="loadingUpload" color="primary">Upload &
        Convert</q-btn>
      <q-btn @click="calculateTokens" :loading="loadingCalculateNecessaryTokens" color="primary">
        <div>
          Calculate necessary Tokens
        </div>
        <q-chip v-if="tokensNeeded" :style="{ marginLeft: '8px' }" size="sm">{{ tokensNeeded }}</q-chip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DropZone from '@/components/DropZone.vue';
import { GeneratorService } from '@/services/GeneratorService';
import { useAuth0 } from '@auth0/auth0-vue';
import { AxiosError } from 'axios';
import { CustomerService } from '@/services/CustomerService';

const { user, getAccessTokenSilently } = useAuth0();
let loadingUpload = ref(false);
let loadingCalculateNecessaryTokens = ref(false);
let loadingGettingAvailableTokens = ref(false);

const selectedFiles = ref<FileList | null>(null);

const accessToken = ref<string>('');

const tokensNeeded = ref<number | null>(null)
const tokensAvailable = ref<number>()

onMounted(async () => {
  accessToken.value = await getAccessTokenSilently()
  tokensAvailable.value = await getAvailableTokens()
})

const uploadButtonDisabled = computed<boolean>(() => {
  if (tokensAvailable.value === 0) {
    return true
  }
  if (tokensAvailable < tokensNeeded) {
    return true
  }
  return false
})

const onFileChange = (files: FileList) => {
  console.log('change')
  selectedFiles.value = files;
};

const emits = defineEmits(['handleErrorGetAvailableTokens', 'handleErrorCalculateTokens', 'handleErrorUploadFiles', 'downloadUrl'])

const getAvailableTokens = async () => {
  try {
    emits('handleErrorGetAvailableTokens', undefined)
    loadingGettingAvailableTokens.value = true
    const generatorService = new CustomerService(accessToken.value)
    if (!user.value?.sub) {
      throw new Error('no client id present')
    }
    const response = await generatorService.getCustomer(user.value?.sub)
    return response.data.aiCredits
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    emits('handleErrorGetAvailableTokens', new Error(axiosError.response?.data.message))
  } finally {
    loadingGettingAvailableTokens.value = false
  }
}

const calculateTokens = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) {
    alert('Please select files to upload.');
    return;
  }

  try {
    emits('handleErrorCalculateTokens', undefined)
    loadingCalculateNecessaryTokens.value = true

    const formData = new FormData();
    Array.from(selectedFiles.value).forEach((file, index) => {
      formData.append('files', file);
    });

    const generatorService = new GeneratorService(accessToken.value);

    const response = await generatorService.calculateTokensForMultipleFiles({ files: formData });

    tokensNeeded.value = response.data

  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    emits('handleErrorCalculateTokens', new Error(axiosError.response?.data.message))
  } finally {
    loadingCalculateNecessaryTokens.value = false
  }
}

const uploadFiles = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) {
    alert('Please select files to upload.');
    return;
  }
  try {
    emits('handleErrorUploadFiles', undefined)
    loadingUpload.value = true
    const formData = new FormData();
    Array.from(selectedFiles.value).forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('customerId', user.value?.sub || '');

    const generatorService = new GeneratorService(accessToken.value);

    const response = await generatorService.transformMultipleFiles({ files: formData });
    emits('downloadUrl', response.data.presignedUrl)
  } catch (error: any) {
    const axiosError = error as AxiosError<{ message: string }>
    emits('handleErrorUploadFiles', new Error(axiosError.response?.data.message))
  } finally {
    loadingUpload.value = false
  }
};

</script>

<style scoped>
.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
