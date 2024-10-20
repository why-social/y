<template>
  <form thread-prompt ref="threadForm" @submit.prevent="submit()">
    <div class="form-container">
      <div class="form-row">
        <img class="avatar" :src="avatar" />

        <contenteditable
          ref="textInput"
          id="thread-prompt-input"
          v-model="content"
          ondrop="return false"
          contenteditable="true"
          :placeholder="placeholder"
          @keyup="keyUp"
        />
      </div>

      <div class="form-row">
        <label class="attach-label" for="images">
          <span class="material-symbols-outlined attach-icon">attach_file</span>
          <span class="file-counter">{{ images.length }}/4</span>
        </label>

        <input
          class="file-input"
          id="images"
          type="file"
          accept="image/*"
          multiple
          @change="uploadImage"
        />

        <Button :disabled="isSubmitDisabled"> {{ buttonMesage }} </Button>
      </div>
    </div>

    <div class="overlay" ref="overlay" @click.stop="resetQuery"></div>
  </form>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      buttonMesage: this.getSubmitMessage(),
      placeholder: this.getPlaceholder(),
      content: '',
      avatar: '',
      images: []
    }
  },

  computed: {
    isSubmitDisabled() {
      return this.content.trim().length === 0 && this.images.length === 0
    }
  },

  methods: {
    post() {
      throw new Error('Not implemented!')
    },
    getPlaceholder() {
      throw new Error('Not implemented!')
    },
    getSubmitMessage() {
      throw new Error('Not implemented!')
    },
    submit() {
      const formData = new FormData()
      formData.append('content', this.content)

      for (const image of this.images) {
        formData.append('images', image)
      }

      this.post(formData)

      this.$refs.threadForm.reset()
      this.$refs.textInput.innerText = ''
      this.content = ''
      this.images = []
    },
    uploadImage() {
      this.images = event.target.files
    },
    resetQuery() {
      this.$refs.threadForm.removeAttribute('focused')

      if (this.$route.query?.focus) {
        this.$router.replace({
          path: this.$route.path,
          query: undefined
        })
      }
    },
    keyUp(event) {
      this.content = event?.srcElement?.innerText
    }
  },

  mounted() {
    Api.get(
      `v1/users/${
        VueJwtDecode.decode(localStorage.getItem('token')).userId
      }/profile_picture`
    ).then((response) => {
      if (response.data) {
        this.avatar = response.data
      }
    })
  }
}
</script>

<style>
form[thread-prompt] {
  pointer-events: all;
  padding: 1rem;
  overflow: hidden;
  width: 100%;
}

form[thread-prompt] .form-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
}

form[thread-prompt] .form-row {
  display: flex;
  gap: 0.5rem;
}

form[thread-prompt] .avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 100%;
}

form[thread-prompt] contenteditable {
  flex-grow: 1;
  resize: none;
  padding: 0.5rem;
  height: fit-content;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  margin-top: 0.3rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  font-size: 1.3rem;
  color: var(--color-on-background);
  border: none;
}

form[thread-prompt] contenteditable:focus {
  outline: none;
  z-index: 1000;
  border: none;
}

form[thread-prompt] [contenteditable='true']:empty:before {
  position: absolute;
  content: attr(placeholder);
  cursor: text;
  opacity: 0.7;
  background: transparent;
  color: var(--color-on-background);
}

form[thread-prompt] input[type='file'] {
  display: none;
}

form[thread-prompt] button {
  margin-left: auto;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

form[thread-prompt] .file-counter {
  padding: 0.5rem;
  opacity: 0.7;
}

form[thread-prompt] .attach-label {
  display: flex;
  user-select: none;
  margin-left: 4rem;
  font-size: 1.3rem;
  align-items: center;
  cursor: pointer;
}

form[thread-prompt] .attach-icon {
  user-select: none;
  color: var(--color-accent);
  vertical-align: center;
  font-size: 2rem;
}

form[thread-prompt] .overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 1;
  display: none;
}

form[thread-prompt][focused] .overlay {
  z-index: 999;
  display: unset;
}

form[thread-prompt][focused] .form-container {
  position: relative;
  z-index: 1000;
}
</style>
