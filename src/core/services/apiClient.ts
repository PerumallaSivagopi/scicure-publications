import axios from 'axios'
import { api_base } from '../../environment'

let tokenGetter = () => localStorage.getItem('authToken')

class ApiClient {
  private client

  constructor(baseURL = api_base) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: { Accept: 'application/json' },
    })

    this.client.interceptors.request.use((config: any) => {
      const t = tokenGetter()
      if (import.meta?.env?.DEV) {
        console.log('API Request to:', config.url, 'with token:', t)
      }

      const skipAuth = (config as any)?.skipAuth === true
      if (!skipAuth && t) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${t}`,
        }
      }

      return config
    })

    // Response Interceptor
    this.client.interceptors.response.use(
      (res) => res,
      (err: any) => {
        const status = err?.response?.status
        
        if (status === 401) {
          localStorage.removeItem('authToken');
          // Optional: localStorage.removeItem('userRole');
          if (!window.location.pathname.includes('/login')) {
             window.location.href = '/login';
          }
        }

        const data = err?.response?.data
        const msg =
          typeof data === 'string'
            ? data
            : data?.message || (status ? `Request failed with status ${status}` : 'Network error')

        if (import.meta?.env?.DEV) {
          console.error('API Error', {
            url: err?.config?.url,
            baseURL: err?.config?.baseURL,
            status,
            data,
          })
        }

        return Promise.reject(new Error(msg))
      }
    )
  }

  // ====================
  // Utility Methods
  // ====================

  setTokenGetter(fn) {
    tokenGetter = fn
  }

  setBaseURL(url: string) {
    this.client.defaults.baseURL = url
  }

  get(url, params, config) {
    return this.client.get(url, { params, ...config }).then((r) => r.data)
  }

  post(url, data, config) {
    return this.client.post(url, data, { ...config }).then((r) => r.data)
  }

  put(url, data, config) {
    return this.client.put(url, data, { ...config }).then((r) => r.data)
  }

  patch(url, data, config) {
    return this.client.patch(url, data, { ...config }).then((r) => r.data)
  }

  delete(url, config) {
    return this.client.delete(url, { ...config }).then((r) => r.data)
  }

  request(config) {
    return this.client.request(config).then((r) => r.data)
  }
}

export const apiClient = new ApiClient()
export default ApiClient
