<script setup>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

import Follower from '@/components/Follower.vue'
import Button from '@/components/misc/Button.vue'
</script>

<template>
  <div class="suggestions-container" v-if="suggestions?.length > 0">
    <div class="title">
      <span>Who to follow</span>
    </div>
    <div class="suggestion" v-for="user of suggestions" :key="user">
      <Follower :username="user" />

      <Button
        class="inter-tight-medium follow-button"
        @click="follow(user)"
        secondary
      >
        <span class="material-symbols-outlined">person_add</span>
      </Button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      suggestions: []
    }
  },
  methods: {
    async follow(username) {
      await Api.post(`/v1/users/followings/${username}`, null, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
      this.loadSuggestions()
    },
    loadSuggestions() {
      Api.get(`/v1/users/${this.viewer}/suggestions`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then((response) => {
        this.suggestions = response.data
      })
    }
  },
  mounted() {
    this.suggestions = this.loadSuggestions()
  },
  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token')).username
    }
  }
}
</script>

<style scoped>
.suggestions-container {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0.7rem 1rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
}

.title {
  font-weight: 600;
  font-size: 1.5rem;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
  margin-bottom: 0.75rem;
}

.suggestion {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.follow-button {
  margin-left: auto;
  font-size: 1rem;
  padding: 0.5rem;
  height: fit-content;
  gap: 0.2rem;
}
</style>
