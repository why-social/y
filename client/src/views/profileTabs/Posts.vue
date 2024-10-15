<script setup>
import Post from '../../components/items/Post.vue'
</script>

<template>
  <div v-if="posts.length != 0">
    <Post
      v-for="post in posts"
      :item="post"
      :dateFormat="'now'"
      :key="post._id"
    />
  </div>
  <div v-else class="posts-no-posts">
    <span>No posts yet</span>
  </div>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      posts: []
    }
  },
  async mounted() {
    try {
      const userId =
        this.$route.params.userId === 'me'
          ? VueJwtDecode.decode(localStorage.getItem('token')).userId
          : this.$route.params.userId
      const response = await Api.get('/v1/users/' + userId + '/posts')
      this.posts = response.data
    } catch (error) {
      console.error(error)
      if (error.response?.status === 404) {
        this.posts = []
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
