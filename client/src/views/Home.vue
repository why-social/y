<template>
  <b-container>
    <b-row>
      <b-col style="position: sticky; top: 0; height: 100vh">
        <NavBar />
      </b-col>
      <b-col cols="7" class="center">
        <PostPrompt />
        <Post v-for="post in posts" :post="post" :key="post._id" />
      </b-col>
      <b-col> test </b-col>
    </b-row>
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
          Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmZhODk4N2RhMWU0ZDVmNDc2MTQwNmYiLCJpYXQiOjE3Mjc3MDg4NTgsImV4cCI6MTcyNzcxMjQ1OH0.thydxHpWETktvO896sJ8FwIrJeDUUkqRY9yVsYgxwko'
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

<style>
b-container,
b-col {
  height: 100%;
}
.center {
  margin: 2.5rem;
  padding: 2rem 3rem 0 3rem;
  box-sizing: border-box;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
}
.btn_message {
  margin-bottom: 1em;
}
</style>
