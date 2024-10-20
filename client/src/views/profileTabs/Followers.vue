<template>
  <div class="userList-container">
    <Follower v-for="user in users" :username="user" :key="user._id" />
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
    let username

    if (this.$route.params.username === 'me') {
      username = VueJwtDecode.decode(localStorage.getItem('token')).username
    } else {
      username = this.$route.params.username
    }

    const response = await Api.get('/v1/users/' + username + '/followers')
    for (const follower of response.data) {
      this.users.push(follower)
    }
  }
}
</script>

<style scoped>
.userList-container {
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
}
</style>
