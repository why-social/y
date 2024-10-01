<template>
  <div class="profile-header">
    <div class="profile-avatar-container">
      <div class="profile-avatar">
        <img :src="avatarUrl" alt="avatar" />
      </div>
      <div class="profile-name-container">
        <div class="profile-name">{{ name }}</div>
        <div class="profile-username"><span class="at-symbol">@</span> {{ username }}</div>
        <div v-if="email" class="profile-email">
          <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="512px" height="512px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" class="email-icon">
            <path d="M448,64H64C28.656,64,0,92.656,0,128v256c0,35.344,28.656,64,64,64h384c35.344,0,64-28.656,64-64V128
              C512,92.656,483.344,64,448,64z M342.656,234.781l135.469-116.094c0.938,3,1.875,6,1.875,9.313v256
              c0,2.219-0.844,4.188-1.281,6.281L342.656,234.781z M448,96c2.125,0,4,0.813,6,1.219L256,266.938L58,97.219
              C60,96.813,61.875,96,64,96H448z M33.266,390.25C32.828,388.156,32,386.219,32,384V128c0-3.313,0.953-6.313,1.891-9.313
              L169.313,234.75L33.266,390.25z M64,416c-3.234,0-6.172-0.938-9.125-1.844l138.75-158.563l51.969,44.531
              C248.578,302.719,252.297,304,256,304s7.422-1.281,10.406-3.875l51.969-44.531l138.75,158.563C454.188,415.062,451.25,416,448,416
              H64z"/>
          </svg>
          {{ email }}
        </div>
      </div>
      <div class="profile-editButton">
        <Button secondary>Edit profile</Button>
      </div>
    </div>
    <div class="profile-joinDate">Joined {{ joinDate }}</div>
    <div class="profile-follow-container">
      <a class="profile-following">
        <span class="profile-follow-number">{{ followers }}</span> Followers
      </a>
      <a class="profile-followers">
        <span class="profile-follow-number">{{ following }}</span> Following
      </a>
    </div>
  </div>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'
import moment from 'moment'

export default {
  name: 'Profile',
  data() {
    return {
      name: '',
      username: '',
      joinDate: '',
      followers: 0,
      following: 0,
      avatarUrl: 'https://via.placeholder.com/150',
      email: ''
    }
  },
  async created() {
    const userId = this.$route.params.userId
    if (userId === 'me') {
      // Check if token has expired
      const decoded = VueJwtDecode.decode(localStorage.getItem('token'))
      const expired = decoded.exp - (Date.now() / 1000) < 0
      if (expired) return this.$router.push('/auth/login')

      const userId = decoded.userId
      const userReq = await Api.get('/v1/users/' + userId, { headers: { Authorization: localStorage.getItem('token') } })

      this.fetchUserData(userId, userReq)
    } else {
      const userReq = await Api.get('/v1/users/' + userId)

      this.fetchUserData(userId, userReq)
    }
  },
  methods: {
    async fetchUserData(userId, userReq) {
      const userData = userReq.data

      // TODO Add profile picture support

      let followersReq = await Api.get('/v1/users/' + userId + '/followers')
      let followingsReq = await Api.get('/v1/users/' + userId + '/followings')
      followersReq = followersReq.data.length
      followingsReq = followingsReq.data.length

      this.name = userData.name
      this.username = userData.username
      this.joinDate = moment(userData.joinDate).format('DD MMMM YYYY')
      this.followers = followersReq
      this.following = followingsReq
      this.avatarUrl = userData.profile_picture || this.avatarUrl
      if (userData.email) {
        this.email = userData.email
      }
    }
  }
}
</script>

<style scoped>
.profile-header {
  padding: 2.5rem 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.profile-avatar-container {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-name-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 2rem;
}
.profile-name{
  font-size: 1.5rem;
  font-weight: 600;
}
.profile-username,
.profile-joinDate,
.profile-email {
  font-size: 1rem;
  color: #aaa;
}
.at-symbol {
  color: #fff;
}
.email-icon {
  width: 16px;
  height: 16px;
  margin-right: 5px;
  fill: #fff;
  color: #fff;
}
.profile-follow-container {
  display: flex;
  gap: 1rem;
}
.profile-followers,
.profile-following {
  text-decoration: none;
  font-size: 1rem;
  color: #aaa;
}
.profile-followers:hover,
.profile-following:hover {
  color: #fff;
  text-decoration: underline;
  cursor: pointer;
}
.profile-follow-number {
  color: #fff;
  font-weight: 600;
}
.profile-editButton {
  margin-left: auto;
  align-self: flex-start;
}
.profile-editButton button{
  font-size: 1rem;
}
</style>
