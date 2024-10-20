<script setup>
import { Api } from '@/Api'

import Post from '@/components/items/Post.vue'
</script>

<template>
  <div ref="container">
    <Post
      v-for="post in posts"
      :item="post"
      :dateFormat="'now'"
      :key="post._id"
    />

    <template v-if="!next">
      <p class="recents-end-message">All caught up!</p>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: [],
      next: '/v1/posts',
      lastQuery: null,
      querying: false
    }
  },

  methods: {
    loadData() {
      if (!this.querying && this.next && this.lastQuery !== this.next) {
        this.querying = true

        Api.get(this.next, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
          .then((response) => {
            if (response.data) {
              this.posts.push(...response.data.posts)
              this.lastQuery = this.next
              this.next = response.data._links?.next?.href
            }
          })
          .catch((error) => {
            console.log(error)
          })
          .finally(() => {
            this.querying = false
          })
      }
    },
    scrollListener() {
      if (
        document.body.scrollHeight - window.innerHeight <
        document.body.scrollTop + 500
      ) {
        this.loadData()
      }
    }
  },

  created() {
    document.body.addEventListener('scroll', this.scrollListener)
  },

  unmounted() {
    window.removeEventListener('scroll', this.scrollListener)
  },

  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.recents-end-message {
  width: 100%;
  text-align: center;
  padding: 2rem;
  font-size: 1.5rem;
  font-weight: 300;
}
</style>
