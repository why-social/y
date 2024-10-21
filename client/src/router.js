import { createRouter, createWebHistory } from 'vue-router'

import VueJwtDecode from 'vue-jwt-decode'

// 404
import NotFound from './views/NotFound.vue'

// Server unreachable
import Unreachable from './views/Unreachable.vue'

// Auth
import Auth from './views/auth/Auth.vue'
import Login from './views/auth/routes/Login.vue'
import Recover from './views/auth/routes/Recover.vue'
import Register from './views/auth/routes/Register.vue'
import Restore from './views/auth/routes/Restore.vue'

// Main
import Main from './views/main/Main.vue'

// Main > Home
import Home from './views/main/routes/home/Home.vue'
import Feed from './views/main/routes/home/tabs/Feed.vue'
import Recent from './views/main/routes/home/tabs/Recent.vue'

// Main > Thread
import Thread from './views/main/routes/Thread.vue'

// Main > Discover
import Discover from './views/main/routes/Discover.vue'

// Main > Profile
import Profile from './views/main/routes/profile/Profile.vue'
import Posts from './views/main/routes/profile/tabs/Posts.vue'
import Comments from './views/main/routes/profile/tabs/Comments.vue'
import Followers from './views/main/routes/profile/tabs/Followers.vue'
import Following from './views/main/routes/profile/tabs/Following.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    redirect: { name: 'home' },
    meta: { requiresAuth: true },
    component: Main,
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home,
        redirect: { name: 'feed' },
        meta: { resetTab: true },
        children: [
          {
            name: 'feed',
            path: 'feed',
            component: Feed
          },
          {
            name: 'recent',
            path: 'recent',
            component: Recent
          }
        ]
      },
      {
        path: 'thread/:id',
        name: 'thread',
        component: Thread
      },
      {
        path: 'discover',
        name: 'discover',
        component: Discover
      },
      {
        path: '/profile/:username',
        name: 'profile',
        redirect: { name: 'posts' },
        meta: { resetTab: true },
        component: Profile,
        children: [
          {
            path: 'posts',
            name: 'posts',
            component: Posts
          },
          {
            path: 'comments',
            name: 'comments',
            component: Comments
          },
          {
            path: 'followers',
            name: 'followers',
            component: Followers
          },
          {
            path: 'followings',
            name: 'followings',
            component: Following
          }
        ]
      },
      {
        path: '/profile',
        redirect: '/profile/me',
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/',
    name: 'auth',
    redirect: { name: 'login' },
    meta: { requiresAuth: false },
    component: Auth,
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login
      },
      {
        path: 'register',
        name: 'register',
        component: Register
      },
      {
        path: 'recover',
        name: 'recover',
        component: Recover
      },
      {
        path: 'restorePassword',
        name: 'restorePassword',
        component: Restore
      }
    ]
  },
  {
    path: '/404',
    component: NotFound,
    meta: { requiresAuth: false }
  },
  {
    path: '/unreachable',
    component: Unreachable,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(), routes
})

router.beforeEach((to, from) => {
  if (to.matched?.length) {
    if (to.meta.requiresAuth && !isLoggedIn()) {
      return {
        path: '/login'
      }
    } else if (to.matched[0].name === 'auth' && isLoggedIn()) {
      return {
        path: '/home'
      }
    }
  } else {
    return {
      path: '/404'
    }
  }
})

function isLoggedIn() {
  const token = localStorage.getItem('token')

  if (token) {
    try {
      const decoded = VueJwtDecode.decode(token)

      return decoded.exp - (Date.now() / 1000) > 0
    } catch (error) {
      return false
    }
  }

  return false
}

export default router
