import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../data/redux/hooks'
import { setMobileSidebar } from '../../data/redux/sidebarSlice'
import { setDataTheme } from '../../data/redux/themeSettingSlice'

const Header = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.themeSetting.dataTheme)
  const sidebarOpen = useAppSelector((s) => s.sidebarSlice.mobileSidebar)

  const toggleSidebar = () => dispatch(setMobileSidebar(!sidebarOpen))
  const toggleTheme   = () => dispatch(setDataTheme(theme === 'dark' ? 'light' : 'dark'))
  const IMG_BASE = import.meta.env.VITE_IMAGE_BASE_URL;

  // ✅ Add rotation state here
  const [rotated, setRotated] = useState(false);

  // Wrap your existing function so both things run
  const handleMenuClick = () => {
    setRotated(!rotated);   // rotate the arrow
    toggleSidebar();        // your redux sidebar toggle
  };

  return (
    <header className="app-header">
      <div className="left">
        <button className="icon-btn" aria-label="Toggle menu" onClick={handleMenuClick}>
          
          <svg
            className={`menu-icon ${rotated ? "rotate" : ""}`}
            width="40"
            height="40"
            viewBox="-2.4 -2.4 28.80 28.80"
            xmlns="http://www.w3.org/2000/svg"
            transform="rotate(180)"
          >
            <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"></path>
          </svg>

        </button>
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
