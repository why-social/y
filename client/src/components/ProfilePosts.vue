<template>
  <div class="profile-feed">
    <div class="profile-navbar">
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'posts' }"
        @click="updateTab('posts')">Posts</div>
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'comments' }"
        @click="updateTab('comments')">Comments</div>
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'followers' }"
        @click="updateTab('followers')">Followers</div>
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'followings' }"
        @click="updateTab('followings')">Followings</div>
      <div
        v-if="isMe"
        class="navbar-element"
        :class="{ active: activeTab === 'liked' }"
        @click="updateTab('liked')">Liked</div>
    </div>

    <router-view v-if="activeTab === 'posts'" :posts="posts"/>
    <router-view v-else-if="activeTab === 'comments'" :comments="comments"/>
    <router-view v-else-if="activeTab === 'followers'" :users="followers" :followFlag="true"/>
    <router-view v-else-if="activeTab === 'followings'" :users="followings" :followFlag="false"/>
    <router-view v-else-if="activeTab === 'liked' && isMe" :posts="posts"/>
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
      posts: [],
      comments: [],
      followers: [],
      followings: [],
      likedPosts: [],
      activeTab: 'posts'
    }
  },
  async mounted() {
    await this.loadTabData(this.activeTab)
  },
  computed: {
    isMe() {
      return this.$route.path.match('/profile/me/.*')
    }
  },
  methods: {
    async loadTabData(tab) {
      switch (tab) {
        case 'posts': {
          try {
            const response = await Api.get('/v1/posts/users/' + this.userData._id)
            this.posts = response.data
          } catch (error) {
            if (error.response.status === 404) {
              this.posts = []
            }
          }
          break
        }
        case 'comments': {
          const response = await Api.get('/v1/comments/users/' + this.userData._id)
          this.comments = response.data
          break
        }
        case 'followers': {
          const response = await Api.get('/v1/users/' + this.userData._id + '/followers')
          this.followers = response.data
          break
        }
        case 'followings': {
          const response = await Api.get('/v1/users/' + this.userData._id + '/followings')
          this.followings = response.data
          console.log(this.followings)
          break
        }
        // TODO: add 'liked' case
      }
    },
    updateTab(tab) {
      if (tab !== this.activeTab) {
        this.activeTab = tab
        this.$router.push(tab)
      }
    }
  },
  watch: {
    async activeTab(newTab, oldTab) {
      this.loadTabData(newTab)
    },
    userData: {
      handler: async function (newData, oldData) {
        this.loadTabData(this.activeTab)
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
