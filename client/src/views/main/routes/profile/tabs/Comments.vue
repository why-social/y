<script setup>
import Comment from '@/components/items/Comment.vue'
import Spinner from '@/components/Spinner.vue'
</script>

<template>
  <div v-if="isLoaded && comments.length != 0">
    <Comment
      v-for="comment in comments"
      :item="comment"
      :dateFormat="'now'"
      :key="comment._id"
    />
  </div>
  <div v-else-if="isLoaded" class="no-comments">
    <span>No comments yet</span>
  </div>
  <div v-else>
    <Spinner />
  </div>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      isLoaded: false,
      comments: []
    }
  },
  async mounted() {
    try {
      let username
      if (this.$route.params.username === 'me') {
        username = VueJwtDecode.decode(localStorage.getItem('token')).username
      } else {
        username = this.$route.params.username
      }
      const response = await Api.get('/v1/users/' + username + '/comments')
      this.comments = response.data
    } catch (error) {
      console.error(error)
      if (error.response?.status === 404) {
        this.comments = []
      }
    }

    this.isLoaded = true
  }
}
</script>

<style scoped>
.no-comments {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: var(--color-on-background);
  text-align: center;
}
</style>
