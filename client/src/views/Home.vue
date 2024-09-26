<template>
  <b-container>
    <b-row>
      <b-col style="position: sticky; top: 0; height: 100vh">
        <NavBar />
      </b-col>
      <b-col cols="7" class="center">
        <PostPrompt />
        <Post />
        <Post />
      </b-col>
      <b-col> test </b-col>
    </b-row>
  </b-container>
</template>

<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'home',
  data() {
    return {
      message: 'none'
    }
  },
  methods: {
    getMessage() {
      Api.get('/')
        .then((response) => {
          this.message = response.data.message
        })
        .catch((error) => {
          this.message = error
        })
    }
  }
}
</script>

<style>
b-container,
b-col {
  height: 100%;
}
.center {
  margin: 2.5rem;
  padding: 2rem 3rem 0 3rem;
  box-sizing: border-box;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
}
.btn_message {
  margin-bottom: 1em;
}
</style>
