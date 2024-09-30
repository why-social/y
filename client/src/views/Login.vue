<template>
  <form
    @submit.prevent="onSubmit"
    class="inter-tight-regular d-flex flex-column gap-2"
  >
    <Input
      id="username"
      v-model="username"
      type="text"
      placeholder="Username"
      required
    />

    <Input
      id="password"
      v-model="password"
      placeholder="Password"
      type="password"
      required
    />

    <div class="d-flex justify-content-center flex-column gap-2 mt-5">
      <span class="error text-center inter-tight-regular">{{ message }}</span>
      <Button type="submit" class="w-100">Log in</Button>
      <Button secondary class="w-100" @click="$router.push('recover')"
        >Forgot password?</Button
      >
    </div>

    <div class="d-flex justify-content-center flex-column mt-5 gap-2">
      <span class="cool mb-2 inter-tight-medium">Wanna join the action?</span>

      <Button secondary @click="$router.push('register')">Sign up</Button>
    </div>
  </form>
</template>

<script>
import { Api } from '@/Api'

export default {
  data() {
    return {
      message: '',
      username: '',
      password: ''
    }
  },
  methods: {
    async onSubmit() {
      Api.post('/v1/login', {
        username: this.username,
        password: this.password
      })
        .then((response) => {
          if (response.data?.token) {
            localStorage.setItem('token', response.data?.token)

            this.$router.push('home')
          } else {
            this.message = 'Something went wrong'
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            this.message = 'User does not exist'
          } else if (error.response?.status === 401) {
            this.message = 'Wrong password'
          } else {
            this.message = 'Something went wrong'
          }
        })
    }
  }
}
</script>

<style>
.cool {
  font-size: 1.5rem;
}
.error {
  font-size: 1.3rem;
  color: var(--color-error);
}
</style>
