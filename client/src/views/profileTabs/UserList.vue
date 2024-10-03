<template>
  <div>
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
    const userId = this.$route.params.userId === 'me' ? VueJwtDecode.decode(localStorage.getItem('token')).userId : this.$route.params.userId

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

</style>
