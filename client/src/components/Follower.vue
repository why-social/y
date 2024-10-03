<template>
  <div class="follower-container">
    <img class="pfp" v-bind:src="pfp" @click="redirectToProfile" />
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
  props: {
    follower: {
      type: Object,
      required: true
    },
    followFlag: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      pfp: '',
      name: '',
      username: '',
      redirectToProfileId: ''
    }
  },
  async mounted() {
    let followerReq
    if (this.followFlag) {
      followerReq = await this.getFollowerInfo()
      this.redirectToProfileId = this.follower.follower
    } else {
      followerReq = await this.getFollowingInfo()
      this.redirectToProfileId = this.follower.follows
    }
    this.name = followerReq.data.name
    this.username = followerReq.data.username
    this.pfp = followerReq.data.profile_picture || 'https://via.placeholder.com/150'
  },
  methods: {
    redirectToProfile() {
      this.$router.push(`/profile/${this.redirectToProfileId}`)
      this.$emit('change-tab', 'posts')
    },
    getFollowerInfo() {
      return Api.get(`/v1/users/${this.follower.follower}`)
    },
    getFollowingInfo() {
      return Api.get(`/v1/users/${this.follower.follows}`)
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
  padding: 0.8rem 2rem;
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
