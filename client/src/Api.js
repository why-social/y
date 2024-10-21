import axios from 'axios'
import router from './router'

export const Api = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api'
})

// Handle 500-600 errors
Api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK' || error.response.status >= 500) {
      router.push('/unreachable')
    }

    return Promise.reject(error)
  }
)
