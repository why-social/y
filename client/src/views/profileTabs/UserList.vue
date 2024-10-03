<template>
  <div>
    <Follower v-for="user in users" :follower="user" :key="user._id" :followFlag="followFlag"/>
  </div>
</template>

<script>
export default {
  props: ['users', 'followFlag']
}
</script>

<style scoped>

</style>
