<template>
  <div class="profile-feed">
    <TabSwitcher :tabs="tabs" />

    <router-view :key="$route.path"/>
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
      tabs: [
        { title: 'Posts', route: 'posts' },
        { title: 'Comments', route: 'comments' },
        { title: 'Followers', route: 'followers' },
        { title: 'Followings', route: 'followings' }
      ],
      activeTab: 'posts'
    }
  },
  async mounted() {
    if (this.isMe) {
      this.tabs.push({ title: 'Liked', route: 'liked' })
    }
  },
  computed: {
    isMe() {
      return this.$route.path.match('/profile/me/.*')
    }
  },
  methods: {
    async loadTabData(tab) {
      switch (tab.route) {
        case 'posts': {
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
