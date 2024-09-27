<template>
  <form
    @submit.prevent="onSubmit"
    class="inter-tight-regular d-flex flex-column gap-2"
  >
    <Input
      id="email"
      v-model="identifier"
      type="text"
      placeholder="E-mail or username"
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
      identifier: '',
      password: ''
    }
  },
  methods: {
    onSubmit() {
      alert(
        JSON.stringify({
          identifier: this.identifier,
          password: this.password
        })
      )
    }
  }
}
</script>

<style>
.cool {
  font-size: 1.5rem;
}
</style>
