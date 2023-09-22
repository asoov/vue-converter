<template>
  <div v-if="errors.length" v-for="error in errors" class="row q-mx-auto">
    <q-chip color="negative" text-color="white" icon="event">
      {{ error?.message }}
    </q-chip>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps({
  errors: { type: Array<Error>, default: [] }
})
</script>