import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import EventGallery from "./EventGallery";

const DEFAULT_SECTION = "dashboard";

const SECTION_TITLES = {
    dashboard: { student: "Student Dashboard", faculty: "Faculty Dashboard" },
    attendance: { student: "Attendance", faculty: "Attendance" },
    gallery: { student: "Event Gallery", faculty: "Event Gallery" },
    profile: { student: "Profile", faculty: "Profile" },
    settings: { student: "Settings", faculty: "Settings" },
};

const VALID_SECTIONS = new Set(["dashboard", "attendance", "gallery", "profile", "settings"]);

const DashboardLayout = ({
    user = {},
    role = "student",
    onLogout = () => { },
}) => {
    const navigate = useNavigate();
    const { section } = useParams();

    const activeSection = VALID_SECTIONS.has(section) ? section : DEFAULT_SECTION;

    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    const pageTitle = useMemo(() => {
        return SECTION_TITLES[activeSection]?.[role] || SECTION_TITLES.dashboard[role] || "Dashboard";
    }, [activeSection, role]);

    const handleNavigate = (nextSection) => {
        const next = VALID_SECTIONS.has(nextSection) ? nextSection : DEFAULT_SECTION;
        navigate(next === DEFAULT_SECTION ? "/dashboard" : `/dashboard/${next}`);
    };

    const renderContent = () => {
        if (activeSection === "attendance") {
            return role === "faculty" ? (
                <FacultyDashboard user={user} section="attendance" />
            ) : (
                <StudentDashboard user={user} onNavigate={handleNavigate} section="attendance" />
            );
        }

        if (activeSection === "gallery") {
            return <EventGallery user={user} role={role} />;
        }

        if (activeSection === "profile") {
            return <ProfileCard user={user} role={role} onOpenSettings={() => handleNavigate("settings")} />;
        }

        if (activeSection === "settings") {
            return <SettingsCard role={role} onBack={() => handleNavigate("dashboard")} />;
        }

        return role === "faculty" ? (
            <FacultyDashboard user={user} section="dashboard" />
        ) : (
            <StudentDashboard user={user} onNavigate={handleNavigate} section="dashboard" />
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar
                username={user?.username || user?.name || "User"}
                role={formattedRole}
                activeSection={activeSection}
                onLogout={onLogout}
                onNavigate={handleNavigate}
                notifications={3}
            />

            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="max-w-7xl mx-auto w-full">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

function SectionCard({
    title,
    description,
    primaryActionLabel,
    secondaryActionLabel,
    onPrimaryAction,
    onSecondaryAction,
    accent = "gallery",
}) {
    const gradient = accent === "gallery"
        ? "from-cyan-500 via-blue-500 to-indigo-500"
        : "from-purple-500 via-pink-500 to-rose-500";

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-6">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{title}</h2>
                <p className="text-slate-500 max-w-2xl">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={onPrimaryAction}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-left hover:bg-gray-100 transition-colors"
                >
                    <div className="font-semibold text-gray-900">{primaryActionLabel}</div>
                    <div className="text-sm text-gray-600">Move to the profile page and review your account details.</div>
                </button>
                <button
                    type="button"
                    onClick={onSecondaryAction}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-left hover:bg-gray-100 transition-colors"
                >
                    <div className="font-semibold text-gray-900">{secondaryActionLabel}</div>
                    <div className="text-sm text-gray-600">Open settings to update preferences and dashboard behavior.</div>
                </button>
            </div>
        </div>
    );
}

function ProfileCard({ user, role, onOpenSettings }) {
    const displayName = user?.username || user?.name || "User";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-6">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Profile</p>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{displayName}</h2>
                    <p className="text-slate-500 mt-2 font-medium">{role}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard label="Name" value={displayName} />
                    <DetailCard label="Email" value={user?.email || "Not available"} />
                    <DetailCard label="Role" value={role} />
                    <DetailCard label="User ID" value={user?.id || "Not available"} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Open Settings
                </button>
                <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                    Profile data is pulled from the authenticated user object, so name and role stay aligned after login.
                </div>
            </div>
        </div>
    );
}

function SettingsCard({ role, onBack }) {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(false);
    const [compactMode, setCompactMode] = useState(role === "faculty");

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-6">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Settings</h2>
                <p className="text-slate-500 font-medium">Control notifications, density, and dashboard behavior.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ToggleCard label="Email alerts" description="Receive important academic updates by email." checked={emailAlerts} onChange={setEmailAlerts} />
                <ToggleCard label="Push notifications" description="Show quick alerts in the dashboard header." checked={pushAlerts} onChange={setPushAlerts} />
                <ToggleCard label="Compact mode" description="Tighter cards and spacing for dense dashboards." checked={compactMode} onChange={setCompactMode} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back to Dashboard
                </button>
                <button
                    type="button"
                    className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-black transition-colors"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
}

function ToggleCard({ label, description, checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`rounded-2xl border p-4 text-left transition-all ${checked ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600 mt-1">{description}</div>
                </div>
                <div className={`h-6 w-11 rounded-full p-1 transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
                </div>
            </div>
        </button>
    );
}

function DetailCard({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-2 font-semibold text-gray-900 break-words">{value}</p>
        </div>
    );
}

export default DashboardLayout;