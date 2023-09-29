<template>
  <h1 id="page-title">Profile Page</h1>
  <div class="profile-page content__body">
    <div class="profile-grid">
      <q-spinner v-if="isLoading" />
      <div v-else-if="user" class="profile__header">
        <img :src="user.picture" alt="Profile" class="profile__avatar" />
        <div class="profile__headline">
          <h2>{{ user.name }}</h2>
          <span class="profile__description">{{ user.email }}</span>
        </div>
      </div>
      <div v-else>
        Something went wrong retrieving the user.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";

const { user, isLoading } = useAuth0()
</script>
<style lang="scss" scoped>
.profile-page {
  color: $dark
}
</style>
