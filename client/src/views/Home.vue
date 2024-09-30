<template>
  <b-container id="container">
    <NavBar />
    <div id="content">
      <PostPrompt />
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
    getMessage() {
      Api.get('/')
        .then((response) => {
          this.message = response.data.message
        })
        .catch((error) => {
          this.message = error
        })
    },
    getFeed() {
      Api.get('/v1/feeds', {
        headers: {
          //  PLACEHOLDER TOKEN!!!
          Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmZhODk4N2RhMWU0ZDVmNDc2MTQwNmYiLCJpYXQiOjE3Mjc3MTI1NTYsImV4cCI6MTcyNzcxNjE1Nn0.drn5qSl3lTCkhqeSg1_g6SNbXiDL0y5iYdqfrcwZSYg'
        }
      }).then((response) => {
        this.posts = response.data.posts
      }).catch((error) => {
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
}
</style>
