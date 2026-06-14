export const ATTENDANCE_STORAGE_KEY = "faculty_attendance_records";

export const getStudentKey = (student) =>
  student?.id || student?._id || student?.rollNo || student?.rollNumber;

export const normalizeRollNo = (value) =>
  String(value || "").trim().toLowerCase();

export const normalizeUser = (user = {}) => {
  const rollNo =
    user.rollNo || user.rollNumber || user.rollno || user.regNo || "";

  const section =
    user.section || user.className || user.class || user.classSection || "";

  return {
    ...user,
    id: user.id || user._id || user.studentId || "",
    name: user.name || user.username || user.fullName || "",
    username: user.username || user.name || "",
    rollNo,
    rollNumber: rollNo,
    course: user.course || user.branch || user.department || "",
    year: user.year || user.academicYear || user.studentYear || "",
    section,
    className: section,
  };
};

export const parseAttendanceRecords = (saved) => {
  if (!saved) {
    return [];
  }

  const parsed = JSON.parse(saved);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (typeof parsed === "object" && parsed !== null) {
    return Object.values(parsed).flatMap((records) =>
      Array.isArray(records) ? records : [records]
    );
  }

  return [];
};

export const flattenAttendanceRecords = (records) => {
  const flat = [];

  records.forEach((record) => {
    if (record.students && Array.isArray(record.students)) {
      record.students.forEach((student) => {
        const isPresent =
          typeof student.isPresent === "boolean"
            ? student.isPresent
            : String(student.status || "").toLowerCase() === "present";

        flat.push({
          id: `${record.id || record.date}-${student.studentId || student.rollNo}`,
          studentId: student.studentId || student.id || "",
          rollNo: student.rollNo || student.rollNumber || student.rollno || "",
          studentName: student.studentName || student.name || "",
          className: record.section || record.className || student.section || "",
          section: record.section || record.className || student.section || "",
          subject: record.subject || "",
          date: record.date,
          status: isPresent ? "present" : "absent",
          markedBy: record.markedBy || null,
          markedAt: record.markedAt || record.date,
        });
      });
      return;
    }

    flat.push(record);
  });

  return flat;
};

export const filterRecordsForStudent = (records, loggedInUser) => {
  const normalizedUser = normalizeUser(loggedInUser);
  const studentRollNo = normalizeRollNo(normalizedUser.rollNo);
  const studentId = String(normalizedUser.id || "");

  if (!studentRollNo && !studentId) {
    return [];
  }

  return records.filter((record) => {
    const recordRollNo = normalizeRollNo(
      record.rollNo || record.rollNumber || record.rollno
    );

    const sameRollNo =
      studentRollNo && recordRollNo && studentRollNo === recordRollNo;

    const sameId =
      studentId &&
      String(record.studentId || record.id || "") === studentId;

    return sameRollNo || sameId;
  });
};

export const dedupeAttendanceRecords = (records) => {
  const seen = new Map();

  records.forEach((record) => {
    const key = [
      normalizeRollNo(record.rollNo),
      String(record.subject || "").trim().toLowerCase(),
      String(record.date || ""),
      String(record.className || record.section || "")
        .trim()
        .toLowerCase(),
    ].join("|");

    seen.set(key, record);
  });

  return Array.from(seen.values());
};

export const aggregateAttendanceBySession = (records) => {
  const grouped = new Map();

  records.forEach((record) => {
    const key = `${record.date}_${record.section || record.className}_${record.subject}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        date: record.date,
        section: record.section || record.className,
        subject: record.subject,
        totalStudents: 0,
        present: 0,
        absent: 0,
      });
    }

    const entry = grouped.get(key);
    entry.totalStudents += 1;

    if (String(record.status).toLowerCase() === "present") {
      entry.present += 1;
    } else {
      entry.absent += 1;
    }
  });

  return Array.from(grouped.values()).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
};
