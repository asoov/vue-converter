<template>
  <div class="nav-bar-buttons">
    <template v-if="!isAuthenticated">
      <SignupButton />
      <LoginButton />
    </template>
    <template v-if="isAuthenticated">
      <LogoutButton />
    </template>
  </div>
</template>

<script setup lang="ts">
import LoginButton from "@/components/buttons/login-button.vue";
import LogoutButton from "@/components/buttons/logout-button.vue";
import SignupButton from "@/components/buttons/signup-button.vue";
import { useAuth0 } from "@auth0/auth0-vue";

const { isAuthenticated } = useAuth0();
</script>

<style lang="scss" scoped>
.nav-bar-buttons {
  display: flex;
  margin-left: 24px;
  gap: 8px;
}
</style>