import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Image,
  User,
  Settings,
  LogOut,
  X,
  GraduationCap,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, onLogout, role, activeSection = "dashboard", onNavigate }) => {
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { name: "Attendance", icon: ClipboardCheck, key: "attendance" },
    { name: "Event Gallery", icon: Image, key: "gallery" },
    { name: "Profile", icon: User, key: "profile" },
    { name: "Settings", icon: Settings, key: "settings" },
  ];

  const handleNavigate = (key) => {
    if (onNavigate) {
      onNavigate(key);
    } else {
      navigate(key === "dashboard" ? "/dashboard" : `/dashboard/${key}`);
    }
    onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="text-indigo-600">
              <GraduationCap size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">BBCIT</h2>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menus.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left font-medium text-sm ${activeSection === item.key ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon size={18} className={activeSection === item.key ? "text-indigo-600" : "text-slate-400"} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <User size={18} className="text-slate-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {role === "faculty" ? "Faculty Member" : "Student"}
              </p>
              <p className="text-xs text-slate-500 capitalize">{role || "User"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose?.();
              onLogout?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;