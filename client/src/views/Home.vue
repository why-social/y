<template>
  <div id="content">
    <PostPrompt />
    <hr />
    <TabSwitcher :tabs="tabs"/>
    <hr />
    <router-view />
  </div>
</template>

<style scoped>
#content {
  overflow: hidden;
  display: block;
  padding-left: 20px;
  padding-right: 20px;
  height: 100%;
  width: 100%;
}

@media (max-width: 630px) {
  #content {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 20rem;
  }
}
</style>

<script>
export default {
  name: 'home',
  data() {
    return {
      tabs: [
        { title: 'For you', route: 'feed' },
        { title: 'Recent', route: 'recent' }
      ]
    }
  }
}
</script>
