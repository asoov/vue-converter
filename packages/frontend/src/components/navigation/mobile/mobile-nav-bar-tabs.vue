<template>
  <div class="mobile-nav-bar__tabs">
    <MobileNavBarTab path="/profile" label="Profile" />
    <MobileNavBarTab path="/dashboard" label="Dashboard" />
    <MobileNavBarTab path="/buytokens" label="Buy Tokens" />
  </div>
</template>

<script setup>
import MobileNavBarTab from "@/components/navigation/mobile/mobile-nav-bar-tab.vue";
</script>

<style scoped></style>
