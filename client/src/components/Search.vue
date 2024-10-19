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
</style>
