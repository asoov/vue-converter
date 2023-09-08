<template>
  <PageLayout>
    <div>
      <h1>Hallo</h1>
      <div class="row q-gutter-md">
        <q-card class="col my-card bg-primary text-white">
          <q-card-section>
            <div class="text-h4">Token Balance</div>
          </q-card-section>

          <q-card-section>
            <div class="text-h2">1000</div>
          </q-card-section>

          <q-card-actions>
            <q-btn flat>Get More</q-btn>
          </q-card-actions>
        </q-card>
        <q-card class="col my-card bg-primary text-white">
          <q-card-section>
            <div class="text-h4">Token Balance</div>
          </q-card-section>

          <q-card-section>
            <div class="text-h2">1000</div>
          </q-card-section>

          <q-card-actions>
            <q-btn flat>Get More</q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </PageLayout>
</template>


<script setup lang="ts">
import PageLayout from '@/components/PageLayout.vue'
import { useAuth0 } from '@auth0/auth0-vue';
import axios from 'axios'
import { ref } from 'vue';

const loading = ref(true)
const auth0 = useAuth0()
const getCustomerData = async () => {
  const accessToken = await auth0.getAccessTokenSilently()
  const data = await axios.post('http://localhost:9000/customer/get-customer', {

  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  })
  console.log(data)
}
try {
  getCustomerData()
} catch (error) {

} finally {
  loading.value = false
}
</script>