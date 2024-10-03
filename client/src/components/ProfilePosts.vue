<template>
  <div class="profile-feed">
    <TabSwitcher :tabs="tabs" @switch="updateTab" />

    <router-view v-if="activeTab?.dataReady" :tabData="activeTab.data" />
  </div>
</template>

<script>
import { Api } from '@/Api'

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
      tabs: [],
      activeTab: null
    }
  },
  async mounted() {
    this.resetData()
    this.activeTab = this.tabs[0]
    console.log('Got data')
  },
  computed: {
    isMe() {
      return this.$route.path.match('/profile/me/.*')
    }
  },
  methods: {
    resetData() {
      this.tabs = [
        {
          title: 'Posts',
          route: 'posts',
          data: {
            posts: []
          },
          dataReady: false
        },
        {
          title: 'Comments',
          route: 'comments',
          data: {
            comments: []
          },
          dataReady: false
        },
        {
          title: 'Followers',
          route: 'followers',
          data: {
            users: [],
            followFlag: true
          },
          dataReady: false
        },
        {
          title: 'Followings',
          route: 'followings',
          data: {
            users: [],
            followFlag: false
          },
          dataReady: false
        },
        {
          title: 'Liked',
          route: 'liked',
          data: {
            posts: []
          },
          dataReady: false
        }
      ]
    },
    async loadTabData(tab) {
      switch (tab.route) {
        case 'posts': {
          try {
            const response = await Api.get('/v1/posts/users/' + this.userData._id)
            tab.data.posts = response.data
            tab.dataReady = true
          } catch (error) {
            console.error(error)
            if (error.response?.status === 404) {
              tab.data.posts = []
            }
          }
          break
        }
        case 'comments': {
          const response = await Api.get('/v1/comments/users/' + this.userData._id)
          tab.data.comments = response.data
          tab.dataReady = true
          break
        }
        case 'followers': {
          const response = await Api.get('/v1/users/' + this.userData._id + '/followers')
          tab.data.users = response.data
          tab.dataReady = true
          break
        }
        case 'followings': {
          const response = await Api.get('/v1/users/' + this.userData._id + '/followings')
          tab.data.users = response.data
          tab.dataReady = true
          break
        }
        case 'liked': {
          this.data.posts = []
          tab.dataReady = true
        }
      }
    },
    updateTab(tab) {
      if (tab !== this.activeTab) {
        this.activeTab = tab
      }
    }
  },
  watch: {
    async activeTab(newTab, oldTab) {
      if (!newTab.dataReady) {
        this.loadTabData(newTab)
      }
    },
    userData: {
      handler: async function (newData, oldData) {
        this.resetData()
        this.activeTab = this.tabs[0]
        if (!newData.dataReady) {
          this.loadTabData(this.activeTab)
        }
      },
      deep: true
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
