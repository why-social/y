import { createRouter, createWebHistory } from 'vue-router'

import VueJwtDecode from 'vue-jwt-decode'

import Home from './views/Home.vue'
import Auth from './views/Auth.vue'
import Login from './views/Login.vue'
import Recover from './views/Recover.vue'
import Register from './views/Register.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    meta: { requiresAuth: true },
    component: Home
  },
  {
    path: '/auth',
    redirect: { name: 'login' },
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
        path: '/auth'
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
