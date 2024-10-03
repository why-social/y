<template>
  <div id="content">
    <PostPrompt />
    <div
      style="padding-bottom: 1rem; border-bottom: 1px solid var(--color-border)"
    ></div>
    <Post />
    <Post v-for="post in posts" :post="post" :key="post._id" />
  </div>
</template>

<style scoped>
#content {
  overflow: hidden;
  display: block;
  padding-left: 20px;
  padding-right: 20px;
  height: 100%;
  width: 100%;
}

@media (max-width: 630px) {
  #content {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 20rem;
  }
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
