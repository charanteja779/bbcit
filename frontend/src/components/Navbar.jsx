import React, { useState } from "react";
import { Bell, User, LogOut, GraduationCap, LayoutDashboard, ClipboardList, ImagePlus } from "lucide-react";

const Navbar = ({
  username = "Guest",
  role = "Student",
  activeSection = "dashboard",
  onLogout,
  notifications = 0,
  onNavigate,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", key: "dashboard", icon: LayoutDashboard },
    { name: "Attendance", key: "attendance", icon: ClipboardList },
    { name: "Event Gallery", key: "gallery", icon: ImagePlus },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8 max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="text-indigo-600">
            <GraduationCap size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">BBCIT</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Dashboard</p>
          </div>
        </div>

        {/* Center: Navigation Menu */}
        <div className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-6">


          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
              className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-slate-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">{username}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{role}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate?.("profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <User size={16} />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate?.("settings");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <span>⚙️</span>
                  Settings
                </button>
                <hr className="my-2" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                 
                  <LogOut size={12} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
