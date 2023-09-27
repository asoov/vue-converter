<template>
  <q-card class="col my-card bg-primary text-white">
    <q-card-section>
      <div class="text-h4">Token Balance</div>
    </q-card-section>

    <q-card-section>
      <div v-if="customerData?.aiCredits !== (null || undefined)" class="text-h2">{{ customerData.aiCredits }}</div>
      <q-spinner v-else color="white" size="3em" />
    </q-card-section>

    <q-card-actions>
      <q-btn to="/buytokens" flat>Get More</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { Customer } from 'utils';
import { PropType } from 'vue';

defineProps({
  customerData: {
    type: Object as PropType<Customer>
  }
})
</script>