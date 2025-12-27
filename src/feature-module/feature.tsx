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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 992px)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      {open && isMobile ? <div onClick={close} className="sidebar-overlay" /> : null}
      {routeLoading ? <div className="global-loader"><div className="loader"></div></div> : null}
      <div className="content-wrap">
        <main className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
        <footer className="p-3 border-t border-gray-200 bg-white dark:border-gray-700">
          <small className="text-gray-500 dark:text-gray-400">2025 @copyright</small>
        </footer>
      </div>
    </div>
  )
}

export default Feature
