<template>
  <form
    @submit.prevent="onSubmit"
    class="inter-tight-regular d-flex flex-column gap-2"
  >
    <Input
      id="password"
      v-model="password"
      type="password"
      placeholder="Type your new password"
      title="Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, a special character (#?!@$%^&*-), and no spaces."
      pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,40}$"
      required
      @input="handlePasswordChange"
    />
    <Input
      id="passwordConfirm"
      v-model="passwordConfirm"
      type="password"
      placeholder="Confirm your new password"
      required
      @input="handlePasswordChange"
    />
    <span class="error text-center inter-tight-regular passwordsDoNotMatch">{{ passwordConfirmTitle }}</span>
    <div class="d-flex justify-content-center flex-column gap-2 mt-5">
      <Button type="submit" class="w-100">Change password</Button>
    </div>
  </form>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      password: '',
      passwordConfirm: '',
      passwordConfirmTitle: ''
    }
  },
  mounted() {
    // Check if token has expired before rendering the page
    const token = this.$route.query.token
    const decoded = VueJwtDecode.decode(token)
    const expired = decoded.exp - Date.now() / 1000 < 0
    if (expired) {
      alert('The link has expired, please request a new one')
      this.$router.push('/recover')
    }
  },
  methods: {
    handlePasswordChange() {
      this.passwordConfirmTitle = this.password === this.passwordConfirm ? '' : 'Passwords do not match'
    },
    async onSubmit() {
      if (this.password !== this.passwordConfirm) {
        alert('Passwords do not match')
        return
      }
      const token = this.$route.query.token
      const decoded = VueJwtDecode.decode(token)

      // Check if token has expired before updating the password
      const expired = decoded.exp - Date.now() / 1000 < 0
      if (expired) {
        alert('The link has expired, please request a new one')
        this.$router.push('/recover')
      }

      // Get old data
      let oldData = await Api.get('/v1/users/' + decoded.username, {
        headers: { Authorization: this.$route.query.token }
      })
      oldData = oldData.data

      // Update password
      const payload = {
        password: this.password,
        name: oldData.name,
        email: oldData.email,
        about_me: oldData.about_me,
        birthday: oldData.birthday
      }

      // Update user password
      await Api.put('/v1/users/' + decoded.userId, payload, {
        headers: { Authorization: this.$route.query.token }
      }).then(res => {
        if (res.status === 200) {
          this.$router.push('/login')
        }
      }).catch((error) => {
        if (error.response.status === 500) {
          alert('Server error, please try again later')
        }
        console.error(error)
      })
    }
  }
}
</script>

<style scoped>
.passwordsDoNotMatch{
  height: 1rem;
}
</style>
