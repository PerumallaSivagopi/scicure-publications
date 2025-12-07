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
        <img src={`${IMG_BASE}image.png`} alt="brand" />
        <h1>SCICURE PUBLICATIONS</h1>
      </div>


      <nav className="sidebar-nav">
        <NavIcon to={all_routes.index} icon="ti-home" label="Dashboard" />
        <NavIcon to={all_routes.journals} icon="ti-book" label="Journals" />
        <NavIcon to={all_routes.article} icon="ti-files" label="Article" />
        {/* <NavIcon to={all_routes.editorsChief} icon="ti-crown" label="Editors Chief" /> */}
        <NavIcon to={all_routes.editorsBoard} icon="ti-user-check" label="Editors Board" />
        {/* <NavIcon to={all_routes.authors} icon="ti-pencil" label="Authors" /> */}
        <NavIcon to={all_routes.manuscripts} icon="ti-id-badge" label="Manuscripts" />
        <NavIcon to={all_routes.notifications} icon="ti-bell" label="Notifications" />
        <NavIcon to={all_routes.settings} icon="ti-settings" label="Settings" />
      </nav>
    </aside>
  )
}

export default Sidebar
