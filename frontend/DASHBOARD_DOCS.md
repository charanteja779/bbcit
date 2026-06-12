# Dashboard Documentation

## Overview

This is a modern, responsive dashboard UI with role-based access control for Students and Faculty. The system is built with React, Tailwind CSS, and features dynamic data handling via props, state, and API integration.

---

## 🚀 Quick Start

### Installation

All dependencies are already installed. If not:

```bash
npm install
# or
yarn install
```

### Running the Dashboard

```bash
npm run dev
# or
yarn dev
```

Visit: `http://localhost:5173/dashboard/modern`

---

## 📁 Component Structure

### Core Components

1. **DashboardLayout.jsx** - Main wrapper component
   - Manages sidebar toggle
   - Combines Navbar, Sidebar, and role-based dashboard
   - Props: `user`, `role`, `onLogout`

2. **Navbar.jsx** - Top navigation bar
   - Profile dropdown
   - Notifications
   - Logout button
   - Responsive menu toggle

3. **Sidebar.jsx** - Navigation menu
   - Collapsible on mobile
   - Active menu highlighting
   - Submenu support
   - Smooth animations

4. **StatCard.jsx** - Reusable stat cards
   - Dynamic value display
   - Icons and color variants
   - Hover animations
   - Trend indicators

5. **StudentDashboard.jsx** - Student view
   - Welcome card
   - Stats overview
   - Attendance chart
   - Recent events
   - Quick actions

6. **FacultyDashboard.jsx** - Faculty view
   - Class/Subject selector
   - Student attendance table
   - Attendance submission
   - Records history

7. **AttendanceTable.jsx** - Attendance management
   - Interactive toggle
   - Summary statistics
   - Bulk submission

---

## 🎯 Usage Examples

### Basic Integration

```jsx
import DashboardLayout from './components/DashboardLayout';

function App() {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student' // or 'faculty'
  };

  const handleLogout = () => {
    // Handle logout logic
  };

  return (
    <DashboardLayout
      user={user}
      role="student"
      onLogout={handleLogout}
    />
  );
}
```

### With API Integration

```jsx
import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { studentAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from API
    const fetchUser = async () => {
      try {
        const response = await studentAPI.getStats();
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return user ? (
    <DashboardLayout user={user} role={user.role} />
  ) : (
    <div>Loading...</div>
  );
}
```

### Student Dashboard with Dynamic Data

```jsx
import StudentDashboard from './components/StudentDashboard';
import { useEffect, useState } from 'react';
import { studentAPI } from './services/api';

export default function StudentPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const stats = await studentAPI.getStats();
      const events = await studentAPI.getRecentEvents();
      const attendance = await studentAPI.getAttendanceData();

      setData({ stats, events, attendance });
    };

    fetchData();
  }, []);

  return <StudentDashboard user={data} />;
}
```

### Faculty Dashboard with Attendance Management

```jsx
import FacultyDashboard from './components/FacultyDashboard';
import { useEffect, useState } from 'react';
import { facultyAPI } from './services/api';

export default function FacultyPage() {
  const [user, setUser] = useState({
    name: 'Dr. Jane Smith',
    role: 'faculty'
  });

  const handleAttendanceSubmit = async (attendanceData) => {
    try {
      await facultyAPI.submitAttendance(
        'CS-A',
        'Data Structures',
        attendanceData
      );
      // Show success message
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  return <FacultyDashboard user={user} />;
}
```

---

## 🎨 Customization

### Tailwind Configuration

The dashboard uses Tailwind CSS with default configuration. Customize in `tailwind.config.js`:

```js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Add custom colors here
      },
      spacing: {
        // Add custom spacing here
      },
    },
  },
};
```

### Color Variants in StatCard

```jsx
<StatCard
  title="Attendance"
  value="85%"
  icon={Calendar}
  color="blue"      // Options: blue, purple, green, orange, red
  trend={5}
/>
```

### Custom Icons

