<template>
  <div v-if="posts.length != 0">
    <Post v-for="post in posts" :post="post" :key="post._id" />
  </div>
  <div v-else class="posts-no-posts">
    <span>No posts yet</span>
  </div>
</template>

<script>
export default {
  props: {
    tabData: {
      type: Object,
      required: true
    }
  },
  computed: {
    posts() {
      return this.tabData.posts || []
    }
  },
  mounted() {
    console.log(this.posts)
  }
}
</script>

<style scoped>
.posts-no-posts {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: var(--color-on-background);
  text-align: center;
}
</style>
