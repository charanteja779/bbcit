import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";


const DashboardLayout = ({
    user = {},
    role = "student",
    onLogout = () => { },
}) => {

    console.log("USER:", user);
    console.log("ROLE:", role);
    
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const formattedRole =
        role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <div className="flex h-screen bg-gray-50">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={onLogout}
                role={role}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar
                    username={user?.name || "User"}
                    role={formattedRole}
                    onLogout={onLogout}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                    notifications={3}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {role === "faculty" ? (
                            <FacultyDashboard user={user} />
                        ) : (
                            <StudentDashboard user={user} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;