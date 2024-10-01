<template>
  <b-container id="container">
    <NavBar />
    <div id="content">
      <PostPrompt />
      <Post />
      <Post v-for="post in posts" :post="post" :key="post._id" />
    </div>
  </b-container>
</template>

<script>
// @ is an alias to /src
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

<style scoped>
#container {
  width: 100%;
  display: flex;
  flex-direction: row;
  margin: 0;
  padding: 0;
}

#content {
  display: block;
  height: 100%;
  width: 100%;
}
</style>
