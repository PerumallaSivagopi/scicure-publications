import React, { Suspense, lazy } from 'react'

const createLazyComponent = (
  importFunc,
  fallback = <div className="loader-wrap"><div className="loader"></div></div>
) => {
  const LazyComponent = lazy(importFunc)
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

export const Login = createLazyComponent(() => import('../feature-module/auth/login/login'))
export const AdminDashboard = createLazyComponent(() => import('../feature-module/pages/dashboard'))
export const OnboardingPage = createLazyComponent(() => import('../feature-module/pages/onboarding'))