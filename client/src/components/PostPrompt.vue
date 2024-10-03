<template>
  <form ref="postForm" @submit.prevent="createPost">
    <div class="form-container">
      <div class="form-row">
        <img class="avatar" :src="pfp" />
        <contenteditable
          ref="textInput"
          id="content"
          v-model="content"
          ondrop="return false"
          contenteditable="true"
          placeholder="What are you thinking about?"
          @keyup="keyUp"
        ></contenteditable>
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
          @change="handleFileChange"
        />
        <Button :disabled="isSubmitDisabled"> Post </Button>
      </div>
    </div>
  </form>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      content: '',
      images: [],
      pfp: 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'
    }
  },
  computed: {
    isSubmitDisabled() {
      return this.content.trim().length === 0 && this.images.length === 0
    }
  },
  methods: {
    async createPost() {
      const formData = new FormData()
      formData.append('content', this.content)
      for (const image of this.images) {
        formData.append('images', image)
      }
      try {
        const response = Api.post('v1/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
        console.log('Post created successfully:', response.data)

        this.$refs.postForm.reset()
        this.$refs.textInput.innerText = ''
        this.content = ''
        this.images = []
      } catch (error) {
        console.error('Error creating post:', error)
      }
    },
    handleFileChange() {
      this.images = event.target.files
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
        this.pfp = response.data
      }
    })
  }
}
</script>

<style scoped>
form {
  padding-top: 1rem;
  padding-bottom: 1rem;
  overflow: hidden;
  width: 100%;
}

.form-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
}

contenteditable {
  flex-grow: 1;
  resize: none;
  padding: 1rem;
  overflow: hidden;
  font-size: 1.4rem;
  background: var(--color-background);
  color: var(--color-on-background);
  border: none;
}

contenteditable:focus {
  outline: none;
  border: none;
}

[contenteditable='true']:empty:before {
  content: attr(placeholder);
  cursor: text;
  opacity: 0.7;
  color: var(--color-on-background);
}

input[type='file'] {
  display: none;
}

button {
  margin-left: auto;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.file-counter {
  padding: 0.5rem;
  opacity: 0.7;
}

.attach-label {
  display: flex;
  user-select: none;
  font-size: 1.3rem;
  align-items: center;
  cursor: pointer;
}

.attach-icon {
  user-select: none;
  color: var(--color-accent);
  vertical-align: center;
  font-size: 2rem;
}

@media (max-width: 630px) {
  .avatar {
    width: 3.5rem;
    height: 3.5rem;
  }
}
</style>
