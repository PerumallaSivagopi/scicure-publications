import ApiClient from './apiClient'

const authBase = import.meta.env.VITE_AUTH_BASE || (import.meta.env.DEV ? '/auth-api' : 'http://auth.qa.thehrpay.com')
const authClient = new ApiClient(authBase)

export const loginAdmin = (identifier, password) =>
  authClient
    .post(
      '/api/RoleAuthentication/AdminLogin',
      { identifier, password },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then((res) => res?.token || res?.accessToken || res?.jwt || res?.authorization || res?.data?.token || res?.Data?.Token)

export default { loginAdmin }