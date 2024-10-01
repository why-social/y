<template>
  <div class="profile-feed">
      <!-- <PostPrompt />
      <Post v-for="post in posts" :post="post" :key="post._id" /> -->
  </div>
</template>

<script>
// import { Api } from '@/Api'
// export default {
//   name: 'Profile',
//   data() {
//     return {
//       posts: []
//     }
//   },
//   async created() {
//     // const response = await Api.get('/v1/posts')
//     // this.posts = response.data
//   }
// }
</script>

<style scoped>
.profile-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
