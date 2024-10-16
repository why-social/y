<template>
  <div class="follower-container">
    <img class="pfp" :src="pfp" @click="redirectToProfile" />
    <div class="follower-info">
      <span class="info-name" @click="redirectToProfile">{{ name }}</span>
      <span class="info-username">@{{ username }}</span>
    </div>
  </div>
</template>

<script>
import { Api } from '@/Api'

export default {
  name: 'Profile',
  props: ['userId'],
  data() {
    return {
      pfp: '',
      name: '',
      username: '',
      redirectToProfileId: ''
    }
  },
  async mounted() {
    await this.fetchUserData()
  },
  methods: {
    async fetchUserData() {
      const response = await Api.get('/v1/users/' + this.userId)
      this.pfp = response.data.profile_picture_url
      this.name = response.data.name
      this.username = response.data.username
    },
    redirectToProfile() {
      this.$router.push(`/profile/${this.username}/posts`)
    }
  },
  watch: {
    userId() {
      this.fetchUserData()
    }
  }
}
</script>

<style scoped>
.follower-container {
  user-select: none;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 1rem;
  padding: 0.8rem 0rem;
  gap: 1rem;
}
.pfp {
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
}
.pfp:hover{
  cursor: pointer;
}
.follower-info {
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  gap: 0.2rem;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
}
.info-name {
  font-size: 1rem;
  font-weight: 600;
}
.info-name:hover {
  text-decoration: underline;
  cursor: pointer;
}
.info-username {
  font-size: 1rem;
  color: #aaa;
}
</style>
