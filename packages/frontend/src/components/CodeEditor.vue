<template>
  <div class="editor-wrapper">
    <q-btn v-if="showCopyButton" @click="$emit('copy')" round class="editor-copy-button" icon="content_copy" />
    <prism-editor class="my-editor" v-model="code" :highlight="highlighter" line-numbers></prism-editor>
  </div>
</template>

<script lang="ts">
import { ref, watch, defineComponent } from 'vue';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

export default defineComponent({
  components: {
    PrismEditor,
  },
  props: {
    input: {
      type: String,
      required: true,
    },
    showCopyButton: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const code = ref(props.input);

    watch(() => props.input, (value) => {
      code.value = value;
    });

    watch(code, (value) => {
      emit('update:input', value);
    });

    const highlighter = (code) => {
      return highlight(code, languages.js);
    };

    return {
      code,
      highlighter
    };
  }
});
</script>

<style>
.editor-wrapper {
  position: relative;
  height: 100%;
  overflow: auto;
}

.editor-copy-button {
  /* font-size: 24px; */
  position: absolute;
  top: 16px;
  right: 16px;
}

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>