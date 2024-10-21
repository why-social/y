<script setup>
import { Api } from '@/Api'
import ThreadPrompt from '@/components/prompts/ThreadPrompt.vue'
</script>

<template>
  <ThreadPrompt
    :submitMessage="'Post'"
    :placeholder="'What are you thinking about?'"
    @post="post"
  />
</template>

<script>
export default {
  methods: {
    post(formData) {
      Api.post('v1/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then((response) => {
          this.$router.push('/thread/' + response.data._id)
        })
        .catch((error) => {
          console.error('Error creating post:', error)
        })
    }
  }
}
</script>
