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

export const Login = createLazyComponent(() => import('../feature-module/auth/login'))
console.log()
export const AdminDashboard = createLazyComponent(() => import('../feature-module/pages/dashboard'))
export const ArticlePage = createLazyComponent(() => import('../feature-module/pages/article'))
export const AuthorsPage = createLazyComponent(() => import('../feature-module/pages/authors'))
export const EditorsBoard = createLazyComponent(() => import('../feature-module/pages/editorsBoard'))
export const EditorsChief = createLazyComponent(() => import('../feature-module/pages/editorsChief'))
export const JournalsPage = createLazyComponent(() => import('../feature-module/pages/journals'))
export const NotificationsPage = createLazyComponent(() => import('../feature-module/pages/notifications'))
export const ReviewersPage = createLazyComponent(() => import('../feature-module/pages/reviewers'))
export const SettingsPage = createLazyComponent(() => import('../feature-module/pages/settings'))