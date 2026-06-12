# 🚀 Dashboard Quick Reference Card

## File Locations & Import Paths

### Components
```jsx
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardLayout from '@/components/DashboardLayout';
import StudentDashboard from '@/components/StudentDashboard';
import FacultyDashboard from '@/components/FacultyDashboard';
import AttendanceTable from '@/components/AttendanceTable';
import StatCard from '@/components/StatCard';
```

### Services
```jsx
import { studentAPI, facultyAPI, userAPI, authAPI } from '@/services/api';
```

---

## Component Props

### DashboardLayout
```jsx
<DashboardLayout
  user={{ name, email, role }}
  role="student"  // or "faculty"
  onLogout={() => {}}
/>
```

### Navbar
```jsx
<Navbar
  username="John Doe"
  role="Student"  // or "Faculty"
  onLogout={() => {}}
  onToggleSidebar={() => {}}
  sidebarOpen={true}
  notifications={3}
/>
```

### Sidebar
```jsx
<Sidebar
  isOpen={true}
  onClose={() => {}}
  onLogout={() => {}}
  role="student"  // or "faculty"
/>
```

### StatCard
```jsx
<StatCard
  title="Attendance"
  value="85%"
  icon={Calendar}
  trend={5}
  color="blue"  // blue, purple, green, orange, red
  onClick={() => {}}
/>
```

### AttendanceTable
```jsx
<AttendanceTable
  students={[
    { id: 1, name: 'John', rollNumber: 'CS001', attendance: false }
  ]}
  onAttendanceChange={(data) => {}}
  onSubmit={(attendanceData) => {}}
  loading={false}
/>
```

### StudentDashboard
```jsx
<StudentDashboard user={{ name, email }} />
```

### FacultyDashboard
```jsx
<FacultyDashboard user={{ name, email }} />
```

---

## API Service Usage

### Student APIs
```jsx
// Get stats
const res = await studentAPI.getStats();

// Get attendance data
const res = await studentAPI.getAttendanceData();

// Get events
const res = await studentAPI.getRecentEvents();

// Get photos
const res = await studentAPI.getGalleryImages();
```

### Faculty APIs
```jsx
// Get classes
const res = await facultyAPI.getClasses();

// Get subjects
const res = await facultyAPI.getSubjects(classId);

// Get students
const res = await facultyAPI.getStudents(classId, subjectId);

// Submit attendance
const res = await facultyAPI.submitAttendance(classId, subjectId, data);

// Get records
const res = await facultyAPI.getAttendanceRecords(classId, subjectId);
```

### User APIs
```jsx
// Get profile
const res = await userAPI.getProfile();

// Update profile
const res = await userAPI.updateProfile(userData);

// Get settings
const res = await userAPI.getSettings();

// Update settings
const res = await userAPI.updateSettings(settings);
```

---

## Routes Setup

### Add to App.jsx Routes
```jsx
<Route
  path="/dashboard/modern"
  element={
    isAuthenticated ? (
      <DashboardLayout
        user={user}
        role={user.role}
        onLogout={handleLogout}
      />
    ) : (
      <Navigate to="/" />
    )
  }
/>
```

---

## Common Patterns

### Fetch Data with Loading
```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    try {
      const res = await API.call();
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

### Conditional Rendering by Role
```jsx
{role === 'student' ? (
  <StudentDashboard user={user} />
) : (
  <FacultyDashboard user={user} />
)}
```

### Handle Attendance Toggle
```jsx
const handleToggle = (studentId) => {
  setAttendance({
    ...attendance,
    [studentId]: !attendance[studentId]
  });
};
```

---

## Tailwind Classes Used

### Colors
```
bg-blue-50, bg-purple-500, bg-gradient-to-r, text-white, text-gray-700
```

### Spacing
```
p-4, px-4, py-3, mb-6, gap-4, mt-2
```

### Display
```
flex, grid, grid-cols-1, md:grid-cols-2, lg:grid-cols-4
```

### Effects
```
shadow-md, rounded-lg, hover:shadow-lg, transition-all
```

### Responsive
```
hidden sm:block, lg:hidden, block md:flex
```

---

## Icons (Lucide)

### Navigation
- `Menu`, `X` - Menu toggle
- `ChevronDown` - Collapse/expand

### Content
- `Bell` - Notifications
- `User` - Profile
- `LogOut` - Logout
- `LayoutDashboard` - Dashboard
- `CheckSquare` - Attendance
- `Image` - Gallery
- `Pictures` - Photos
- `Settings` - Settings
- `HelpCircle` - Help

### Data
- `Calendar` - Dates
- `Users` - Students
- `BookOpen` - Subjects
- `BarChart3` - Charts
- `Check`, `X` - Status

---

## Animations (Framer Motion)

### Basic Fade-In
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
/>
```

