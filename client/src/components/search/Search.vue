<script setup>
import { Api } from '@/Api'

import Suggestions from '@/components/search/Suggestions.vue'
import Follower from '@/components/Follower.vue'
</script>

<template>
  <div id="search">
    <Input
      icon="search"
      type="text"
      v-model="searchQuery"
      @input="handleInputChange"
    />
    <div v-if="result.length != 0" class="search-results">
      <Follower
        v-for="username of result"
        :key="username"
        :username="username"
      />
    </div>
    <span v-else-if="searchQuery.length >= 3" class="search-not-found"
      >No user found</span
    >
    <Suggestions />
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      result: []
    }
  },
  methods: {
    handleInputChange(event) {
      if (event.target.value.length < 3) {
        this.result = []
        return
      }
      Api.get('/v1/users/search?query=' + event.target.value)
        .then((response) => {
          this.result = response.data
        })
        .catch((error) => {
          if (error.response.status === 404 || error.response.status === 400) {
            this.result = []
          } else console.error(error)
        })
    }
  }
}
</script>

<style scoped>
#search {
  pointer-events: all;
  min-height: 100%;
  padding: 20px;
  position: fixed;
  box-sizing: border-box;
  border-left: none;
  height: fit-content;
  width: inherit;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.search-not-found {
  width: 100%;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
}

.search-results {
  display: flex;
  padding: 0.5rem;
  flex-direction: column;
  gap: 0.5rem;
}

.search-results > .follower-container {
  padding: 0.1rem;
}
</style>
