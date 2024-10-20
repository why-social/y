<template>
  <form style="pointer-events: all;"
    @submit.prevent="onSubmit"
    class="inter-tight-regular d-flex flex-column gap-2"
  >
    <Input
      id="email"
      v-model="email"
      type="email"
      placeholder="E-mail"
      required
      @input="clearError"
    />

    <span class="error text-center inter-tight-regular emailError">{{ errorText }}</span>

    <div class="d-flex justify-content-center flex-column gap-2 mt-5">
      <Button type="submit" class="w-100">Send recovery mail</Button>
    </div>
  </form>
</template>

<script>
import { Api } from '@/Api'

export default {
  data() {
    return {
      email: '',
      errorText: ''
    }
  },
  methods: {
    onSubmit() {
      const payload = {
        email: this.email
      }
      Api.post('/v1/restorePassword', payload)
        .then(res => {
          if (res.status === 200) {
            alert('Email sent successfully')
            this.$router.push('/login')
          }
        })
        .catch((error) => {
          if (error.response.status === 404) {
            this.errorText = 'Email not found'
          } else if (error.response.status === 400) {
            this.errorText = 'No email provided'
          } else if (error.response.status === 500) {
            alert('Server error, please try again later')
          }
          console.error(error)
        })
    },
    clearError() {
      this.errorText = ''
    }
  }
}
</script>

<style>
.cool {
  font-size: 1.5rem;
}
.emailError {
  height: 1rem;
}
</style>
