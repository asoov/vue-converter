<template>
  <div class="main">
    <div :style="isDragging && 'border-color: green;'" class="dropzone-container" @dragover="dragover"
      @dragleave="dragleave" @drop="drop">
      <input type="file" multiple name="file" id="fileInput" class="hidden-input" @change="onChange" ref="file"
        accept=".vue" />

      <label for="fileInput" class="file-label">
        <div v-if="isDragging">Release to drop files here.</div>
        <div v-else>Drop files here or <u>click here</u> to upload.</div>
      </label>
      <!-- Note: Only add the code block below -->
      <div class="preview-container mt-4" v-if="files.length">
        <div v-for="file in files" :key="file.name" class="preview-card">
          <div>
            <p>
              {{ file.name }}
            </p>
          </div>
          <div>
            <button class="ml-2" type="button" @click="remove(files.indexOf(file))" title="Remove file">
              <b>×</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDragging: false,
      files: [],
    };
  },
  watch: {
    files: {
      deep: true,
      handler(newVal) {
        console.log('changedrop')
        this.$emit('files-changed', newVal)
      }
    }
  },
  methods: {
    onChange() {
      console.log('change')
      this.files.push(...this.$refs.file.files);
    },
    dragover(e) {
      e.preventDefault();
      this.isDragging = true;
    },
    dragleave() {
      this.isDragging = false;
    },
    drop(e) {
      e.preventDefault();
      this.$refs.file.files = e.dataTransfer.files;
      this.onChange();
      this.isDragging = false;
    },
    remove(i) {
      this.files.splice(i, 1);
    },
  },
};
</script>
<style scoped>
.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: black
}

.dropzone-container {
  width: 100%;
  padding: 4rem;
  border: 2px dashed;
  border-color: #9e9e9e;
}

.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 1px;
  height: 1px;
}

.file-label {
  font-size: 20px;
  display: block;
  cursor: pointer;
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
  max-height: 400px;
  overflow: auto;
}

.preview-card {
  display: flex;
  border: 1px solid #a2a2a2;
  padding: 5px;
  margin-left: 5px;
}

.preview-img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #a2a2a2;
  background-color: #a2a2a2;
}
</style>