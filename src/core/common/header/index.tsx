import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../data/redux/hooks";
import { setMobileSidebar } from "../../data/redux/sidebarSlice";
import { setDataTheme } from "../../data/redux/themeSettingSlice";

const Header = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.themeSetting.dataTheme);
  const sidebarOpen = useAppSelector((s) => s.sidebarSlice.mobileSidebar);

  const toggleSidebar = () => dispatch(setMobileSidebar(!sidebarOpen));
  const toggleTheme = () =>
    dispatch(setDataTheme(theme === "dark" ? "light" : "dark"));
  const IMG_BASE = import.meta.env.VITE_IMAGE_BASE_URL;

  // ✅ Add rotation state here
  const [rotated, setRotated] = useState(false);

  // Wrap your existing function so both things run
  const handleMenuClick = () => {
    setRotated(!rotated); // rotate the arrow
    toggleSidebar(); // your redux sidebar toggle
  };

  return (
    <header className="app-header">
      <div className="left">
        <button
          className="icon-btn mobile-toggle"
          aria-label="Toggle menu"
          onClick={handleMenuClick}
        >
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

      <div className="right">
        <button className="icon-btn" title="Theme" onClick={toggleTheme}>
          <i className={theme === "dark" ? "ti ti-sun" : "ti ti-moon"} />
        </button>
        
        <div className="relative">
            <button
              className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00467F]">
                 <img src="/image.png" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-[#031E40] dark:text-gray-200 leading-none capitalize">{userRole}</span>
                  <span className="text-[10px] text-gray-500">Scicure Inc.</span>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                  <p className="text-sm font-bold text-[#031E40] dark:text-white capitalize">{userRole}</p>
                  <p className="text-xs text-gray-500 truncate">admin@scicure.com</p>
                </div>
                
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                    <User size={18} className="text-[#00467F]" /> Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                    <Settings size={18} className="text-[#00467F]" /> Settings
                  </button>
                </div>

                <div className="border-t border-gray-50 dark:border-gray-700 pt-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors font-medium"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
