<template>
  <section class="column q-gutter-md">
    <div class="row dashboard-page__card-container">
      <TokenBalanceCard :customer-data="customerData" />
      <UsageCard />
    </div>
    <div class="row">
      <RecentTransformationSection :customer-data="customerData" :loading="loading" />
    </div>

  </section>
</template>


<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { AxiosResponse } from 'axios'
import { computed, onMounted, ref } from 'vue';
import { Customer, Process } from 'utils'
import { CustomerService } from '@/services/CustomerService';
import RecentTransformationSection from '@/components/RecentTransformationSection.vue';
import TokenBalanceCard from '@/components/TokenBalanceCard.vue';
import UsageCard from '@/components/UsageCard.vue';


const customerData = ref<Customer>()
const loading = ref(true)
const { getAccessTokenSilently, user } = useAuth0()

const filterProcessesFromLastTwoWeeks = (processes: Process[] = []) => {
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days in milliseconds

  return processes.filter(process => new Date(process.timestamp) > twoWeeksAgo);
}

const processesFromLastTwoWeeks = computed(() => filterProcessesFromLastTwoWeeks(customerData.value?.finishedProcesses))

const getCustomerData = async (): Promise<void> => {
  try {
    loading.value = true;
    const accessToken = await getAccessTokenSilently()
    const customerService = new CustomerService(accessToken)
    const response = await customerService.getCustomer<Customer, AxiosResponse<Customer>>(user.value?.sub)

    customerData.value = response.data;
    console.log(customerData.value)
  } catch (error) {
    console.error('Failed to fetch customer data', error);
  } finally {
    loading.value = false;
  }
}

const downloadFile = (url: string): void => {
  window.open(url, '_blank')
}

onMounted(() => getCustomerData())
</script>

<style lang="scss" scoped>
.dashboard-page {
  &__card-container {
    gap: 16px
  }
}
</style>