<template>
  <div class="column">
    <div class="row">
      <q-btn @click="downloadFiles" color="primary">Download your files.</q-btn>
      <q-btn @click="backToStart">Back</q-btn>
    </div>
    <div>
      The Download-URL is valid for one week and will be saved to your account and is visible in the Dashboard.
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

// Define the props
const props = defineProps({
  downloadUrl: String
});

const emits = defineEmits(["resetDownloadUrl"]);

// Methods
const downloadFiles = () => {
  window.open(props.downloadUrl, '_blank');
};

const backToStart = () => {
  emits('resetDownloadUrl');
};
</script>