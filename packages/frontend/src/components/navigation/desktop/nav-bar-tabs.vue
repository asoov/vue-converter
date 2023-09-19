<template>
  <div class="nav-bar__tabs">
    <NavBarTab path="/dashboard" label="Dashboard" />
    <NavBarTab path="/profile" label="Profile" />
    <NavBarTab path="/buytokens" label="Buy Tokens" />
  </div>
</template>

<script setup>
import NavBarTab from "@/components/navigation/desktop/nav-bar-tab.vue";
</script>
