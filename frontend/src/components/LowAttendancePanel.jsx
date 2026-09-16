import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { attendanceAPI } from "../services/api";

const LowAttendancePanel = ({ title = "Students below 75% attendance", params = {} }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    attendanceAPI
      .getLowAttendance({ threshold: 75, ...params })
      .then((response) => {
        if (active) setStudents(response.data.students || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Failed to load low-attendance students."
          );
          setStudents([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [JSON.stringify(params)]);

  return (
    <section className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <AlertTriangle size={20} className="text-amber-600" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Formula: classes attended / total classes x 100
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          {students.length} students
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading attendance...
        </div>
      ) : error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : students.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No students are below 75% attendance.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subjects below 75%</th>
                <th className="px-4 py-3 text-right">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const lowSubjects = student.subjects.filter((subject) => subject.percentage < 75);
                return (
                  <tr key={`${student.rollNo}-${student.studentId}`}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{student.studentName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.rollNo}</td>
                    <td className="px-4 py-3 text-slate-600">{student.year} / {student.section}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {lowSubjects.length
                        ? lowSubjects.map((subject) => `${subject.subject}: ${subject.percentage}%`).join(", ")
                        : "None"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">{student.overall.percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default LowAttendancePanel;
