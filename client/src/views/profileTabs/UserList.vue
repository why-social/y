<template>
  <div class="userList-container">
    <Follower v-for="user in users" :userId="user" :key="user._id"/>
  </div>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      users: []
    }
  },
  async mounted() {
    let userId
    if (this.$route.params.username === 'me') {
      userId = VueJwtDecode.decode(localStorage.getItem('token')).userId
    } else {
      const username = this.$route.params.username
      const res = await Api.get('/v1/users/search?username=' + username)
      userId = res.data._id
    }

    let response
    if (this.$route.name === 'followers') {
      response = await Api.get('/v1/users/' + userId + '/followers')
      for (const relation of response.data) {
        this.users.push(relation.follower)
      }
    } else if (this.$route.name === 'followings') {
      response = await Api.get('/v1/users/' + userId + '/followings')
      for (const relation of response.data) {
        this.users.push(relation.follows)
      }
    }
  }
}
</script>

<style scoped>
.userList-container{
  padding: 0 2rem;
}
</style>
