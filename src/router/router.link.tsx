import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { all_routes } from './all_routes'
import { Login, AdminDashboard, ArticlePage, EditorsBoard, EditorsChief, JournalsPage, NotificationsPage, ReviewersPage, SettingsPage, AuthorsPage } from './lazyRoutes'

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
    path: routes.article,
    name: 'Article',
    element: <ArticlePage />,
    route: Route,
  },
  {
    path: routes.authors,
    name: 'Authors',
    element: <AuthorsPage />,
    route: Route,
  },
  {
    path: routes.editorsBoard,
    name: 'Editors Board',
    element: <EditorsBoard />,
    route: Route,
  },
  {
    path: routes.editorsChief,
    name: 'Editors Chief',
    element: <EditorsChief />,
    route: Route,
  },
  {
    path: routes.journals,
    name: 'Journals',
    element: <JournalsPage />,
    route: Route,
  },
  {
    path: routes.notifications,
    name: 'Notifications',
    element: <NotificationsPage />,
    route: Route,
  },
  {
    path: routes.reviewers,
    name: 'Reviewers',
    element: <ReviewersPage />,
    route: Route,
  },
  {
    path: routes.settings,
    name: 'Settings',
    element: <SettingsPage />,
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