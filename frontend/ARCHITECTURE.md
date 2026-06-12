# 📊 Dashboard Architecture & System Design

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend App                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                        App.jsx                           │  │
│  │  ├─ Router (React Router DOM)                           │  │
│  │  └─ AppLayout Component                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    ┌─────────▼──────────┐                       │
│                    │   DashboardLayout  │                       │
│                    │  (Main Wrapper)    │                       │
│                    └─────────┬──────────┘                       │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│    ┌────▼────┐        ┌─────▼──────┐      ┌─────▼──────┐      │
│    │  Navbar │        │  Sidebar   │      │   Content  │      │
│    │         │        │            │      │   Router   │      │
│    └─────────┘        └────────────┘      │            │      │
│                                           │   Role     │      │
│                                           │   Check    │      │
│                                           │            │      │
│                                ┌──────────┴────────────┘       │
│                                │                               │
│                ┌───────────────┴─────────────────┐             │
│                │                                 │             │
│        ┌───────▼───────────┐           ┌────────▼────────┐    │
│        │ StudentDashboard  │           │ FacultyDashboard│    │
│        │                   │           │                 │    │
│        │ ┌─────────────┐   │           │ ┌───────────┐   │    │
│        │ │WelcomeCard  │   │           │ │Selectors  │   │    │
│        │ ├─────────────┤   │           │ ├───────────┤   │    │
│        │ │StatCard(x4) │   │           │ │AttendanceT│   │    │
│        │ ├─────────────┤   │           │ ├───────────┤   │    │
│        │ │LineChart    │   │           │ │Summary    │   │    │
│        │ ├─────────────┤   │           │ ├───────────┤   │    │
│        │ │Events List  │   │           │ │Records    │   │    │
│        │ ├─────────────┤   │           │ └───────────┘   │    │
│        │ │Quick Actions│   │           │                 │    │
│        │ └─────────────┘   │           └─────────────────┘    │
│        └───────────────────┘                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────▼──────────────┐
                │   API Service Layer        │
                │  (services/api.js)         │
                │                            │
                │ ├─ studentAPI              │
                │ ├─ facultyAPI              │
                │ ├─ userAPI                 │
                │ └─ authAPI                 │
                │                            │
                │ ┌─ Axios Interceptors      │
                │ └─ Error Handling          │
                └─────────────┬──────────────┘
                              │
                ┌─────────────▼──────────────┐
                │   Backend API Server       │
                │   (Node.js/Express)        │
                │                            │
                │ ├─ /api/student/*          │
                │ ├─ /api/faculty/*          │
                │ ├─ /api/user/*             │
                │ └─ /api/auth/*             │
                │                            │
                │ Database: MongoDB          │
                └────────────────────────────┘
```

---

## Component Hierarchy

```
DashboardLayout (Main Container)
│
├── Navbar (Top Bar)
│   ├── Logo + Title
│   ├── Menu Toggle (Mobile)
│   ├── Notifications Bell
│   ├── Profile Avatar
│   │   └── Profile Dropdown
│   │       ├── View Profile
│   │       ├── Settings
│   │       └── Logout
│   └── Username + Role
│
├── Sidebar (Navigation)
│   ├── Menu Title + Role Display
│   ├── Menu Items
│   │   ├── Dashboard (Icon + Label)
│   │   ├── Attendance
│   │   ├── Event Gallery
│   │   ├── View Photos
│   │   ├── Profile
│   │   ├── Settings (Expandable)
│   │   │   ├── Account Settings
│   │   │   ├── Notifications
│   │   │   └── Privacy
│   │   ├── Help & Support (Expandable)
│   │   │   ├── FAQ
│   │   │   ├── Contact Support
│   │   │   └── Documentation
│   │   └── Logout
│   └── Animations + Active States
│
└── Main Content Area
    ├── Role Detection
    │
    ├─── IF Role === "Student"
    │    │
    │    └── StudentDashboard
    │        ├── Welcome Card
    │        │   └── Personalized greeting
    │        ├── Stats Section
    │        │   ├── StatCard (Attendance)
    │        │   ├── StatCard (Events)
    │        │   ├── StatCard (Photos)
    │        │   └── StatCard (Notices)
    │        ├── Attendance Overview
    │        │   └── LineChart (Recharts)
    │        ├── Recent Events
    │        │   ├── Event Item (x3)
    │        │   └── Arrow Icon
    │        └── Quick Actions
    │            ├── View Attendance Button
    │            ├── View Events Button
    │            └── View Photos Button
    │
    └─── IF Role === "Faculty"
         │
         └── FacultyDashboard
             ├── Welcome Card
             │   └── Faculty name
             ├── Selectors
             │   ├── Class Dropdown
             │   └── Subject Dropdown
             ├── AttendanceTable
             │   ├── Summary Cards
             │   │   ├── Total Students
             │   │   ├── Present Count
             │   │   └── Absent Count
             │   ├── Student Table
             │   │   ├── Headers (Roll, Name, Status)
             │   │   ├── Student Rows
             │   │   │   ├── Toggle Present/Absent
             │   │   │   └── Status Badge
             │   │   └── Submit Button
             │   │
             │   └── Summary Stats
             │       ├── Card (Total Students)
             │       ├── Card (Avg Attendance)
             │       └── Card (Records Count)
             │
             └── Previous Records
                 └── Records Table
                     ├── Date
                     ├── Total
                     ├── Present
                     ├── Absent
                     └── Percentage
```

---

## Data Flow Diagram

```
User Action (Click/Type)
        │
        ▼
Component Event Handler
        │
        ├─► State Update (useState)
        │       │
        │       ▼
        │   Re-render Component
        │
        └─► API Call (axios)
                │
                ├─► Request Interceptor
                │   └─► Add Auth Token
                │
                ▼
           Backend API
                │
                ├─► Process Request
                ├─► Database Query
                └─► Send Response
                │
                ▼
        Response Interceptor
                │
                ├─► Check Status
                ├─► Error Handling
                │
                ▼
        Component State Update
                │
                ▼
        Re-render with New Data
                │
                ▼
        Display to User
```

---

## State Management Flow

```
DashboardLayout
├── State: sidebarOpen
│   └─► Sidebar.isOpen & Navbar.onToggleSidebar
│
App/AppLayout
├── State: user (from localStorage)
├── State: token (from localStorage)
│
StudentDashboard
├── State: attendanceData (from API)
├── State: stats (from API)
├── State: recentEvents (from API)
├── State: loading
│
FacultyDashboard
├── State: selectedClass
├── State: selectedSubject
├── State: students (from API)
├── State: attendance (local)
├── State: attendanceRecords (from API)
├── State: loading
├── State: submitting
│
AttendanceTable
├── State: attendance (local object)
│
Sidebar
├── State: expandedMenu
│
Navbar
├── State: profileOpen
```

---

## API Request/Response Patterns

```
REQUEST:
┌──────────────────────────────┐
│ GET /api/student/attendance  │
│ Authorization: Bearer TOKEN  │
└──────────────────────────────┘
        │
        ▼
PROCESSING:
┌──────────────────────────────┐
│ Backend Handler              │
│ ├─ Verify Token              │
│ ├─ Check User Role           │
│ ├─ Query Database            │
│ └─ Format Response           │
└──────────────────────────────┘
        │
        ▼
RESPONSE:
┌──────────────────────────────┐
│ 200 OK                       │
│ {                            │
│   "success": true,           │
│   "data": [...]              │
│ }                            │
└──────────────────────────────┘
        │
        ▼
FRONTEND:
┌──────────────────────────────┐
│ ├─ setAttendanceData(data)   │
│ ├─ setLoading(false)         │
│ └─ Re-render Component       │
└──────────────────────────────┘
```

---

## Responsive Layout Breakpoints

```
MOBILE (<640px)
┌─────────────────┐
│  [☰]  LOGO      │ Navbar
├─────────────────┤
│    [CONTENT]    │ Main (Full Width)
│   (Sidebar      │ Sidebar Hidden
│    Hidden)      │ or Overlay
├─────────────────┤

TABLET (640-1024px)
┌──────────────────────────┐
│  [☰]  LOGO     △ ◯       │ Navbar
├────────────────────────┐ │
│           │            │ │
│ Sidebar   │  CONTENT   │ │
│           │            │ │
│           │            │ │
└────────────────────────┘ │

DESKTOP (>1024px)
┌────────────────────────────┐
│  LOGO     Dashboard    △ ◯ │ Navbar
├────────────┬─────────────┐ │
│            │             │ │
│  Sidebar   │   CONTENT   │ │
│   Fixed    │             │ │
│            │             │ │
│            │             │ │
└────────────┴─────────────┘ │
```

---

## Authentication Flow

```
User Enters Credentials
        │
        ▼
Login Component
        │
        ├─► POST /api/auth/login
        │
        ▼
Backend Verification
        │
        ├─► Hash Compare
        ├─► Generate JWT
        ├─► Return Token + User Data
        │
        ▼
Frontend Storage
        │
        ├─► localStorage.setItem('user', userJSON)
        ├─► localStorage.setItem('token', token)
        │
        ▼
Redirect to Dashboard
        │
        ├─► Check localStorage for user
        ├─► Render DashboardLayout
        ├─► Pass user.role to determine view
        │
        ▼
API Requests Include Token
        │
        └─► Authorization: Bearer TOKEN
            (Added by interceptor)
```

---

## Navigation Flow

```
Entry Points:
├── http://localhost:5173/              → Login
├── http://localhost:5173/register      → Register
├── http://localhost:5173/forgot-password → Forgot Password
├── http://localhost:5173/dashboard/modern → Main Dashboard
├── http://localhost:5173/attendance    → Attendance Page
├── http://localhost:5173/gallery       → Gallery Page
└── http://localhost:5173/photos        → Photos Page

Role-Based Access:
├── Student Role
│   └─► Can access: dashboard/modern, gallery, photos, profile
│
└── Faculty Role
    └─► Can access: dashboard/modern, attendance, gallery, photos, profile

Protected Routes:
└─► Check localStorage.getItem('user')
    ├── If NOT found → Redirect to "/"
    └── If found → Allow Access
```

---

## Performance Optimization Strategy

```
Code Splitting
├── Each component in separate file
├── Lazy load with React.lazy()
│
Memoization
├── React.memo() for StatCard, NavBar
├── useMemo() for expensive computations
│
State Management
├── Keep state at lowest needed level
├── Avoid prop drilling
│
API Optimization
├── Batch requests with Promise.all()
├── Cache results where possible
│
Rendering
├── Use key props correctly
├── Avoid re-renders with useCallback
│
Bundle Size
├── Tree shake unused code
├── Compress images
└── Minify CSS/JS in production
```

---

## Error Handling Strategy

```
API Errors
├── 401 → Unauthorized (Refresh token or redirect to login)
├── 403 → Forbidden (Show error message)
├── 404 → Not found (Handle gracefully)
├── 500 → Server error (Show error message + retry button)
│
Network Errors
├── Check connectivity
├── Show offline message
├── Queue requests for retry
│
Validation Errors
├── Display field errors
├── Highlight invalid inputs
├── Show helpful messages
│
Component Errors
└── Error Boundaries
    ├── Catch rendering errors
    ├── Show fallback UI
    └── Log to error service
```

---

**This architecture ensures scalability, maintainability, and performance! 🚀**
