import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: http://localhost:3001
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})