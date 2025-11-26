import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthFeature = () => {
  return (
    <div className="auth-page">
      <Outlet />
    </div>
  )
}

export default AuthFeature