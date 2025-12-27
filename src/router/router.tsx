import React, { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { publicRoutes, authRoutes } from './router.link'
import ProtectedRoute from './ProtectedRoute'

const Feature = lazy(() => import('../feature-module/feature'))
const AuthFeature = lazy(() => import('../feature-module/authFeature'))

const ALLRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Suspense fallback={<div className="loader-wrap"><div className="loader"></div></div>}>
              <Feature />
            </Suspense>
          }
        >
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Route>

      <Route
        element={
          <Suspense fallback={<div className="loader-wrap"><div className="loader"></div></div>}>
            <AuthFeature />
          </Suspense>
        }
      >
        {authRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>
    </Routes>
  )
}

export default ALLRoutes