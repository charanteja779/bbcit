import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import EventGallery from "./EventGallery";
import { Pencil, Save, Trash2, X } from "lucide-react";

const DEFAULT_SECTION = "dashboard";
const VALID_SECTIONS = new Set(["dashboard", "attendance", "students", "view-students", "admin-add-student", "admin-add-faculty", "admin-view-students", "admin-view-faculty", "gallery", "profile", "settings"]);

const SECTION_TITLES = {
  dashboard: { student: "Student Dashboard", faculty: "Faculty Dashboard", admin: "Admin Dashboard" },
  attendance: { student: "Attendance", faculty: "Attendance", admin: "Attendance" },
  students: { faculty: "Add Student" },
  "view-students": { faculty: "View Students" },
  "admin-add-student": { admin: "Add Student" },
  "admin-add-faculty": { admin: "Add Faculty" },
  "admin-view-students": { admin: "View Students" },
  "admin-view-faculty": { admin: "View Faculty" },
  gallery: { student: "Event Gallery", faculty: "Event Gallery", admin: "Event Gallery" },
  profile: { student: "Profile", faculty: "Profile", admin: "Profile" },
  settings: { student: "Settings", faculty: "Settings", admin: "Settings" },
};

const DashboardLayout = ({ user = {}, role = "student", onLogout = () => {} }) => {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeSection = VALID_SECTIONS.has(section) ? section : DEFAULT_SECTION;
  const normalizedRole = String(role || "student");
  const formattedRole = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);

  const pageTitle = useMemo(() => {
    return SECTION_TITLES[activeSection]?.[normalizedRole] || SECTION_TITLES.dashboard[normalizedRole] || "Dashboard";
  }, [activeSection, normalizedRole]);

  const handleNavigate = (nextSection) => {
    const next = VALID_SECTIONS.has(nextSection) ? nextSection : DEFAULT_SECTION;
    navigate(next === DEFAULT_SECTION ? "/dashboard" : `/dashboard/${next}`);
  };

  const renderContent = () => {
    if (activeSection === "attendance") {
      if (normalizedRole === "admin" || normalizedRole === "faculty") {
        return <FacultyDashboard user={user} section="attendance" />;
      }
      return <StudentDashboard user={user} onNavigate={handleNavigate} section="attendance" />;
    }

    if (activeSection === "students" && normalizedRole === "faculty") {
      return <FacultyDashboard user={user} section="students" />;
    }

    if (activeSection === "view-students" && normalizedRole === "faculty") {
      return <FacultyDashboard user={user} section="view-students" />;
    }

    if (normalizedRole === "admin" && activeSection.startsWith("admin-")) {
      return <AdminDashboard section={activeSection} onOpenSettings={() => handleNavigate("settings")} />;
    }

    if (activeSection === "gallery") {
      return <EventGallery user={user} role={normalizedRole} />;
    }

    if (activeSection === "profile") {
      return <ProfileCard user={user} role={normalizedRole} onOpenSettings={() => handleNavigate("settings")} />;
    }

    if (activeSection === "settings") {
      return <SettingsCard role={normalizedRole} onBack={() => handleNavigate("dashboard")} />;
    }

    if (normalizedRole === "admin") {
      return <AdminDashboard section="dashboard" onOpenSettings={() => handleNavigate("settings")} />;
    }

    return normalizedRole === "faculty" ? (
      <FacultyDashboard user={user} section="dashboard" />
    ) : (
      <StudentDashboard user={user} onNavigate={handleNavigate} section="dashboard" />
    );
  };

  return (
    <div className="portal-shell flex flex-col min-h-screen">
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
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{formattedRole}</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{pageTitle}</h1>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

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

function AdminDashboard({ section, onOpenSettings }) {
  const [records, setRecords] = useState({ students: [], faculty: [] });
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { adminAPI } = await import("../services/api");
      const response = await adminAPI.getRecords();
      setRecords({ students: response.data.students || [], faculty: response.data.faculty || [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (section === "dashboard" || section.includes("view")) loadRecords();
  }, [section]);

  if (section === "admin-add-student") {
    return <AdminEntryCard role="student" onComplete={loadRecords} />;
  }

  if (section === "admin-add-faculty") {
    return <AdminEntryCard role="faculty" onComplete={loadRecords} />;
  }

  if (section === "admin-view-students") {
    return <AdminRecordsPanel title="View Students" records={records.students} student onRecordsChanged={loadRecords} loading={loading} />;
  }

  if (section === "admin-view-faculty") {
    return <AdminRecordsPanel title="View Faculty" records={records.faculty} onRecordsChanged={loadRecords} loading={loading} />;
  }

  const yearTotals = ["1st Year", "2nd Year", "3rd Year"].map((year) => ({
    year,
    count: records.students.filter((student) => student.year === year).length,
    branches: [...new Set(records.students.filter((student) => student.year === year).map((student) => student.branch || student.course).filter(Boolean))].map((branch) => ({
      branch,
      count: records.students.filter((student) => student.year === year && (student.branch || student.course) === branch).length,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStat label="Total Students" value={records.students.length} />
        <AdminStat label="Total Faculty" value={records.faculty.length} />
        <AdminStat label="Total Accounts" value={records.students.length + records.faculty.length} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div><h2 className="text-xl font-bold text-slate-900">Student distribution</h2><p className="text-sm text-slate-500 mt-1">Students grouped by academic year and branch.</p></div>
          <button type="button" onClick={loadRecords} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Refresh</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yearTotals.map((entry) => <div key={entry.year} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between font-bold text-slate-800"><span>{entry.year}</span><span>{entry.count}</span></div><div className="mt-3 space-y-2">{entry.branches.length ? entry.branches.map((branch) => <div key={branch.branch} className="flex justify-between text-sm text-slate-600"><span>{branch.branch}</span><span className="font-semibold">{branch.count}</span></div>) : <p className="text-sm text-slate-400">No students</p>}</div></div>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={onOpenSettings} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Open Settings</button></div>
    </div>
  );
}

function AdminStat({ label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p></div>;
}

function AdminEntryCard({ role, onComplete }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", rollNo: "", branch: "Statistics", year: "1st Year", section: "A", subject: "", department: "Academics" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const { authAPI, adminAPI } = await import("../services/api");
      if (file) {
        const response = await adminAPI.importRecords(file, role);
        setMessage(`${response.data.totals?.imported || 0} ${role} record(s) imported.`);
        setFile(null); event.target.reset();
      } else {
        await authAPI.createUser({ ...form, role, facultyYear: form.year, course: form.branch });
        setMessage(`${role === "student" ? "Student" : "Faculty"} added successfully.`);
        setForm((current) => ({ ...current, username: "", email: "", password: "", rollNo: "", subject: "" }));
      }
      await onComplete?.();
    } catch (requestError) { setError(requestError.response?.data?.message || "Failed to save record."); } finally { setSaving(false); }
  };

  return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7"><h2 className="text-2xl font-bold text-slate-900">Add {role === "student" ? "Student" : "Faculty"}</h2><p className="text-sm text-slate-500 mt-1">Create one account or upload a CSV/Excel file for multiple records.</p><form onSubmit={submit} className="mt-6 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="username" value={form.username} onChange={update} placeholder={`${role === "student" ? "Student" : "Faculty"} name`} className="admin-input" /><input type="email" name="email" value={form.email} onChange={update} placeholder="Email" className="admin-input" /><input name="password" value={form.password} onChange={update} placeholder="Password (optional)" className="admin-input" /></div>{role === "student" ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="rollNo" value={form.rollNo} onChange={update} placeholder="Roll number" className="admin-input" /><AdminSelect name="branch" value={form.branch} onChange={update} options={["Statistics", "Data Science", "Electronics", "AI & ML"]} /><AdminSelect name="year" value={form.year} onChange={update} options={["1st Year", "2nd Year", "3rd Year"]} /><AdminSelect name="section" value={form.section} onChange={update} options={["A", "B", "C", "D"]} /></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="branch" value={form.branch} onChange={update} placeholder="Branch" className="admin-input" /><AdminSelect name="year" value={form.year} onChange={update} options={["1st Year", "2nd Year", "3rd Year"]} /><input name="subject" value={form.subject} onChange={update} placeholder="Subject" className="admin-input" /></div>}<div className="border-t border-slate-100 pt-4"><label className="block text-sm font-semibold text-slate-700 mb-2">Or upload multiple {role} records</label><input type="file" accept=".csv,.xls,.xlsx" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>{error && <p className="text-sm text-red-600">{error}</p>}{message && <p className="text-sm text-emerald-600">{message}</p>}<button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : file ? "Import records" : `Add ${role}`}</button></form></div>;
}

function AdminSelect({ name, value, onChange, options }) {
  return <select name={name} value={value} onChange={onChange} className="admin-input">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}

function AdminRecordsPanel({ title, records, student = false, onRecordsChanged, loading }) {
  return <div className="space-y-4"><div><h2 className="text-2xl font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500 mt-1">Choose filters to view and manage records.</p></div>{loading ? <div className="rounded-xl bg-white p-6 text-sm text-slate-500">Loading records...</div> : <RecordTable title={title} records={records} student={student} onRecordsChanged={onRecordsChanged} />}</div>;
}

function AdminManagementCard({ user, onOpenSettings }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "faculty",
    password: "",
    rollNo: "",
    branch: "Statistics",
    year: "1st Year",
    section: "A",
    subject: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [importRole, setImportRole] = useState("student");
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [records, setRecords] = useState({ students: [], faculty: [] });
  const [loadingRecords, setLoadingRecords] = useState(true);

  const loadRecords = async () => {
    setLoadingRecords(true);
    try {
      const { adminAPI } = await import("../services/api");
      const response = await adminAPI.getRecords();
      setRecords({
        students: response.data.students || [],
        faculty: response.data.faculty || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load imported records.");
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.username || !form.email) {
      setError("Name and email are required.");
      return;
    }

    if (form.role === "student" && (!form.rollNo || !form.branch || !form.year || !form.section)) {
      setError("Roll number, branch, year, and section are required for students.");
      return;
    }

    if (form.role === "faculty" && !form.subject) {
      setError("Subject is required for faculty accounts.");
      return;
    }

    setSaving(true);

    try {
      const { authAPI } = await import("../services/api");
      const payload = {
        username: form.username,
        email: form.email,
        role: form.role,
        password: form.password || "Admin@123",
        ...(form.role === "student"
          ? {
              rollNo: form.rollNo,
              branch: form.branch,
              year: form.year,
              section: form.section,
              course: form.branch,
            }
          : {
              subject: form.subject,
              department: "Academics",
            }),
      };

      await authAPI.createUser(payload);
      setMessage(`${form.role === "faculty" ? "Faculty" : "Student"} added successfully.`);
      await loadRecords();
      setForm({
        username: "",
        email: "",
        role: form.role,
        password: "",
        rollNo: "",
        branch: "Statistics",
        year: "1st Year",
        section: "A",
        subject: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user.");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!importFile) {
      setError("Choose a CSV or Excel file first.");
      return;
    }

    setImporting(true);
    try {
      const { adminAPI } = await import("../services/api");
      const response = await adminAPI.importRecords(importFile, importRole);
      const totals = response.data.totals || {};
      setMessage(`${totals.imported || 0} ${importRole} record(s) imported; ${totals.skipped || 0} skipped.`);
      setImportFile(null);
      event.target.reset();
      await loadRecords();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-indigo-500 font-bold">Admin</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">Manage Users</h2>
          <p className="text-slate-500 mt-2">Create faculty and student accounts from the admin dashboard.</p>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={form.role === "student" ? "Student name" : "Faculty name"}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
            <input
              type="text"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Optional password (default: Admin@123)"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {form.role === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="rollNo"
                value={form.rollNo}
                onChange={handleChange}
                placeholder="Roll number"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Statistics">Statistics</option>
                <option value="Data Science">Data Science</option>
                <option value="Electronics">Electronics</option>
                <option value="AI & ML">AI &amp; ML</option>
              </select>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
              </select>
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          )}

          {form.role === "faculty" && (
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-emerald-600">{message}</div>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : `Add ${form.role === "faculty" ? "Faculty" : "Student"}`}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Open Settings
          </button>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
            Default admin login: Admin Hod / Admin@123
          </div>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-500 font-bold">Bulk import</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Upload student or faculty records</h2>
            <p className="text-sm text-slate-500 mt-2">Accepted: CSV, XLS, and XLSX. Required columns are name and email; students also need rollNo.</p>
          </div>
          <form onSubmit={handleImport} className="flex min-w-0 flex-col sm:flex-row gap-3 lg:w-full lg:max-w-2xl">
            <select value={importRole} onChange={(event) => setImportRole(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
              <option value="student">Student file</option>
              <option value="faculty">Faculty file</option>
            </select>
            <input type="file" accept=".csv,.xls,.xlsx" onChange={(event) => setImportFile(event.target.files?.[0] || null)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:font-semibold file:text-indigo-700" />
            <button type="submit" disabled={importing} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
              {importing ? "Importing..." : "Import file"}
            </button>
          </form>
        </div>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Current records</h3>
            <p className="text-sm text-slate-500">Imported accounts appear here after refresh.</p>
          </div>
          <button type="button" onClick={loadRecords} disabled={loadingRecords} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {loadingRecords ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <RecordTable title="Students" records={records.students} student onRecordsChanged={loadRecords} />
          <RecordTable title="Faculty" records={records.faculty} onRecordsChanged={loadRecords} />
        </div>
      </div>
    </div>
  );
}

function RecordTable({ title, records, student = false, onRecordsChanged }) {
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const branches = [...new Set(records.map((record) => student ? (record.branch || record.course) : (record.branch || record.department)).filter(Boolean))].sort();
  const filteredRecords = records.filter((record) => {
    const matchesBranch = !branch || (student ? (record.branch || record.course) : (record.branch || record.department)) === branch;
    const matchesYear = !year || record.year === year;
    const matchesSection = !section || record.section === section;
    return matchesBranch && matchesYear && matchesSection;
  });
  const hasFilters = Boolean(branch || year || section);

  const startEditing = (record) => {
    setActionError("");
    setEditing(record.id);
    setEditForm({
      username: record.name || "",
      email: record.email || "",
      rollNo: record.rollNo || "",
      branch: record.branch || record.course || "",
      year: record.year || "",
      section: record.section || "",
      department: record.department || "",
      subject: record.subject || "",
    });
  };

  const saveRecord = async () => {
    setSaving(true);
    setActionError("");
    try {
      const { adminAPI } = await import("../services/api");
      await adminAPI.updateRecord(student ? "student" : "faculty", editing, editForm);
      setEditing(null);
      await onRecordsChanged();
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to update record.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record) => {
    if (!window.confirm(`Delete ${record.name || "this record"}?`)) return;
    setActionError("");
    try {
      const { adminAPI } = await import("../services/api");
      await adminAPI.deleteRecord(student ? "student" : "faculty", record.id);
      await onRecordsChanged();
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to delete record.");
    }
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
        <div className="font-bold text-slate-800">{title} ({filteredRecords.length})</div>
        <div className="flex flex-wrap gap-2">
          <select value={branch} onChange={(event) => setBranch(event.target.value)} className="max-w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
            <option value="">All Branches</option>
            {branches.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
            <option value="">All Years</option>
            {['1st Year', '2nd Year', '3rd Year'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {student && (
            <>
              <select value={section} onChange={(event) => setSection(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
                <option value="">All Sections</option>
                {['A', 'B', 'C', 'D'].map((value) => <option key={value} value={value}>Section {value}</option>)}
              </select>
            </>
          )}
        </div>
      </div>
      {actionError && <div className="px-4 py-2 text-xs text-red-700 bg-red-50">{actionError}</div>}
      <div className="max-h-80 overflow-auto">
        {!hasFilters ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">Select a branch and year{student ? ", then section" : ""} to view details.</p>
        ) : filteredRecords.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No records found.</p>
        ) : (
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">{student ? "Roll / Class" : "Department / Subject"}</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  {editing === record.id ? (
                    <>
                      <td className="px-4 py-3"><input value={editForm.username} onChange={(event) => setEditForm({ ...editForm, username: event.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 text-xs" /></td>
                      <td className="px-4 py-3"><input value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 text-xs" /></td>
                      <td className="px-4 py-3">
                        <input value={student ? editForm.rollNo : editForm.branch} onChange={(event) => setEditForm({ ...editForm, [student ? "rollNo" : "branch"]: event.target.value, ...(!student ? { department: event.target.value } : {}) })} placeholder={student ? "Roll number" : "Branch"} className="mb-1 w-full rounded border border-slate-300 px-2 py-1 text-xs" />
                        {student ? <div className="flex gap-1"><input value={editForm.branch} onChange={(event) => setEditForm({ ...editForm, branch: event.target.value, course: event.target.value })} placeholder="Branch" className="w-1/3 rounded border border-slate-300 px-2 py-1 text-xs" /><input value={editForm.year} onChange={(event) => setEditForm({ ...editForm, year: event.target.value })} placeholder="Year" className="w-1/3 rounded border border-slate-300 px-2 py-1 text-xs" /><input value={editForm.section} onChange={(event) => setEditForm({ ...editForm, section: event.target.value })} placeholder="Section" className="w-1/3 rounded border border-slate-300 px-2 py-1 text-xs" /></div> : <div className="flex gap-1"><input value={editForm.year} onChange={(event) => setEditForm({ ...editForm, year: event.target.value })} placeholder="Year" className="w-1/2 rounded border border-slate-300 px-2 py-1 text-xs" /><input value={editForm.subject} onChange={(event) => setEditForm({ ...editForm, subject: event.target.value })} placeholder="Subject" className="w-1/2 rounded border border-slate-300 px-2 py-1 text-xs" /></div>}
                      </td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" disabled={saving} onClick={saveRecord} className="rounded bg-emerald-100 p-1.5 text-emerald-700"><Save size={15} /></button><button type="button" onClick={() => setEditing(null)} className="rounded bg-slate-100 p-1.5 text-slate-700"><X size={15} /></button></div></td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold text-slate-800">{record.name}</td>
                      <td className="break-words px-4 py-3 text-slate-500">{record.email}</td>
                      <td className="break-words px-4 py-3 text-slate-500">{student ? `${record.rollNo || "-"} / ${record.branch || record.course || "-"} / ${record.year || "-"} ${record.section || ""}` : `${record.branch || record.department || "-"} / ${record.year || "-"} / ${record.subject || "-"}`}</td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" title="Edit" onClick={() => startEditing(record)} className="rounded bg-amber-50 p-1.5 text-amber-700"><Pencil size={15} /></button><button type="button" title="Delete" onClick={() => deleteRecord(record)} className="rounded bg-rose-50 p-1.5 text-rose-700"><Trash2 size={15} /></button></div></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SettingsCard({ role, onBack }) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [compactMode, setCompactMode] = useState(role === "faculty");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    role: "faculty",
    password: "",
    rollNo: "",
    branch: "Statistics",
    year: "1st Year",
    section: "A",
    subject: "",
  });
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);

    try {
      const { authAPI } = await import("../services/api");
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage("Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminMessage("");

    if (!adminForm.username || !adminForm.email) {
      setAdminError("Name and email are required.");
      return;
    }

    if (adminForm.role === "student" && (!adminForm.rollNo || !adminForm.branch || !adminForm.year || !adminForm.section)) {
      setAdminError("Roll number, branch, year, and section are required for students.");
      return;
    }

    if (adminForm.role === "faculty" && !adminForm.subject) {
      setAdminError("Subject is required for faculty accounts.");
      return;
    }

    setAdminSaving(true);

    try {
      const { authAPI } = await import("../services/api");
      const payload = {
        username: adminForm.username,
        email: adminForm.email,
        role: adminForm.role,
        password: adminForm.password || "Admin@123",
        ...(adminForm.role === "student"
          ? {
              rollNo: adminForm.rollNo,
              branch: adminForm.branch,
              year: adminForm.year,
              section: adminForm.section,
              course: adminForm.branch,
            }
          : {
              subject: adminForm.subject,
              department: "Academics",
            }),
      };

      await authAPI.createUser(payload);
      setAdminMessage(`${adminForm.role === "faculty" ? "Faculty" : "Student"} added successfully.`);
      setAdminForm({
        username: "",
        email: "",
        role: adminForm.role,
        password: "",
        rollNo: "",
        branch: "Statistics",
        year: "1st Year",
        section: "A",
        subject: "",
      });
    } catch (err) {
      setAdminError(err.response?.data?.message || "Failed to add user.");
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Settings</h2>
        <p className="text-slate-500 font-medium">Control notifications, density, and account security for everyone.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ToggleCard label="Email alerts" description="Receive important academic updates by email." checked={emailAlerts} onChange={setEmailAlerts} />
        <ToggleCard label="Push notifications" description="Show quick alerts in the dashboard header." checked={pushAlerts} onChange={setPushAlerts} />
        <ToggleCard label="Compact mode" description="Tighter cards and spacing for dense dashboards." checked={compactMode} onChange={setCompactMode} />
      </div>

      {role === "admin" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <h3 className="text-xl font-bold text-slate-900">Admin User Manager</h3>
          <p className="text-sm text-slate-600 mt-1">Add faculty and student accounts from here.</p>
          <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="username"
                value={adminForm.username}
                onChange={handleAdminChange}
                placeholder={adminForm.role === "student" ? "Student name" : "Faculty name"}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={adminForm.email}
                onChange={handleAdminChange}
                placeholder="Email address"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="role"
                value={adminForm.role}
                onChange={handleAdminChange}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
              <input
                type="text"
                name="password"
                value={adminForm.password}
                onChange={handleAdminChange}
                placeholder="Optional password (default: Admin@123)"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {adminForm.role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="rollNo"
                  value={adminForm.rollNo}
                  onChange={handleAdminChange}
                  placeholder="Roll number"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <select
                  name="branch"
                  value={adminForm.branch}
                  onChange={handleAdminChange}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Statistics">Statistics</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="AI & ML">AI &amp; ML</option>
                </select>
                <select
                  name="year"
                  value={adminForm.year}
                  onChange={handleAdminChange}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                </select>
                <select
                  name="section"
                  value={adminForm.section}
                  onChange={handleAdminChange}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            )}

            {adminForm.role === "faculty" && (
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="subject"
                  value={adminForm.subject}
                  onChange={handleAdminChange}
                  placeholder="Subject"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
            {adminError && <div className="text-sm text-red-600">{adminError}</div>}
            {adminMessage && <div className="text-sm text-emerald-600">{adminMessage}</div>}
            <button
              type="submit"
              disabled={adminSaving}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {adminSaving ? "Saving..." : `Add ${adminForm.role === "faculty" ? "Faculty" : "Student"}`}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Password & Account Security</h3>
            <p className="text-sm text-slate-500">Change password for student, faculty, and admin accounts.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowChangePassword((prev) => !prev)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            {showChangePassword ? "Hide" : "Change Password"}
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Current password"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="New password"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-emerald-600">{message}</div>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-white font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
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