### Slide-Up
```jsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
/>
```

### Scale on Hover
```jsx
<motion.div
  whileHover={{ scale: 1.05 }}
/>
```

### List Animation
```jsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1 }}
```

---

## Common Data Formats

### Attendance Request
```js
{
  "1": true,    // student_id: is_present
  "2": false,
  "3": true
}
```

### Attendance Response
```js
{
  date: "2026-05-06",
  present: 7,
  absent: 1,
  totalStudents: 8
}
```

### Student List
```js
[
  {
    id: 1,
    name: "John Doe",
    rollNumber: "CS001",
    attendance: false
  }
]
```

### Events
```js
[
  {
    id: 1,
    name: "Sports Day",
    date: "2026-05-15",
    location: "Sports Ground"
  }
]
```

### Chart Data
```js
[
  { date: "Jan", attendance: 80 },
  { date: "Feb", attendance: 82 }
]
```

---

## Error Handling

### Try-Catch Pattern
```jsx
try {
  const res = await api.call();
  setData(res.data);
} catch (error) {
  console.error('Error:', error);
  setError(error.message);
}
```

### Token Refresh
```jsx
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Refresh token or redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## localStorage Operations

### Save User
```js
localStorage.setItem('user', JSON.stringify({
  name: 'John',
  email: 'john@example.com',
  role: 'student'
}));
```

### Get User
```js
const user = JSON.parse(localStorage.getItem('user'));
```

### Clear Auth
```js
localStorage.removeItem('user');
localStorage.removeItem('token');
```

---

## Environment Variables

### .env file
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### Usage
```jsx
const API_BASE_URL = import.meta.env.VITE_API_URL;
```

---

## Terminal Commands

### Development
```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview build
npm run lint            # Run linter
```

### Dependencies
```bash
npm install             # Install packages
npm install package-name # Install specific package
npm update              # Update packages
```

---

## Responsive Breakpoints

```
sm   640px
md   768px
lg   1024px
xl   1280px
2xl  1536px
```

### Usage
```jsx
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile, 2 col tablet, 4 col desktop */}
</div>
```

---

## Color Variants

```
blue    - #3B82F6
purple  - #A855F7
green   - #22C55E
orange  - #F97316
red     - #EF4444
```

### Gradients
```jsx
from-purple-500 to-blue-500
from-blue-500 to-cyan-500
```

---

## Performance Tips

1. **Memoize Components**
   ```jsx
   export default React.memo(StatCard);
   ```

2. **Lazy Load Routes**
   ```jsx
   const Dashboard = lazy(() => import('./Dashboard'));
   ```

3. **Optimize Lists**
   ```jsx
   {items.map((item, idx) => (
     <div key={item.id}>{item.name}</div>
   ))}
   ```

4. **Debounce Inputs**
   ```jsx
   const [value, setValue] = useState('');
   const debounce = useCallback(
     debounceFunc(setValue, 300),
     []
   );
   ```

---

## Debugging

### React DevTools
```
Chrome: F12 → Components tab
```

### Console Logs
```jsx
console.log('Data:', data);
console.error('Error:', error);
console.warn('Warning:', message);
```

### Network Tab
```
F12 → Network → See API calls
```

---

## VSCode Extensions Recommended

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- Thunder Client (API testing)

---

**Print this card for quick reference! 📋**
