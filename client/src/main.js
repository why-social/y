import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import contenteditable from 'vue-contenteditable'

import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

const app = createApp(App)
app.use(createBootstrap())
app.use(contenteditable)
app.use(router)
app.mount('#app')
