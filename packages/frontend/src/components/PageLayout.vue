<template>
  <div class="page-layout">
    <NavBar />
    <MobileNavBar />
    <div class="page-layout__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/navigation/desktop/nav-bar.vue";
import MobileNavBar from "@/components/navigation/mobile/mobile-nav-bar.vue";
</script>

<style lang="scss">
.page-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $primary-bg;
  height: 100%;
  width: 100%;
}

.page-layout__content {
  flex: 1;
  flex-basis: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  margin-top: 8rem;
  max-width: 1200px;
  width: 100%;
}

@media only screen and (max-width: 640px) {
  .page-layout__content {
    margin-top: 6.4rem;
  }
}


body {
  background-color: $light;
}
</style>
