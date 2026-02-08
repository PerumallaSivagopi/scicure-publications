import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../data/redux/hooks";
import { setMobileSidebar } from "../../data/redux/sidebarSlice";
import { setDataTheme } from "../../data/redux/themeSettingSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.themeSetting.dataTheme);
  const sidebarOpen = useAppSelector((s) => s.sidebarSlice.mobileSidebar);

  const toggleSidebar = () => dispatch(setMobileSidebar(!sidebarOpen));
  const toggleTheme = () =>
    dispatch(setDataTheme(theme === "dark" ? "light" : "dark"));
  const IMG_BASE = import.meta.env.VITE_IMAGE_BASE_URL;

  // ✅ Add rotation state here
  const [rotated, setRotated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const userRole = localStorage.getItem("userRole") || "Admin";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Parse user info safely
  const defaultUserInfo = { userName: "User", email: "admin@scicure.com", role: "", journalImage: "" };
  let userInfo = defaultUserInfo;
  try {
    const storedInfo = localStorage.getItem("userInfo");
    if (storedInfo) {
      userInfo = { ...defaultUserInfo, ...JSON.parse(storedInfo) };
    }
  } catch (error) {
    console.error("Failed to parse user info", error);
  }

  const avatarSrc =
    userInfo.journalImage
      ? (userInfo.journalImage.startsWith("http")
          ? userInfo.journalImage
          : `${IMG_BASE}${userInfo.journalImage}`)
      : "/image.png";

  // Wrap your existing function so both things run
  const handleMenuClick = () => {
    setRotated(!rotated); // rotate the arrow
    toggleSidebar(); // your redux sidebar toggle
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userInfo");
    navigate("/login");
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
        {/* Theme Toggle Removed */}
        
        <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-3 p-1 rounded-full bg-white hover:bg-gray-100 transition-colors focus:outline-none border border-gray-100 shadow-sm"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00467F]">
                 <img 
                    src={avatarSrc} 
                    alt="avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = "/image.png" }}
                 />
              </div>
              <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-[#031E40] leading-none">{userInfo.email || userRole}</span>
                  <span className="text-[10px] text-gray-500">{userInfo.role || userRole}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-bold text-[#031E40] capitalize">{userInfo.userName || userRole}</p>
                  <p className="text-xs text-gray-500 truncate" title={userInfo.email}>{userInfo.email}</p>
                </div>
                
                <div className="py-2">
                  <Link 
                    to="/profile" 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={18} className="text-[#00467F]" /> Profile
                  </Link>
                </div>

                <div className="border-t border-gray-50 pt-2">
                  <button 
                    onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
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
