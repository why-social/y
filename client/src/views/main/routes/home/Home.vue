<script setup>
import PostPrompt from '@/components/prompts/PostPrompt.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
</script>

<template>
  <div id="content">
    <PostPrompt id="homePostPrompt" />

    <hr style="margin-bottom: 0px" />

    <TabSwitcher :tabs="tabs" />

    <router-view id="home-content" />
  </div>
</template>

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

<style scoped>
#content {
  display: block;
  padding-left: 20px;
  padding-right: 20px;
  height: 100%;
  width: 100%;
}

#homePostPrompt {
  pointer-events: all;
}

#home-content {
  pointer-events: all;
  position: relative;
  z-index: -1;
}

@media (max-width: 630px) {
  #content {
    padding-left: 0;
    padding-right: 0;
  }

  #home-content {
    padding-bottom: 10rem;
  }
}
</style>
