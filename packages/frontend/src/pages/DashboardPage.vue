<template>
  <h1>Hallo</h1>
  <div class="row q-gutter-md">
    <q-card class="col my-card bg-primary text-white">
      <q-card-section>
        <div class="text-h4">Token Balance</div>
      </q-card-section>

      <q-card-section>
        <div v-if="customerData.aiCredits !== (null || undefined)" class="text-h2">{{ customerData.aiCredits }}</div>
        <q-spinner v-else color="white" size="3em" />
      </q-card-section>

      <q-card-actions>
        <q-btn flat>Get More</q-btn>
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
        <q-btn flat>Get More</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>


<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import axios from 'axios'
import { onMounted, ref } from 'vue';

const customerData: any = ref({})
const loading = ref(true)
const { getAccessTokenSilently, user } = useAuth0()

const getCustomerData = async (): Promise<any> => {
  try {
    loading.value = true;
    const accessToken = await getAccessTokenSilently()
    const response = await axios.post('http://localhost:9000/customer/get-customer', {
      id: user.value?.sub
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    customerData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch customer data', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => getCustomerData())
</script>