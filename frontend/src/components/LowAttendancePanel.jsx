import React, { useEffect, useState } from "react";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { attendanceAPI } from "../services/api";

const LowAttendancePanel = ({ title = "Students below 75% attendance", params = {} }) => {
  const [students, setStudents] = useState([]);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    attendanceAPI
      .getLowAttendance({ threshold: 75, ...params })
      .then((response) => {
        if (active) {
          setStudents(response.data.students || []);
          setMonth(response.data.month || "");
        }
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

  const downloadStudents = () => {
    const report = new jsPDF();
    report.setFontSize(16);
    report.text("Students Below 75% Attendance", 14, 18);
    report.setFontSize(10);
    report.setTextColor(90);
    report.text(`Monthly report: ${month || "Current month"}`, 14, 26);
    report.text(`Students: ${students.length}`, 14, 32);

    autoTable(report, {
      startY: 39,
      head: [["Student name", "Roll number", "Year", "Section", "Attendance"]],
      body: students.map((student) => [
        student.studentName || "",
        student.rollNo || "",
        student.year || "",
        student.section || "",
        `${student.overall.percentage}%`,
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    report.save(`students-below-75-${month || "attendance"}.pdf`);
  };

  return (
    <section className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <AlertTriangle size={20} className="text-amber-600" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            All subjects combined for the selected month. Formula: attended / total x 100
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            {students.length} students
          </span>
          <button
            type="button"
            onClick={downloadStudents}
            disabled={loading || Boolean(error) || students.length === 0}
            title="Download student list as PDF"
            aria-label="Download student list as PDF"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={17} />
          </button>
        </div>
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
                <th className="px-4 py-3 text-right">Monthly attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                return (
                  <tr key={`${student.rollNo}-${student.studentId}`}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{student.studentName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.rollNo}</td>
                    <td className="px-4 py-3 text-slate-600">{student.year} / {student.section}</td>
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
