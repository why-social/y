<template>
  <form ref="postForm" @submit.prevent="createPost">
    <div class="form-container">
      <div class="form-row">
        <img class="avatar" :src="pfp"/>
        <input class="text-input" id="content" type="text" v-model="content" placeholder="What are you thinking about?">
      </div>
      <div class="form-row bottom-row">
        <label class="attach-label" for="images">
          <span class="file-counter">{{ images.length }}/4</span>
          <span class="material-symbols-outlined attach-icon">attach_file</span>
        </label>
        <input class="file-input" id="images" type="file" accept="image/*" multiple @change="handleFileChange">
        <input :disabled="isSubmitDisabled" id="submit-button" class="button" type="submit" value="Post">
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
        this.content = ''
        this.images = []
      } catch (error) {
        console.error('Error creating post:', error)
      }
    },
    handleFileChange() {
      this.images = event.target.files
    }
  },
  mounted() {
    Api.get(`v1/users/${VueJwtDecode.decode(localStorage.getItem('token')).userId}/profile_picture`)
      .then(response => {
        console.log('PFP: \n' + response)
        this.pfp = response.data
      })
  }
}
</script>

<style scoped>
form {
  padding: 2rem 2.5rem 1rem;
  overflow: hidden;
  width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bottom-row {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.avatar {
  width: 5rem;
  align-self: center;
  border-radius: 100%;
}

input[type=text] {
  flex-grow: 1;
  height: 5rem;
  padding: 1rem 1rem 1rem 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  background: var(--color-background);
  color: var(--color-on-background);
  resize: vertical;
  border: none;
  border-bottom: 1px solid var(--color-border);
}

.button {
  color: var(--color-on-accent);
  background: var(--color-accent);
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid transparent;
  transition: 0.5s;
}

.button:enabled:hover {
  border: 1px solid var(--color-accent);
  background: var(--color-on-background);
}

.button:disabled {
  opacity: 40%;
}

input[type=file] {
  display: none;
}

.file-counter {
  padding: 0.5rem;
  opacity: 0.7;
}

.attach-label {
  margin-left: auto;
  align-items: center;
  cursor: pointer;
}

.attach-icon {
  color: var(--color-accent);
  vertical-align: center;
  width: 2rem;
}

</style>
