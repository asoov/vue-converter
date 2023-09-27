<template>
  <q-card class="col my-card bg-primary text-white">
    <template v-if="loading">
      <q-card-section class="flex flex-center">
        <q-spinner size="lg" />
      </q-card-section>
    </template>
    <template v-else>
      <q-card-section>
        <div class="text-h2">Recent transformations:</div>
        <div class="">Files are available for download for 14 days after transformation.</div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <q-list :dense="true">
            <div v-if="customerData" v-for="process in processesFromLastTwoWeeks">
              <q-item class="q-w-100">
                <q-item-section>
                  <q-item-label>{{ new Date(process.timestamp).toLocaleString() }}</q-item-label>
                  <q-item-label lines="2">File count: {{ process.fileCount }}</q-item-label>
                </q-item-section>

                <q-item-section side top>
                  <q-btn @click="() => downloadFile(process.signedUrls[0])" color="secondary">Download again</q-btn>
                </q-item-section>
              </q-item>
              <q-separator color="white" spaced inset />
            </div>
          </q-list>
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import { Customer, Process } from 'utils';
import { computed, PropType } from 'vue';


const props = defineProps({
  customerData: {
    type: Object as PropType<Customer>,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false,
  }
})

const filterProcessesFromLastTwoWeeks = (processes: Process[] = []) => {
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days in milliseconds

  return processes.filter(process => new Date(process.timestamp) > twoWeeksAgo);
}

const processesFromLastTwoWeeks = computed(() => filterProcessesFromLastTwoWeeks(props.customerData?.finishedProcesses))

const downloadFile = (url: string): void => {
  window.open(url, '_blank')
}

</script>