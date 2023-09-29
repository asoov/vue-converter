<template>
  <q-btn rounded color="secondary" class="button__sign-up" @click="handleSignUp">Sign Up</q-btn>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";

const { loginWithRedirect } = useAuth0();

const handleSignUp = () => {
  loginWithRedirect({
    appState: {
      target: "/profile",
    },
    authorizationParams: {
      screen_hint: "signup",
    }
  });
};
</script>