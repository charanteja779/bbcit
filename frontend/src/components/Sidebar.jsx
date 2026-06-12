import React from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Image,
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, onLogout, role }) => {
  const menus = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Attendance", icon: ClipboardCheck },
    { name: "Event Gallery", icon: Image },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

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
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">BBCIT</h2>
          <button onClick={onClose} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menus.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100"
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;