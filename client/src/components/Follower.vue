<script setup>
import { Api } from '@/Api'
</script>

<template>
  <div v-if="isLoaded" class="follower-container">
    <img class="pfp" :src="pfp" @click="redirectToProfile" />
    <div class="follower-info">
      <span class="info-name" @click="redirectToProfile">{{ name }}</span>
      <span class="info-username">@{{ username }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  props: ['username'],
  data() {
    return {
      isLoaded: false,
      pfp: '',
      name: '',
      redirectToProfileId: ''
    }
  },
  async mounted() {
    await this.fetchUserData()
  },
  methods: {
    async fetchUserData() {
      const response = await Api.get('/v1/users/' + this.username)

      this.pfp = response.data.profile_picture_url
      this.name = response.data.name

      this.isLoaded = true
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
  font-size: 1rem;
  padding: 0.8rem 0rem;
  gap: 0.25rem;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
}
.pfp {
  width: 3rem;
  height: 3rem;
  border-radius: 100%;
}
.pfp:hover {
  cursor: pointer;
}
.follower-info {
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  text-overflow: ellipsis;
}
.info-name {
  overflow: hidden;
  font-size: 1rem;
  font-weight: 600;
}
.info-name:hover {
  text-decoration: underline;
  cursor: pointer;
}
.info-username {
  overflow: hidden;
  font-size: 1rem;
  color: #aaa;
}
</style>
