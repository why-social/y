<template>
  <form
    @submit.prevent="onSubmit"
    class="inter-tight-regular d-flex flex-column gap-2"
  >
    <Input
      id="name"
      title="Names consist of only spaces, uppercase and lowercase letters."
      pattern="^[a-zA-Z ]{3,40}$"
      v-model="name"
      type="text"
      placeholder="Full name"
      required
    />

    <Input
      id="username"
      title="Usernames consist of only letters, numbers and underscores (_)"
      pattern="^[a-zA-Z0-9_]{3,20}$"
      v-model="username"
      type="text"
      placeholder="Username"
      required
    />

    <Input
      id="email"
      v-model="email"
      type="email"
      placeholder="E-mail"
      required
    />

    <Input
      id="password"
      v-model="password"
      title="Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, a special character (#?!@$%^&*-), and no spaces."
      pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,40}$"
      placeholder="Password"
      type="password"
      required
    />

    <Input
      id="confirmation"
      title="Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, a special character (#?!@$%^&*-), and no spaces."
      pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,40}$"
      v-model="confirmation"
      placeholder="Confirm password"
      type="password"
      required
    />

    <div class="d-flex justify-content-center flex-row gap-2">
      <Select
        id="month"
        default="Month"
        v-model="month"
        :options="[
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ]"
        required
        class="w-50"
      />
      <Select
        id="day"
        v-model="day"
        default="Day"
        :options="
          Array.from({ length: 31 })
            .fill()
            .map((_, i) => i + 1)
        "
        required
        class="w-25"
      />
      <Select
        id="year"
        v-model="year"
        default="Year"
        :options="
          Array.from({ length: 100 })
            .fill()
            .map((_, i) => new Date().getFullYear() - 18 - i)
        "
        required
        class="w-25"
      />
    </div>

    <div class="d-flex justify-content-center flex-column gap-2 mt-5">
      <span class="error text-center inter-tight-regular">{{ message }}</span>
      <Button type="submit" class="w-100">Sign up</Button>
    </div>

    <div class="d-flex justify-content-center flex-column mt-5 gap-2">
      <span class="cool mb-2 inter-tight-medium">Already have an account?</span>

      <Button secondary @click="$router.push('login')">Log in</Button>
    </div>
  </form>
</template>

<script>
import { Api } from '@/Api'

export default {
  data() {
    return {
      message: '',
      name: '',
      username: '',
      email: '',
      password: '',
      confirmation: '',
      month: '',
      day: '',
      year: ''
    }
  },
  methods: {
    async onSubmit() {
      if (this.password !== this.confirmation) {
        this.message = 'Passwords do not match'
      } else {
        const data = {
          name: this.name,
          username: this.username,
          email: this.email,
          password: this.password,
          birthday: new Date(
            (
              [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
              ].indexOf(this.month) + 1
            ).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              useGrouping: false
            }) +
              '/' +
              this.day.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
              }) +
              '/' +
              this.year
          )
        }

        Api.post('/v1/users', data)
          .then((response) => {
            if (response.data?.token) {
              localStorage.setItem('token', response.data?.token)

              this.$router.push('/')
            } else {
              this.message = 'Something went wrong'
            }
          })
          .catch((error) => {
            if (error.response?.data?.message) {
              this.message = error.response.data.message
            }
          })
      }
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
