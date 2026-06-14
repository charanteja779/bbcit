# BBCIT Dashboard

A comprehensive, full-stack college management portal built with the MERN stack. This mini-project serves as an interactive dashboard for both Students and Faculty members of Bankatlal Badruka College for Information and Technology (BBCIT).

## 🌟 Features

- **Dual-Role Authentication**: Secure login system with distinct dashboards for "Student" and "Faculty" roles.
- **Faculty Dashboard**:
  - Manage students (Add, Edit, Delete).
  - Take attendance by selecting Course, Year, and Subject.
  - View summary analytics (Total Students, Section, Subject) pinned at the top.
  - View previous attendance records.
- **Student Dashboard**:
  - Real-time attendance analytics and visual charts.
  - View subject-wise attendance status.
  - Access personal profile information.
- **Event Gallery**: Upload and view campus event photos (shared across all users).
- **Responsive UI/UX**: Clean, modern, "SaaS-like" horizontal top-navigation design using Tailwind CSS and Framer Motion for animations.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel (Frontend), Render (Backend)

## 🚀 Local Development Setup

### Prerequisites
- Node.js installed
- MongoDB installed locally (or a MongoDB Atlas connection string)

### 1. Clone the repository
```bash
git clone git@github.com:charanteja779/BBCIT.git
cd BBCIT
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file in the backend folder and add:
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/bbcit
# JWT_SECRET=your_super_secret_key

# Start the local development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

The application will now be running on `http://localhost:5173`.

## 🌐 Deployment Configuration

This repository includes Infrastructure as Code (IaC) configuration files for seamless zero-config deployments:
- **`vercel.json`**: Located in the frontend directory to handle React Router SPA fallbacks.
- **`render.yaml`**: Located in the root directory to automatically provision the Node.js backend on Render.

To deploy, simply connect your GitHub repository to Vercel (for the `frontend` folder) and Render (for the backend), and ensure you configure the `VITE_API_URL` environment variable on Vercel to point to your live Render API URL.
