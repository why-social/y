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
      posts: [],
      examplePost: {
        author: {
          name: 'Shawn Dawgson',
          username: 'colguylikesdawgs',
          profile_picture:
            'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'
        },
        timestamp: Date.now(),
        content: 'Can I pet that dawg',
        images: [
          'https://st3.depositphotos.com/29384342/34115/i/450/depositphotos_341157888-stock-photo-recommendation-sports-student.jpg',
          'https://randomwordgenerator.com/img/picture-generator/52e4d1424f5aa914f1dc8460962e33791c3ad6e04e5074417d2e72d2954ac5_640.jpg',
          'https://www.kdnuggets.com/wp-content/uploads/tree-todd-quackenbush-unsplash.jpg'
        ],
        likes: [],
        comments: []
      }
    }
  },
  mounted() {
    Api.get('/v1/feeds', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then((response) => {
        this.posts = response.data.posts
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
</script>

<style scoped>

</style>
