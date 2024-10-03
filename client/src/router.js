import { createRouter, createWebHistory } from 'vue-router'

import VueJwtDecode from 'vue-jwt-decode'

import Main from './views/Main.vue'
import Home from './views/Home.vue'
import Discover from './views/Discover.vue'
import Auth from './views/Auth.vue'
import Login from './views/Login.vue'
import Recover from './views/Recover.vue'
import Register from './views/Register.vue'

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
        component: Home
      },
      {
        path: 'discover',
        name: 'discover',
        component: Discover
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
      }
    ]
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
      path: '/'
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
