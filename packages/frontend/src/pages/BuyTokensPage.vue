<template>
  <BuyTokensContentSection />
  <div class="row q-gutter-md">
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h2">1000 Tokens</div>
      </q-card-section>

      <q-card-section>
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink">Buy!</q-btn>
      </q-card-actions>
    </q-card>
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h2">10000 Tokens</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h2"></div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink100">Buy!</q-btn>
      </q-card-actions>
    </q-card>
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h2">10000 Tokens</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h2"></div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink100">Buy!</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import BuyTokensContentSection from '@/components/BuyTokensContentSection.vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { computed } from 'vue';

const { user } = useAuth0()

const removeAuth0Prefix = (string?: string) => string?.replace(/^auth0\|/, '') || '';
const userId = computed(() => removeAuth0Prefix(user.value?.sub));
const paymentLink = computed(() => `https://buy.stripe.com/test_cN2cN7bWO6jc0EgfYZ?client_reference_id=${userId.value}`);
const paymentLink100 = computed(() => `https://buy.stripe.com/test_28o8wRd0S8rk4Uw9AC?client_reference_id=${userId.value}`)


const openPaymentLink = () => {
  console.log(userId.value)
  console.log(paymentLink.value)
  window.open(paymentLink.value, '_blank');
}

const openPaymentLink100 = () => {
  console.log(paymentLink100.value)
  window.open(paymentLink100.value, '_blank')
}

</script>
