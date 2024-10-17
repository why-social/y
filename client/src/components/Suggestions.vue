<template>
  <div class="suggestions-container" v-if="suggestions.length > 0">
    <div class="title">
      <span>Who to follow</span>
    </div>
    <div class="suggestion" v-for="user of suggestions" :key="user">
      <Follower :userId="user"/>
      <Button class="inter-tight-medium follow-button" @click="follow(user)" secondary>
        <span class="material-symbols-outlined">add</span>
        Follow
      </Button>
    </div>
  </div>
</template>

<script>
import VueJwtDecode from 'vue-jwt-decode'
import { Api } from '@/Api'

export default {
  data() {
    return {
      suggestions: []
    }
  },
  methods: {
    async follow(id) {
      await Api.post(`/v1/users/followings/${id}`, null, {
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
      }).then(response => {
        this.suggestions = response.data
      })
    }
  },
  mounted() {
    this.suggestions = this.loadSuggestions()
  },
  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token')).userId
    }
  }
}

</script>

<style scoped>
.suggestions-container {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0.7rem 1rem;
  margin: 12rem 0;
  display: flex;
  flex-direction: column;
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
  font-size: 1rem;
  padding: 0.5rem;
  height: fit-content;
  gap: 0.2rem;
}

@media (min-width: 1200px) {
  .suggestions-container {
    width: 18rem;
  }
}

@media (min-width: 1600px) {
  .suggestions-container {
    width: 24rem;
  }
}
</style>
