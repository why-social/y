<script setup>
import Post from '../../components/items/Post.vue'
</script>

<template>
  <div v-if="comments.length != 0">
    <!-- TEMPORARILY REUSING POST COMPONENT -->
    <Post v-for="comment in comments" :post="comment" :key="comment._id" />
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
      const userId =
        this.$route.params.userId === 'me'
          ? VueJwtDecode.decode(localStorage.getItem('token')).userId
          : this.$route.params.userId
      const response = await Api.get('/v1/users/' + userId + '/comments')
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
