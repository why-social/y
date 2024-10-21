<script setup>
import Follower from '@/components/Follower.vue'
import Spinner from '@/components/Spinner.vue'
</script>

<template>
  <div v-if="isLoaded && users.length != 0" class="userList-container">
    <Follower v-for="user in users" :username="user" :key="user._id" />
  </div>
  <div v-else-if="isLoaded" class="no-followings">
    <span>Not following anyone</span>
  </div>
  <div v-else>
    <Spinner />
  </div>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      isLoaded: false,
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

    const response = await Api.get('/v1/users/' + username + '/followings')
    for (const follows of response.data) {
      this.users.push(follows)
    }

    this.isLoaded = true
  }
}
</script>

<style scoped>
.list-container {
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
}

.no-followings {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: var(--color-on-background);
  text-align: center;
}
</style>
