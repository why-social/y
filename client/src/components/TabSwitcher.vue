<template>
  <div class="tab-switcher-container">
    <div class="tab-switcher" ref="tabs">
      <div
        class="tab"
        v-for="tab in this.tabs"
        :key="tab.route"
        :class="{ active: tabs[activeTab] === tab }"
        @click="switchTab(tab)"
      >
        <div class="tab-label">
          {{ tab.title }}
        </div>
      </div>
    </div>

    <hr />
  </div>
</template>

<script>
export default {
  props: ['tabs'],

  data() {
    return {
      preventClick: false,
      activeTab: 0
    }
  },
  methods: {
    switchTab(tab) {
      if (!this.preventClick) {
        this.activeTab = this.tabs.indexOf(tab)
        this.$router.replace(tab.route)
      }
    },

    resetTab() {
      const route = this.$route.name
      const tab = this.tabs.find((tab) => tab.route === route)

      if (tab) {
        this.activeTab = this.tabs.indexOf(tab)
      } else {
        this.activeTab = 0
      }
    },

    fadeTabs() {
      const slider = this.$refs.tabs

      const left = slider.scrollLeft
      const right = slider.scrollWidth - slider.clientWidth - slider.scrollLeft

      if (left === 0 && right === 0) {
        slider.style.mask = ''
      } else if (left === 0) {
        slider.style.mask = 'linear-gradient(90deg, black 93%, transparent)'
      } else if (right === 0) {
        slider.style.mask = 'linear-gradient(90deg, transparent, black 7%)'
      } else {
        slider.style.mask =
          'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)'
      }
    }
  },

  // https://codepen.io/thenutz/pen/VwYeYEE
  // custom fader and click handler added
  mounted() {
    const slider = this.$refs.tabs
    let isDown = false
    let startX
    let scrollLeft

    slider.addEventListener('mousedown', (e) => {
      isDown = true

      this.preventClick = false

      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
    })

    slider.addEventListener('mouseleave', () => {
      isDown = false
    })

    slider.addEventListener('mouseup', () => {
      isDown = false
    })

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return
      e.preventDefault()

      const x = e.pageX - slider.offsetLeft
      const walk = x - startX
      slider.scrollLeft = scrollLeft - walk

      if (walk > 10) { // artificially increase move click threshold
        this.preventClick = true
      }

      this.fadeTabs()
    })

    window.addEventListener('resize', this.fadeTabs)

    this.fadeTabs()
  },

  unmounted() {
    window.removeEventListener('resize', this.fadeTabs)
  },

  created() {
    this.resetTab()
  },

  watch: {
    $route(to) {
      if (to.meta.resetTab) {
        this.resetTab()
      }
    }
  }
}
</script>

<style scoped>
hr {
  margin-top: 0;
}
.tab-switcher-container {
  pointer-events: all;
  overflow: hidden;
  width: 100%;
  position: sticky;
  top: 0;
}
.tab-switcher {
  overflow-x: auto;
  transition: 0.5s;
  width: 100%;
  user-select: none;
  display: flex;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding-top: 1rem;
  padding-bottom: 1rem;
  justify-content: space-around;
}
.tab {
  display: flex;
  flex: 1;
  cursor: pointer;
  font-size: 1.1rem;
  justify-content: center;
  letter-spacing: -0.05rem;
  font-weight: 200;
}
.tab-label {
  width: 8rem;
  padding-top: 0.5rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
  transition: 0.3s;
  border-radius: 2px;
  border-bottom: 3px solid transparent;
}
.tab:hover .tab-label {
  border-bottom: 3px solid var(--color-button-emphasize);
  letter-spacing: 0px;
  font-weight: 500;
}
.tab.active .tab-label {
  border-bottom: 3px solid var(--color-button-emphasize);
  letter-spacing: 0px;
  font-weight: 500;
}
</style>
