import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
const user = JSON.parse(localStorage.getItem("user"));

import {
    BarChart3,
    Calendar,
    Image,
    FileText,
    ArrowRight,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import StatCard from "./StatCard";

const StudentDashboard = ({ user = {} }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [stats, setStats] = useState({
        attendance: 85,
        events: 12,
        photos: 45,
        notices: 3,
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call - replace with actual API
        const timer = setTimeout(() => {
            // Mock attendance data
            setAttendanceData([
                { date: "Jan", attendance: 80 },
                { date: "Feb", attendance: 82 },
                { date: "Mar", attendance: 85 },
                { date: "Apr", attendance: 88 },
                { date: "May", attendance: 87 },
                { date: "Jun", attendance: 85 },
            ]);

            // Mock recent events
            setRecentEvents([
                {
                    id: 1,
                    name: "Earth day",
                    date: "April 22, 2026",
                    location: "Seminar Hall",
                },
                {
                    id: 2,
                    name: "ABACUS",
                    date: "Febrauary 21, 2026",
                    location: "Seminar Hall",
                },
                {
                    id: 3,
                    name: "Rythmic Fusion",
                    date: "March 21, 2026",
                    location: "Seminar Hall",
                },
            ]);

            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome Card */}
            <motion.div
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl shadow-lg p-8 text-white overflow-hidden relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, {user?.username || "Student"}! 👋
                    </h1>
                    <p className="text-lg opacity-90">
                        Here's your academic performance at a glance
                    </p>
                </div>
                <div className="absolute top-0 right-0 opacity-10">
                    <div className="w-40 h-40 bg-white rounded-full blur-3xl" />
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Attendance"
                    value={`${stats.attendance}%`}
                    icon={Calendar}
                    trend={5}
                    color="blue"
                />
                <StatCard
                    title="Events Attended"
                    value={stats.events}
                    icon={BarChart3}
                    trend={2}
                    color="purple"
                />
                <StatCard
                    title="Photos"
                    value={stats.photos}
                    icon={Image}
                    trend={8}
                    color="green"
                />
                <StatCard
                    title="Notices"
                    value={stats.notices}
                    icon={FileText}
                    trend={-1}
                    color="orange"
                />
            </div>

            {/* Attendance Chart */}
            <motion.div
                className="bg-white rounded-xl shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <BarChart3 size={24} className="text-purple-500" />
                    Attendance Overview
                </h2>
                {!loading && attendanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#999" />
                            <YAxis stroke="#999" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "8px",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="attendance"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: "#8b5cf6", r: 6 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                        Loading chart...
                    </div>
                )}
            </motion.div>

            {/* Recent Events */}
            <motion.div
                className="bg-white rounded-xl shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Events</h2>
                <div className="space-y-4">
                    {recentEvents.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                            whileHover={{ translateX: 8 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">📅 {event.date}</p>
                                    <p className="text-sm text-gray-600">📍 {event.location}</p>
                                </div>
                                <ArrowRight size={20} className="text-purple-500" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <button className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={28} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Attendance</h3>
                    <p className="text-sm text-gray-600">Check your attendance records</p>
                </button>

                <button className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 size={28} className="text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Events</h3>
                    <p className="text-sm text-gray-600">Explore upcoming events</p>
                </button>

                <button className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image size={28} className="text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Photos</h3>
                    <p className="text-sm text-gray-600">Browse event photos</p>
                </button>
            </motion.div>

        </div>
    );
};

export default StudentDashboard;
