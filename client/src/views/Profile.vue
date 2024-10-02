<template>
  <b-container>
    <b-row>
      <b-col style="position: sticky; top: 0; height: 100vh">
        <NavBar />
      </b-col>
      <b-col cols="7" class="center">
        <ProfileHeader :userData="userData"/>
        <hr>
        <ProfilePosts :userData="userData"/>
      </b-col>
      <b-col> test col </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'
import moment from 'moment'
import ProfileHeader from '../components/ProfileHeader.vue'
import ProfilePosts from '../components/ProfilePosts.vue'

export default {
  components: {
    ProfileHeader,
    ProfilePosts
  },
  data() {
    return {
      userData: {},
      avatarUrl: 'https://via.placeholder.com/150'
    }
  },
  async created() {
    await this.handleRouteChange()
  },
  watch: {
    '$route.params.userId': 'handleRouteChange'
  },
  methods: {
    async handleRouteChange() {
      const paramId = this.$route.params.userId
      const token = localStorage.getItem('token')
      let decodedUserId
      if (token) {
        // Check if token has expired
        const decoded = VueJwtDecode.decode(localStorage.getItem('token'))
        const expired = decoded.exp - (Date.now() / 1000) < 0
        if (expired) return this.$router.push('/auth/login')

        decodedUserId = decoded.userId

        // Redirect to /profile/me if user tries to access his own profile
        if (paramId === decodedUserId) {
          this.$router.push('/profile/me')
        }
      }

      if (paramId === 'me') {
        this.userData._id = decodedUserId
        const userReq = await Api.get('/v1/users/' + decodedUserId, { headers: { Authorization: token } })

        await this.fetchUserData(decodedUserId, userReq)
      } else {
        this.userData._id = paramId
        try {
          const userReq = await Api.get('/v1/users/' + paramId)

          await this.fetchUserData(paramId, userReq)
        } catch (error) { // User not found by id
          if (error.response.status === 404) {
            return this.$router.push('/404')
          }
        }
      }
    },
    async fetchUserData(userId, userReq) {
      const userReqData = userReq.data

      // TODO Add profile picture support

      let followersReq = await Api.get('/v1/users/' + userId + '/followers')
      let followingsReq = await Api.get('/v1/users/' + userId + '/followings')
      followersReq = followersReq.data.length
      followingsReq = followingsReq.data.length

      this.userData._id = userId
      this.userData.name = userReqData.name
      this.userData.username = userReqData.username
      this.userData.joinDate = moment(userReqData.joinDate).format('DD MMMM YYYY')
      this.userData.followers = followersReq
      this.userData.following = followingsReq
      this.userData.avatarUrl = userReqData.profile_picture || this.avatarUrl
      if (userReqData.email) {
        this.userData.email = userReqData.email
      }
    }
  }
}
</script>

<style>
</style>
