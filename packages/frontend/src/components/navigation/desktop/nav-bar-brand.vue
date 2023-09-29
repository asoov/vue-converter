<template>
  <div class="nav-bar__brand">
    <router-link to="/">
      <img class="nav-bar__logo" :src="logo" alt="Vue Converter Logo" width="122" height="36" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const logo = ref()
onMounted(async () => {
  logo.value = (await import('@/assets/logo/logo1.svg')).default
})
</script>
