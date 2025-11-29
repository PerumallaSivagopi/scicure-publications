import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMobileSidebar } from '../../data/redux/sidebarSlice'
import { all_routes } from '../../../router/all_routes'
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const open = useSelector((s: any) => s.sidebarSlice.mobileSidebar)

  const close = () => dispatch(setMobileSidebar(false))

  const NavIcon = ({ to, icon, label }) => (
    <Link
      to={to}
      title={label}
      onClick={close}
      className={`nav-icon ${location.pathname === to ? 'active' : ''}`}
    >
      <i className={`ti ${icon}`} />
      <span className="label">{label}</span>
    </Link>
  )
  const IMG_BASE = import.meta.env.VITE_IMAGE_BASE_URL;
  return (
    <aside className={`app-sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <img src={`${IMG_BASE}logo-white.png`} alt="brand" />
        {/* <div className="brand-name">HRM</div> */}
      </div>

      <nav className="sidebar-nav">
        <NavIcon to={all_routes.index} icon="ti-home" label="Dashboard" />
        <NavIcon to={all_routes.onboarding} icon="ti-users" label="E Onboarding" />
        <a className="nav-icon" title="Attendance"><i className="ti ti-cash" /><span className="label">Income Tax</span></a>
      </nav>

      {/* <div className="sidebar-profile">
        <div className="avatar"><img src="/favicon.png" alt="avatar" /></div>
        <div className="profile-name">Admin</div>
      </div> */}
    </aside>
  )
}

export default Sidebar
