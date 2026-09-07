import React, { useState } from "react";
import { User, Users, LogOut, GraduationCap, LayoutDashboard, ClipboardList, ImagePlus, Settings2, Menu, X, UserPlus, UserRoundPlus, UserRoundSearch } from "lucide-react";

const Navbar = ({
  username = "Guest",
  role = "Student",
  activeSection = "dashboard",
  onLogout,
  notifications = 0,
  onNavigate,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", key: "dashboard", icon: LayoutDashboard },
    { name: "Attendance", key: "attendance", icon: ClipboardList },
    { name: "Event Gallery", key: "gallery", icon: ImagePlus },
    ...(role.toLowerCase() === "admin"
      ? [
          { name: "Add Student", key: "admin-add-student", icon: UserPlus },
          { name: "Add Faculty", key: "admin-add-faculty", icon: UserRoundPlus },
          { name: "View Students", key: "admin-view-students", icon: UserRoundSearch },
          { name: "View Faculty", key: "admin-view-faculty", icon: Users },
        ]
      : []),
    ...(role.toLowerCase() === "faculty"
      ? [
          { name: "Add Student", key: "students", icon: UserPlus },
          { name: "View Students", key: "view-students", icon: Users },
        ]
      : []),
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-[0_4px_18px_rgba(25,20,50,0.06)]">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8 max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="text-violet-700 bg-violet-100 p-2 rounded-xl">
            <GraduationCap size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-950 tracking-tight leading-none">BBCIT</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Academic portal</p>
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
                    ? "bg-violet-100 text-violet-800" 
                    : "text-slate-500 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} className={isActive ? "text-violet-700" : "text-slate-400"} />
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>


          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
              className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 bg-violet-100 border border-violet-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-violet-700" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-none">{username}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{role}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#151022] border border-violet-300/15 rounded-xl shadow-2xl py-2 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate?.("profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-violet-500/15 flex items-center gap-2 transition-colors"
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
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-violet-500/15 flex items-center gap-2 transition-colors"
                >
                  <Settings2 size={16} />
                  Settings
                </button>
                <hr className="my-2 border-violet-300/10" />
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

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(item.key);
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  isActive ? "bg-violet-100 text-violet-800" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={17} />
                {item.name}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
