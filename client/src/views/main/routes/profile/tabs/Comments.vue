<script setup>
import Comment from '@/components/items/Comment.vue'
</script>

<template>
  <div v-if="comments.length != 0">
    <Comment
      v-for="comment in comments"
      :item="comment"
      :dateFormat="'now'"
      :key="comment._id"
    />
  </div>
  <div v-else class="posts-no-posts">
    <span>No comments yet</span>
  </div>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
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
  }
}
</script>

<style scoped>
.posts-no-posts {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: var(--color-on-background);
  text-align: center;
}
</style>
