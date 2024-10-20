<template>
  <div id="container">
    <template v-if="isLoaded">
      <ProfileHeader :userData="userData" @updateUserData="updateUserData" />
      <ProfilePosts :userData="userData" />
    </template>

    <template v-else>
      <Spinner />
    </template>
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
      avatarUrl: 'https://via.placeholder.com/150',
      isLoaded: false
    }
  },
  async created() {
    await this.handleRouteChange()
  },
  mounted() {
    document.body.scrollTo(0, 0)
  },
  watch: {
    '$route.params.username': 'handleRouteChange'
  },
  methods: {
    async handleRouteChange() {
      this.isLoaded = false

      const paramUsername = this.$route.params.username
      const token = localStorage.getItem('token')
      let decodedUsername
      if (token) {
        // Check if token has expired
        const decoded = VueJwtDecode.decode(token)
        const expired = decoded.exp - Date.now() / 1000 < 0
        if (expired) return this.$router.push('/auth/login')

        decodedUsername = decoded.username
      }

      if (paramUsername === 'me') {
        this.userData._id = decodedUsername
        this.userData.isViewer = true

        const userReq = await Api.get('/v1/users/' + decodedUsername, {
          headers: { Authorization: token }
        })

        await this.fetchUserData(decodedUsername, userReq)
      } else {
        this.userData.isViewer = false

        try {
          const userReq = await Api.get('/v1/users/' + paramUsername)

          // Redirect to /profile/me if user tries to access his own profile
          if (decodedUsername && userReq.data.username === decodedUsername) {
            return this.$router.push('/profile/me')
          }

          await this.fetchUserData(paramUsername, userReq)
        } catch (error) {
          // User not found by id
          if (error.response.status === 404 || error.response.status === 400) {
            return this.$router.push('/404')
          }
        }
      }

      this.isLoaded = true
    },
    async fetchUserData(username, userReq) {
      const userReqData = userReq.data

      const followersReq = await Api.get('/v1/users/' + username + '/followers')
      const followingsReq = await Api.get('/v1/users/' + username + '/followings')

      this.userData._id = userReqData._id
      this.userData.name = userReqData.name
      this.userData.username = userReqData.username
      this.userData.joinDate = moment(userReqData.joinDate).format(
        'DD MMMM YYYY'
      )
      this.userData.followers = followersReq.data
      this.userData.following = followingsReq.data
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
  height: 100%;
  padding: 20px;
}
</style>
