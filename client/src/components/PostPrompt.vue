<template>
  <form ref="postForm" @submit.prevent="createPost">
    <div class="form-container">
      <div class="form-row">
        <img class="avatar" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"/>
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

export default {
  data() {
    return {
      content: '',
      images: []
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
            // PLACEHOLDER AUTH!!!
            Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmY2YzJlZmVlMTUzMTU2ZDRiMGIwZjIiLCJpYXQiOjE3Mjc0NDc3OTEsImV4cCI6MTcyNzQ1MTM5MX0.VgqM47aOW7Mpx92c8Fk9p5ZYgXAVcgiCC5MuTqDyyzQ'
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
