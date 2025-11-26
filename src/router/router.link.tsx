import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { all_routes } from './all_routes'
import { Login, AdminDashboard, OnboardingPage } from './lazyRoutes'

const routes = all_routes

export const publicRoutes = [
  {
    path: '/',
    name: 'Root',
    element: <Navigate to={routes.login} />,
    route: Route,
  },
  {
    path: routes.index,
    name: 'Index',
    element: <AdminDashboard />,
    route: Route,
  },
  {
    path: routes.onboarding,
    name: 'Onboarding',
    element: <OnboardingPage />,
    route: Route,
  },
]

export const authRoutes = [
  {
    path: routes.login,
    name: 'Login',
    element: <Login />,
    route: Route,
  },
]