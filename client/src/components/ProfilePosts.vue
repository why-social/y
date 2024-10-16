<template>
  <div class="profile-feed">
    <TabSwitcher :tabs="tabs" />

    <router-view :key="$route.path" />
  </div>
</template>

<script>
export default {
  name: 'Profile',
  props: {
    userData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tabs: [
        { title: 'Posts', route: 'posts' },
        { title: 'Comments', route: 'comments' },
        { title: 'Followers', route: 'followers' },
        { title: 'Followings', route: 'followings' }
      ]
    }
  }
}
</script>

<style scoped>
.profile-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.profile-navbar {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}
.navbar-element {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid var(--color-background);
  transition: border-bottom 0.4s;
  font-weight: 500;
}
.navbar-element:hover {
  border-bottom: 2px solid var(--color-button-emphasize);
}
.navbar-element.active {
  border-bottom: 2px solid var(--color-button-emphasize);
}
</style>
