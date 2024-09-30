<template>
  <form
    @submit.prevent="onSubmit"
    class="inter-tight-regular d-flex flex-column gap-2"
  >
    <Input
      id="email"
      v-model="email"
      type="email"
      placeholder="E-mail"
      required
    />

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
      email: ''
    }
  },
  methods: {
    onSubmit() {
      alert(
        JSON.stringify({
          email: this.email
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
