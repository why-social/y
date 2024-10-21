<script setup>
import Post from '@/components/items/Post.vue'
import Spinner from '@/components/Spinner.vue'
</script>

<template>
  <div v-if="isLoaded && posts.length != 0">
    <Post
      v-for="post in posts"
      :item="post"
      :dateFormat="'now'"
      :key="post._id"
    />
  </div>
  <div v-else-if="isLoaded" class="no-posts">
    <span>No posts yet</span>
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
      posts: []
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
      const response = await Api.get('/v1/users/' + username + '/posts')
      this.posts = response.data
    } catch (error) {
      console.error(error)
      if (error.response?.status === 404) {
        this.posts = []
      }
    }

    this.isLoaded = true
  }
}
</script>

<style scoped>
.no-posts {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: var(--color-on-background);
  text-align: center;
}
</style>
