import React from 'react'
import { useAppDispatch, useAppSelector } from '../../data/redux/hooks'
import { setMobileSidebar } from '../../data/redux/sidebarSlice'
import { setDataTheme } from '../../data/redux/themeSettingSlice'

const Header = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.themeSetting.dataTheme)
  const sidebarOpen = useAppSelector((s) => s.sidebarSlice.mobileSidebar)

  const toggleSidebar = () => dispatch(setMobileSidebar(!sidebarOpen))
  const toggleTheme = () => dispatch(setDataTheme(theme === 'dark' ? 'light' : 'dark'))

  return (
    <header className="app-header">
      <div className="left">
        {/* <button className="icon-btn" aria-label="Toggle menu" onClick={toggleSidebar}>
          <i className="ti ti-menu-2" />
        </button> */}
        {/* <div className="brand">
          <img src="/favicon.png" alt="logo" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-title">HRM Admin</div>
            <div className="brand-sub">People Management</div>
          </div>
        </div> */}
      </div>

      <div className="center">
        <div className="search-box">
          <i className="ti ti-search" />
          <input placeholder="Search modules, employees, actions" />
        </div>
      </div>

      <div className="right">
        <button className="icon-btn" title="Theme" onClick={toggleTheme}>
          <i className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'} />
        </button>
        <button className="icon-btn" title="Notifications">
          <i className="ti ti-bell" />
        </button>
        <button className="icon-btn" title="Help">
          <i className="ti ti-help" />
        </button>
        <button className="icon-btn" title="Apps">
          <i className="ti ti-apps" />
        </button>
        <div className="profile-mini" title="Admin">
          <img src="/favicon.png" alt="avatar" />
        </div>
      </div>
    </header>
  )
}

export default Header