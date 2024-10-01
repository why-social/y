<template>
  <div id="content">
    <PostPrompt />
    <Post />
    <Post v-for="post in posts" :post="post" :key="post._id" />
  </div>
</template>

<style scoped>
#content {
  overflow: hidden;
  display: block;
  height: 100%;
  width: 100%;
}
</style>

<script>
import { Api } from '@/Api'

export default {
  name: 'home',
  data() {
    return {
      message: 'none',
      posts: []
    }
  },
  methods: {
    getFeed() {
      Api.get('/v1/feeds', {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      })
        .then((response) => {
          this.posts = response.data.posts
          console.log(response.data.posts)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  mounted() {
    this.getFeed()
  }
}
</script>
