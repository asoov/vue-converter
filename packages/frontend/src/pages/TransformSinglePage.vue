<template>
  <h2 class="text-white">Input</h2>
  <CodeEditor v-model:input="inputCode" :show-copy-button="false" />
  <q-btn outline :loading="loading" label="Transform" @click="transformCode" class="q-ma-md transform-button" />
  <h2 class="text-white">Output</h2>
  <CodeEditor v-model:input="outputCode" @copy="copyOutputContentToClipboard" />
</template>

<script lang="ts">

import { ref, onMounted, VueElement, watch } from 'vue';
import { useAuth0 } from "@auth0/auth0-vue";
import { GeneratorService } from '@/services/GeneratorService'
import CodeEditor from '@/components/CodeEditor.vue'
import { QNotifyUpdateOptions, useQuasar } from 'quasar';

export default {
  components: {
    CodeEditor
  },
  setup() {
    const $q = useQuasar()

    const inputCode = ref('');
    const outputCode = ref('');
    const accessToken = ref('')

    const outputTextfield = ref<VueElement | null>(null)

    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    let notification: (q?: QNotifyUpdateOptions) => void

    const showPatienceNotification = () => {
      setTimeout(() => {
        notification = $q.notify({
          message: 'Depending on the size of the Vue component this can take up to 5 mins',
          timeout: 0, // indefinite
          closeBtn: true,
          type: 'info'
        })
      }, 1000)
    }
    const closePatienceNotification = () => {
      notification()
    }

    const copyOutputContentToClipboard = () => {
      console.log('copy')
      if (outputCode.value) {
        console.log('success')
        navigator.clipboard.writeText(outputCode.value);
        $q.notify('Copied to clipboard')
      }
    }
    watch(inputCode, (value) => {
      console.log(value)
    })

    const { getAccessTokenSilently, user } = useAuth0()
    onMounted(async () => {
      accessToken.value = await getAccessTokenSilently()
    })

    const transformCode = async () => {
      const generatorService = new GeneratorService(accessToken.value)
      if (!user.value?.sub) {
        console.error('No customerID present')
        error.value = 'Something went wrong authenticating yourself '
        return
      }

      try {
        loading.value = true
        showPatienceNotification()
        const { data } = await generatorService.transformSingleFile({ content: inputCode.value, customerId: user.value?.sub ?? '' })
        console.log(data)
        outputCode.value = data.content
      } catch (e) {
        $q.notify({ type: 'negative', message: 'Something went wrong transforming the file' })
        error.value = (e as Error).message
      } finally {
        closePatienceNotification()
        loading.value = false
      }

    };

    return {
      loading,
      inputCode,
      outputCode,
      outputTextfield,
      copyOutputContentToClipboard,
      transformCode,
    };
  },
};
</script>
