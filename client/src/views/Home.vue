<template>
  <div id="content">
    <PostPrompt id="homePostPrompt" />

    <hr style="margin-bottom: 0px;"/>

    <TabSwitcher :tabs="tabs" />

    <router-view id="homeContent" />
  </div>
</template>

<style scoped>
#content {
  display: block;
  padding-left: 20px;
  padding-right: 20px;
  height: 100%;
  width: 100%;
}

#homeContent {
  position: relative;
  z-index: -1;
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
  },

  mounted() {
    if (this.$route.query?.focus) {
      this.focus(true)
    }
  },

  methods: {
    focus(value) {
      if (value) {
        document.body.scrollTo(0, 0)

        const element = document.getElementById('homePostPrompt')

        if (element) {
          element.setAttribute('focused', '')
        }
      }
    }
  },

  watch: {
    '$route.query.focus': {
      immediate: true,
      handler(value) {
        this.focus(value)
      }
    }
  }
}
</script>
