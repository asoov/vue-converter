<template>
  <div>
    <DownloadSection v-if="downloadUrl" :downloadUrl="downloadUrl" @resetDownloadUrl="downloadUrl = ''" />
    <div class="row q-gutter-md " v-else>
      <UploadSection @handle-error-calculate-tokens="(error) => errorCalculateTokens = error"
        @handle-error-get-available-tokens="(error) => errorGetAvailableTokens = error"
        @handle-error-upload-files="(error) => errorUploadFiles = error"
        @download-url="(newDownloadUrl) => downloadUrl = newDownloadUrl" />
      <ErrorSection :errors="errors" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import DropZone from '@/components/DropZone.vue'
import UploadSection from '@/components/UploadSection.vue';
import DownloadSection from '@/components/DownloadSection.vue';
import ErrorSection from '@/components/ErrorSection.vue';

export default {
  components: {
    DropZone,
    UploadSection,
    ErrorSection,
    DownloadSection
  },
  setup() {
    const errorUploadFiles = ref<Error>()
    const errorCalculateTokens = ref<Error>()
    const errorGetAvailableTokens = ref<Error>()

    const downloadUrl = ref<string>('')

    const errors = computed<Error[]>(() => {
      const errors = [errorCalculateTokens.value, errorGetAvailableTokens.value, errorUploadFiles.value]
      const errorsFiltered: Error[] = errors.filter((error): error is Error => error !== undefined)
      return errorsFiltered
    })

    return {
      downloadUrl,
      errorUploadFiles,
      errorCalculateTokens,
      errorGetAvailableTokens,
      errors
    };
  },
};
</script>
