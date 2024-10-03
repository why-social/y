<template>
  <div class="follower-container">
    <img class="pfp" v-bind:src="pfp" />
    <div class="follower-info">
      <span class="info-name">{{ name }}</span>
      <span class="info-username">@{{ username }}</span>
    </div>
  </div>
</template>

<script>
import { Api } from '@/Api'

export default {
  name: 'Profile',
  props: {
    follower: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pfp: 'https://via.placeholder.com/150',
      name: '',
      username: ''
    }
  },
  async mounted() {
    const followerReq = await Api.get(`/v1/users/${this.follower.follower}`)
    this.name = followerReq.data.name
    this.username = followerReq.data.username
    // TODO add profile picture support
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
  padding: 0.8rem 2rem;
  gap: 1rem;
}
.pfp {
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
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
.info-username {
  font-size: 1rem;
  color: #aaa;
}
</style>
