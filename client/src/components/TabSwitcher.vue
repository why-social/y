<template>
  <div class="tab-switcher">
    <div class="tab" v-for="tab in this.tabs"
      :key="tab.route"
      :class="{active: tabs[activeTab] === tab}"
      @click="switchTab(tab)">{{ tab.title }}</div>
  </div>
</template>

<script>
export default {
  props: ['tabs'],
  data() {
    return {
      activeTab: 0
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = this.tabs.indexOf(tab)
      this.$router.push(tab.route)
    },
    loadTab() {
      const route = this.$route.name
      const tab = this.tabs.find(tab => tab.route === route)
      console.log(route)
      if (tab) {
        this.activeTab = this.tabs.indexOf(tab)
      }
    }
  },
  created() {
    this.loadTab()
  },
  watch: {
    $route(to, from) {
      const newUserId = to.params.userId
      const oldUserId = from.params.userId

      if (newUserId !== oldUserId) {
        this.activeTab = 0
      }
    }
  }
}
</script>

<style scoped>
.tab-switcher {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}
.tab {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid var(--color-background);
  transition: border-bottom 0.4s;
  font-weight: 500;
}
.tab:hover {
  border-bottom: 2px solid var(--color-button-emphasize);
}
.tab.active {
  border-bottom: 2px solid var(--color-button-emphasize);
}
</style>
