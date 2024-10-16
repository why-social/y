<template>
  <div id="container">
    <ProfileHeader :userData="userData" @updateUserData="updateUserData" />
    <hr />
    <ProfilePosts :userData="userData" />
  </div>
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
      userData: {
        _id: '',
        name: '',
        username: '',
        joinDate: '',
        followers: [],
        following: [],
        avatarUrl: '',
        about_me: '',
        email: '',
        isViewer: false
      },
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
      const paramUsername = this.$route.params.username
      const token = localStorage.getItem('token')
      let decodedUserId
      if (token) {
        // Check if token has expired
        const decoded = VueJwtDecode.decode(token)
        const expired = decoded.exp - Date.now() / 1000 < 0
        if (expired) return this.$router.push('/auth/login')

        decodedUserId = decoded.userId
      }

      if (paramUsername === 'me') {
        this.userData._id = decodedUserId
        this.userData.isViewer = true

        const userReq = await Api.get('/v1/users/' + decodedUserId, {
          headers: { Authorization: token }
        })

        await this.fetchUserData(decodedUserId, userReq)
      } else {
        this.userData.isViewer = false

        try {
          const userReq = await Api.get('/v1/users/search?username=' + paramUsername)
          this.userData._id = userReq.data._id

          // Redirect to /profile/me if user tries to access his own profile
          if (decodedUserId && this.userData._id === decodedUserId) {
            return this.$router.push('/profile/me')
          }

          await this.fetchUserData(this.userData._id, userReq)
        } catch (error) {
          // User not found by id
          if (error.response.status === 404 || error.response.status === 400) {
            return this.$router.push('/404')
          }
        }
      }
    },
    async fetchUserData(userId, userReq) {
      const userReqData = userReq.data

      // TODO Add profile picture support

      const followersReq = await Api.get('/v1/users/' + userId + '/followers')
      const followingsReq = await Api.get('/v1/users/' + userId + '/followings')

      this.userData._id = userId
      this.userData.name = userReqData.name
      this.userData.username = userReqData.username
      this.userData.joinDate = moment(userReqData.joinDate).format(
        'DD MMMM YYYY'
      )
      this.userData.followers = followersReq.data.map((entry) => entry.follower)
      this.userData.following = followingsReq.data.map(
        (entry) => entry.following
      )
      this.userData.avatarUrl = userReqData.profile_picture_url || this.avatarUrl
      this.userData.about_me = userReqData.about_me || ''
      if (userReqData.email) {
        this.userData.email = userReqData.email
      } else {
        this.userData.email = ''
      }
    },
    async updateUserData(updatedData) {
      try {
        const token = localStorage.getItem('token')
        console.log(updatedData)
        updatedData = {
          name: updatedData.name,
          about_me: updatedData.about_me,
          avatar: updatedData.avatar
        }

        // image upload
        if (updatedData.avatar) {
          const formData = new FormData()
          formData.append('image', updatedData.avatar)
          const response = await Api.put(
            `/v1/users/${this.userData._id}/profile_picture`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token
              }
            }
          )

          this.userData.avatarUrl = response.data.pfp
        }

        // update user data
        await Api.patch('/v1/users/' + this.userData._id, updatedData, {
          headers: { Authorization: token }
        })
        this.userData.name = updatedData.name
        this.userData.about_me = updatedData.about_me
        console.log('Updated user data:', updatedData)
      } catch (error) {
        console.error('Error updating user data:', error)
      }
    }
  }
}
</script>

<style>
#container {
  width: 100%;
  padding: 20px;
}
</style>
