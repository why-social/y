<script setup>
import { Api } from '@/Api'
import ThreadPrompt from '@/components/prompts/ThreadPrompt.vue'
</script>

<template>
  <ThreadPrompt
    :submitMessage="'Comment'"
    :placeholder="'Your reply'"
    @post="post"
  />
</template>

<script>
export default {
  props: ['parent', 'parentIsPost'],

  methods: {
    post(formData) {
      formData.append('parent_id', this.parent)
      formData.append('parent_is_post', this.parentIsPost)

      Api.post('v1/comments', formData, {
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
