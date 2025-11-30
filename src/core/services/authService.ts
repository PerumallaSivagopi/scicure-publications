import ApiClient from './apiClient'

const authBase = import.meta.env.VITE_AUTH_BASE
const authClient = new ApiClient(authBase)

export const loginAdmin = (email, password) =>
  authClient
    .post(
      '/users/login',
      { email, password },
      { headers: { 'Content-Type': 'application/json' }, skipAuth: true }
    )

export default { loginAdmin }
