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
      id="email"
      v-model="email"
      type="email"
      placeholder="E-mail"
      required
    />

    <Input
      id="password"
      v-model="password"
      title="Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, a special character, and contain no spaces."
      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$"
      placeholder="Password"
      type="password"
      required
    />

    <Input
      id="confirmation"
      title="Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, a special character, and contain no spaces."
      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$"
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
    onSubmit() {
      alert(
        JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password,
          confirmation: this.confirmation,
          date: new Date(
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
