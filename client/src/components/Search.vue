<template>
  <div id="search">
    <Input
      icon="search"
      type="text"
      v-model="searchQuery"
      @input="handleInputChange"
    />
    <div v-if="result.length != 0" class="search-results">
      <Follower v-for="username of result" :key="username" :username="username" />
    </div>
    <span v-else-if="searchQuery.length >= 3" class="search-not-found">No user found</span>
    <Suggestions />
  </div>
</template>

<script>
// import Input from '@/components/Input.vue'
import { Api } from '@/Api'

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
        .then(response => { this.result = response.data })
        .catch(error => {
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
  padding: 20px;
  box-sizing: border-box;
  border-left: none;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

@media (min-width: 1200px) {
  #search {
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 40px;
    box-sizing: border-box;
  }
}

.search-not-found {
  width: 100%;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-results > .follower-container {
  padding: 0.1rem
}
</style>
