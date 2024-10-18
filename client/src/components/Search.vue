<template>
  <div id="search">
    <Input
      icon="search"
      type="text"
      v-model="searchQuery"
      @input="handleInputChange"
    />
    <Follower :userId="searchUserId" v-if="searchUserId.length != 0" />
    <span
      class="search-not-found"
      v-if="searchQuery.length >= 3 && searchUserId.length == 0"
      >No user found</span
    >
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
      searchUserId: ''
    }
  },
  methods: {
    async handleInputChange(event) {
      try {
        if (event.target.value.length < 3) {
          this.searchUserId = ''
          return
        }
        const response = await Api.get(
          '/v1/users/search?username=' + event.target.value
        )
        this.searchUserId = response.data._id
      } catch (error) {
        if (error.response.status === 404 || error.response.status === 400) {
          this.searchUserId = ''
        }
      }
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
</style>
