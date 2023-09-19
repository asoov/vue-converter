<template>
  <div class="row q-gutter-md">
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h4">Token Balance</div>
      </q-card-section>

      <q-card-section>
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink">Get More</q-btn>
      </q-card-actions>
    </q-card>
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h4">Usage</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h2"></div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink">Get More</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { computed, defineComponent } from 'vue';

const { user } = useAuth0()

const removeAuth0Prefix = (string?: string) => string?.replace(/^auth0\|/, '') || '';
const userId = computed(() => removeAuth0Prefix(user.value?.sub));
const paymentLink = computed(() => `https://buy.stripe.com/test_cN2cN7bWO6jc0EgfYZ?client_reference_id=${userId}`);


const openPaymentLink = () => {
  window.open(paymentLink.value, '_blank');
}

</script>
