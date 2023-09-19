<template>
  <div>
    <q-btn v-if="downloadUrl" @click="downloadFiles" color="primary">Download your files.</q-btn>
    <DropZone v-else :loading="loading" @files-changed="onFileChange" @upload="uploadFiles" />
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { GeneratorService } from '@/services/GeneratorService'
import { useAuth0 } from '@auth0/auth0-vue';
import DropZone from '@/components/DropZone.vue'

export default {
  components: {
    DropZone
  },
  setup() {
    const { user, getAccessTokenSilently } = useAuth0()
    const loading = ref(false)
    const downloadUrl = ref('')
    const selectedFiles = ref<FileList | null>(null);
    const accessToken = ref('');

    onMounted(async () => {
      accessToken.value = await getAccessTokenSilently()
    })

    const downloadFiles = () => {
      window.open(downloadUrl.value, '_blank')
    }

    const onFileChange = (files: FileList) => {
      console.log('change')
      selectedFiles.value = files;
    };

    const uploadFiles = async () => {
      if (!selectedFiles.value || selectedFiles.value.length === 0) {
        alert('Please select files to upload.');
        return;
      }

      try {
        loading.value = true
        const formData = new FormData();
        Array.from(selectedFiles.value).forEach((file, index) => {
          formData.append('files', file);
        });
        formData.append('customerId', user.value?.sub || '');

        const generatorService = new GeneratorService(accessToken.value);

        const response = await generatorService.transformMultipleFiles({ files: formData });

        downloadUrl.value = response.data.presignedUrl;

        console.log('Files uploaded successfully:', response.data);
      } catch (error) {
        console.error('An error occurred while uploading the files:', error);
      } finally {
        loading.value = false
      }
    };

    return {
      downloadFiles,
      selectedFiles,
      onFileChange,
      uploadFiles,
      downloadUrl,
      loading
    };
  },
};
</script>
