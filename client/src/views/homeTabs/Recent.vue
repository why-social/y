<template>
  <div>
    <Post v-for="post in posts" :post="post" :key="post._id" />
  </div>
</template>

<script>
import { Api } from '@/Api'
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

<style scoped>

</style>
