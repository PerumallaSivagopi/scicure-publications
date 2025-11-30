import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Header from '../core/common/header/index'
import Sidebar from '../core/common/sidebar/index'
import { setMobileSidebar } from '../core/data/redux/sidebarSlice'

const Feature = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const open = useSelector((s: any) => s.sidebarSlice.mobileSidebar)
  const close = () => dispatch(setMobileSidebar(false))
  const [routeLoading, setRouteLoading] = useState(false)
  useEffect(() => {
    setRouteLoading(true)
    const t = setTimeout(() => setRouteLoading(false), 300)
    return () => clearTimeout(t)
  }, [location.pathname])

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 992px)').matches

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      {open && isMobile ? <div onClick={close} className="sidebar-overlay" /> : null}
      {routeLoading ? <div className="global-loader"><div className="loader"></div></div> : null}
      <div className="content-wrap">
        <main className="with-sidebar" style={{ background: 'var(--page-bg)', minHeight: 'calc(100vh - 64px)', padding: 0 }}>
          <Outlet />
        </main>
        <footer style={{ padding: 12, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <small>2025 @copyright</small>
        </footer>
      </div>
    </div>
  )
}

export default Feature
