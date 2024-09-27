import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import Auth from './views/Auth.vue'
import Login from './views/Login.vue'
import Recover from './views/Recover.vue'
import Register from './views/Register.vue'

const routes = [
  { path: '/', component: Home },
  {
    path: '/auth/',
    component: Auth,
    children: [
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      },
      {
        path: 'recover',
        component: Recover
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), routes
})

export default router
