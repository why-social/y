<script setup>
import { Api } from '@/Api'
</script>

<template>
  <div>
    <Post
      v-for="post in posts"
      :item="post"
      :dateFormat="'now'"
      :key="post._id"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: []
    }
  },
  mounted() {
    Api.get('/v1/posts', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then((response) => {
        this.posts = response.data
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
</script>
