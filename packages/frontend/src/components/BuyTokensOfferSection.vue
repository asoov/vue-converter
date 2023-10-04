<template>
  <div class="row q-gutter-md q-mb-xl">
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h2">10000 Tokens</div>
      </q-card-section>

      <q-card-section>
        Typically good for about 1.000 lines of Vue code.
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink10000">Buy!</q-btn>
      </q-card-actions>
    </q-card>
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h2">100.000 Tokens</div>
      </q-card-section>

      <q-card-section>
        Typically enough for about 10.000 lines of Vue code.
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink100000">Buy!</q-btn>
      </q-card-actions>
    </q-card>
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h2">500.000 Tokens</div>
      </q-card-section>

      <q-card-section>
        Typically good for about 50.000 lines of Vue code.
      </q-card-section>

      <q-card-actions>
        <q-btn flat @click="openPaymentLink500000">Buy!</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { computed } from 'vue';

const { user } = useAuth0()

const removeAuth0Prefix = (string?: string) => string?.replace(/^auth0\|/, '') || '';
const userId = computed(() => removeAuth0Prefix(user.value?.sub));
const paymentLink10000 = computed(() => `https://buy.stripe.com/test_4gw7sN0e69vogDedQV?client_reference_id=${userId.value}`);
const paymentLink100000 = computed(() => `https://buy.stripe.com/test_28o00l8KC22W1Ik3cg?client_reference_id=${userId.value}`)
const paymentLink500000 = computed(() => `https://buy.stripe.com/test_9AQfZj6CugXQfza5kn?client_reference_id=${userId.value}`)


const openPaymentLink10000 = () => {
  window.open(paymentLink10000.value, '_blank');
}

const openPaymentLink100000 = () => {
  window.open(paymentLink100000.value, '_blank')
}

const openPaymentLink500000 = () => {
  window.open(paymentLink500000.value, '_blank')
}

</script>