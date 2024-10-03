<template>
  <div>
    <Follower v-for="user in this.tabData.users" :follower="user" :key="user._id" :followFlag="this.tabData.followFlag"/>
  </div>
</template>

<script>
export default {
  props: ['tabData'],
  mounted() {
    console.log(this.tabData.users)
  }
}
</script>

<style scoped>

</style>
