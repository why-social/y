<template>
  <b-container fluid>
      <b-row>
        <b-col>
          <NavBar />
        </b-col>
        <b-col cols="6" class="center">
          test
        </b-col>
        <b-col>
          test
        </b-col>
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
