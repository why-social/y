<template>
  <div class="profile-feed">
    <div class="profile-navbar">
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'posts' }"
        @click="activeTab = 'posts'">Posts</div>
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'comments' }"
        @click="activeTab = 'comments'">Comments</div>
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'followers' }"
        @click="activeTab = 'followers'">Followers</div>
      <div
        class="navbar-element"
        :class="{ active: activeTab === 'followings' }"
        @click="activeTab = 'followings'">Followings</div>
      <div
        v-if="isMe"
        class="navbar-element"
        :class="{ active: activeTab === 'liked' }"
        @click="activeTab = 'liked'">Liked</div>
    </div>
    <div v-if="activeTab === 'posts'">
      <div v-if="posts.length != 0">
        <Post v-for="post in posts" :post="post" :key="post._id" />
      </div>
      <div v-else class="posts-no-posts">
        <span>No posts yet</span>
      </div>
    </div>
    <div v-else-if="activeTab === 'comments'">
      <!-- TODO render the comments with 'Comments' component-->
    </div>
    <div v-else-if="activeTab === 'followers'">
      <Follower v-for="follower in followers" :follower="follower" :key="follower._id" />
    </div>
    <div v-else-if="activeTab === 'followings'">
      <!-- TODO render the followings with 'Follower' component-->
    </div>
    <div v-else-if="activeTab === 'liked'">
      <!-- Render liked posts -->
    </div>
  </div>
</template>

<script>
import Follower from '../components/Follower.vue'
import { Api } from '@/Api'

export default {
  name: 'Profile',
  components: {
    Follower
  },
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
      return this.$route.path === '/profile/me'
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
          // case 'liked': {
          //   const response = await Api.get('/v1/posts/users/' + this.userData._id + '/liked')
          //   this.likedPosts = response.data
          //   break
          // }
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
.posts-no-posts {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: var(--color-on-background);
  text-align: center;
}
</style>