Uses Lucide React icons. Browse available icons at [lucide.dev](https://lucide.dev)

```jsx
import { Calendar, Users, BookOpen } from 'lucide-react';

<Calendar size={24} className="text-blue-500" />
```

---

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (Sidebar hidden, collapsible menu)
- **Tablet**: 640px - 1024px (Adjusted layouts)
- **Desktop**: > 1024px (Full sidebar visible)

Tailwind breakpoints used:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🔐 Role-Based Access

### Student Routes

- `/dashboard/modern` - Main dashboard
- `/attendance` - View attendance
- `/gallery` - Event gallery
- `/photos` - Student photos
- `/profile` - Student profile

### Faculty Routes

- `/dashboard/modern` - Main dashboard (shows faculty view)
- `/attendance` - Manage attendance
- `/gallery` - Event gallery
- `/photos` - Gallery
- `/profile` - Faculty profile

---

## 🔄 State Management

Currently using React hooks (useState, useEffect). For larger applications, consider:

- Redux
- Zustand
- Jotai
- Context API

---

## 📊 Chart Integration

Using Recharts for data visualization:

```jsx
import {
  LineChart,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { date: 'Jan', attendance: 80 },
  { date: 'Feb', attendance: 82 },
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" />
  </LineChart>
</ResponsiveContainer>
```

---

## 🎭 Animations

Using Framer Motion for smooth animations:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## 🛠️ API Integration

Backend API endpoints should follow this structure:

### Student Endpoints

```
GET  /api/student/stats           - Get student statistics
GET  /api/student/attendance      - Get attendance data
GET  /api/student/events          - Get recent events
GET  /api/student/photos          - Get photos
```

### Faculty Endpoints

```
GET  /api/faculty/classes                    - Get classes
GET  /api/faculty/subjects/:classId          - Get subjects
GET  /api/faculty/students/:classId/:subjectId - Get students
POST /api/faculty/attendance/:classId/:subjectId - Submit attendance
GET  /api/faculty/attendance-records/:classId/:subjectId - Get records
```

### Request/Response Format

**Attendance Request:**
```json
{
  "1": true,    // student_id: is_present
  "2": false,
  "3": true
}
```

**API Response Example:**
```json
{
  "success": true,
  "message": "Attendance submitted successfully",
  "data": {
    "date": "2026-05-06",
    "present": 7,
    "absent": 1
  }
}
```

---

## 🐛 Debugging

Enable console logging:

```jsx
// In StudentDashboard.jsx or FacultyDashboard.jsx
useEffect(() => {
  console.log('User data:', user);
  console.log('Stats:', stats);
}, [user, stats]);
```

---

## 📱 Mobile Testing

Test responsive design:

```bash
# Chrome DevTools: F12 > Ctrl+Shift+M
# Or use actual devices
```

---

## 🎓 Best Practices

1. **Data Fetching**: Use useEffect hooks with cleanup
2. **Error Handling**: Wrap API calls in try-catch
3. **Loading States**: Show spinners during data fetch
4. **Accessibility**: Use semantic HTML, ARIA labels
5. **Performance**: Memoize expensive components with React.memo
6. **Security**: Never store sensitive data in localStorage
7. **Testing**: Add unit tests for components

---

## 📦 Dependencies

- `react` - UI framework
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animation library
- `recharts` - Chart library
- `lucide-react` - Icon library
- `axios` - HTTP client

---

## 🔗 Useful Links

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

---

## 📝 Notes

- No hardcoded data - all data is dynamic via props/state
- Ready for backend API integration
- Fully responsive and mobile-friendly
- Smooth animations and transitions
- Clean, maintainable code structure
- Reusable components

---

## 🚀 Next Steps

1. Connect to backend API using provided endpoints
2. Implement actual user authentication
3. Add error boundaries for robustness
4. Implement actual file uploads for gallery
5. Add export functionality for attendance records
6. Implement search and filtering features
7. Add notification system
8. Implement dark mode toggle

---

**Happy coding! 🎉**
