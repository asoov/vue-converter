<template>
  <section class="buy-tokens-content-section">
    <div class="buy-tokens-content-section__slide">
      <h1 class="q-mb-md">
        Convert your legacy Vue code!
      </h1>
      <p>
        Convert your VueJS files from Vue 2 to Vue 3 composition syntax effortlessly. Purchase our token packages based on
        the
        size of your files and get started!
      </p>
    </div>
    <q-timeline>
      <q-timeline-entry title="1. Purchase Tokens">Choose a package that best suits your
        needs.</q-timeline-entry>
      <q-timeline-entry title="2. Upload your files">
        The number of tokens used will depend on the length of your file.
      </q-timeline-entry>
      <q-timeline-entry title="3. Get Converted Code">
        Once tokens are deducted, receive your files in Vue 3 composition syntax instantly.
        Packed in a ZIP-file they will be accesible for you to download for 2 weeks.
      </q-timeline-entry>
    </q-timeline>
  </section>
</template>

<style scoped lang="scss">
.buy-tokens-content-section {
  max-width: 640px;
  margin: auto;
  color: $dark;
  margin-bottom: 64px;

  &>h1 {
    color: $accent;
  }

  ol {
    padding-left: 16px;
  }

  &__slide {
    margin-bottom: 48px
  }
}
</style>