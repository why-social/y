<template>
  <div>

  </div>
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
        .then(response => {
          this.message = response.data.message
        })
        .catch(error => {
          this.message = error
        })
    }
  }
}
</script>

<style>
b-container, b-col {
  height: 100%;
}
.center {
  border-right: 1px solid gray;
  border-left: 1px solid gray;

}
.btn_message {
  margin-bottom: 1em;
}
</style>
