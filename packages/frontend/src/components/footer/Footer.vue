<template>
  <footer class="footer">
    <router-link active-class="footer__link--active" class="text-white text-bold" to="/imprint">Imprint</router-link>
  </footer>
</template>
<script setup lang="ts">
</script>

<style scoped lang="scss">
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: $primary;

  display: flex;
  align-items: center;

  padding: 0 32px;
}

.footer__link--active {
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-color: $accent;

  /* responsive */

  text-decoration-thickness: 4px;
  text-underline-offset: 8px;
}
</style>