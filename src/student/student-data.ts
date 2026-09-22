import type { AttendanceIssue, AttendanceIssueType, StudentAttendanceOverview, StudentAttendanceSession, StudentHomeData, StudentSubject, StudentSubjectAttendance } from './types';

export const studentSubjects: StudentSubject[] = [
  { id: 'machine-learning', code: 'CS401', name: 'Machine Learning', lecturer: 'Dr. Ananya Rao', percentage: 82, present: 41, absent: 9, total: 50, threshold: 75, status: 'good' },
  { id: 'database-systems', code: 'CS305', name: 'Database Systems', lecturer: 'Dr. Ananya Rao', percentage: 76, present: 38, absent: 12, total: 50, threshold: 75, status: 'good' },
  { id: 'artificial-intelligence', code: 'CS402', name: 'Artificial Intelligence', lecturer: 'Prof. Nikhil Kumar', percentage: 72, present: 36, absent: 14, total: 50, threshold: 75, status: 'attention' },
  { id: 'software-engineering', code: 'CS306', name: 'Software Engineering', lecturer: 'Dr. Meera Iyer', percentage: 88, present: 44, absent: 6, total: 50, threshold: 75, status: 'good' },
  { id: 'computer-networks', code: 'CS307', name: 'Computer Networks', lecturer: 'Prof. Rahul Sen', percentage: 64, present: 32, absent: 18, total: 50, threshold: 75, status: 'low' },
];

export const studentHomeData: StudentHomeData = {
  student: { id: 'student-1', name: 'Aarav Mehta', rollNumber: 'CSE24001', programme: 'B.Tech Computer Science', semester: 'Semester 7' },
  attendance: { percentage: 78, present: 39, absent: 11, total: 50, threshold: 75, status: 'good' },
  today: [
    { id: 'today-1', subjectId: 'machine-learning', subject: 'Machine Learning', code: 'CS401', lecturer: 'Dr. Ananya Rao', time: '9:00 AM', duration: '60 min', room: 'Lab 3', status: 'completed', attendance: 'Present' },
    { id: 'today-2', subjectId: 'database-systems', subject: 'Database Systems', code: 'CS305', lecturer: 'Dr. Ananya Rao', time: '11:00 AM', duration: '60 min', room: 'Room 204', status: 'current', context: 'Now' },
    { id: 'today-3', subjectId: 'artificial-intelligence', subject: 'Artificial Intelligence', code: 'CS402', lecturer: 'Prof. Nikhil Kumar', time: '2:00 PM', duration: '60 min', room: 'Room 118', status: 'upcoming', context: 'Next' },
    { id: 'today-4', subjectId: 'computer-networks', subject: 'Computer Networks', code: 'CS307', lecturer: 'Prof. Rahul Sen', time: '4:00 PM', duration: '60 min', status: 'upcoming' },
  ],
  subjects: studentSubjects,
  activity: [
    { id: 'activity-1', subject: 'Machine Learning', detail: 'Attendance confirmed as present', timestamp: 'Today, 10:04 AM', status: 'confirmed' },
    { id: 'activity-2', subject: 'Software Engineering', detail: 'Attendance recorded', timestamp: 'Yesterday, 3:12 PM', status: 'recorded' },
    { id: 'activity-3', subject: 'Database Systems', detail: 'Attendance updated by lecturer', timestamp: '18 Sep, 1:42 PM', status: 'updated' },
  ],
  unreadNotifications: 2,
};

const sessionSeed: [string, string, string, string, string, 'PRESENT' | 'ABSENT'][] = [
  ['ml-0919', 'machine-learning', '2026-09-19', '9:00 AM', '10:00 AM', 'PRESENT'],
  ['db-0918', 'database-systems', '2026-09-18', '1:30 PM', '2:30 PM', 'PRESENT'],
  ['ai-0917', 'artificial-intelligence', '2026-09-17', '2:00 PM', '3:00 PM', 'ABSENT'],
  ['se-0916', 'software-engineering', '2026-09-16', '11:00 AM', '12:00 PM', 'PRESENT'],
  ['cn-0915', 'computer-networks', '2026-09-15', '4:00 PM', '5:00 PM', 'ABSENT'],
  ['ml-0914', 'machine-learning', '2026-09-14', '9:00 AM', '10:00 AM', 'PRESENT'],
  ['db-0912', 'database-systems', '2026-09-12', '1:30 PM', '2:30 PM', 'PRESENT'],
  ['ai-0911', 'artificial-intelligence', '2026-09-11', '2:00 PM', '3:00 PM', 'PRESENT'],
  ['se-0910', 'software-engineering', '2026-09-10', '11:00 AM', '12:00 PM', 'PRESENT'],
  ['cn-0909', 'computer-networks', '2026-09-09', '4:00 PM', '5:00 PM', 'PRESENT'],
  ['ml-0907', 'machine-learning', '2026-09-07', '9:00 AM', '10:00 AM', 'ABSENT'],
  ['db-0905', 'database-systems', '2026-09-05', '1:30 PM', '2:30 PM', 'PRESENT'],
  ['ai-0903', 'artificial-intelligence', '2026-09-03', '2:00 PM', '3:00 PM', 'PRESENT'],
  ['se-0902', 'software-engineering', '2026-09-02', '11:00 AM', '12:00 PM', 'PRESENT'],
  ['cn-0901', 'computer-networks', '2026-09-01', '4:00 PM', '5:00 PM', 'ABSENT'],
];

export const studentAttendanceSessions: StudentAttendanceSession[] = sessionSeed.map(([id, subjectId, date, startTime, endTime, attendance], index) => {
  const subject = studentSubjects.find((item) => item.id === subjectId)!;
  return { id, subjectId, subject: subject.name, code: subject.code, lecturer: subject.lecturer, date, startTime, endTime, duration: '60 min', room: index % 3 === 0 ? 'Lab 3' : `Room ${118 + index}`, sessionStatus: 'Completed', confirmation: index === 2 ? 'Pending confirmation' : 'Confirmed', recordedAt: `${date}T${index % 2 ? '14:42:00' : '10:04:00'}+05:30`, attendance, information: index % 3 === 0 ? 'Laboratory session' : 'Scheduled lecture' };
});

const attendanceOverview: StudentAttendanceOverview = { summary: studentHomeData.attendance!, subjects: studentSubjects };
const localIssues: AttendanceIssue[] = [];

export const studentClient = {
  async home() { return studentHomeData; },
  async subjects() { return studentSubjects; },
  async attendanceOverview() { return attendanceOverview; },
  async subjectAttendance(id: string): Promise<StudentSubjectAttendance | undefined> { const subject = studentSubjects.find((item) => item.id === id); return subject ? { ...subject, recentSessions: studentAttendanceSessions.filter((item) => item.subjectId === id).slice(0, 6) } : undefined; },
  async attendanceHistory() { return studentAttendanceSessions; },
  async attendanceSession(id: string) { return studentAttendanceSessions.find((item) => item.id === id); },
  async submitAttendanceIssue(input: { type: AttendanceIssueType; sessionId: string; explanation: string }, fail = false) { if (fail) throw new Error('The issue could not be saved.'); const issue: AttendanceIssue = { id: `issue-${localIssues.length + 1}`, ...input, status: 'SUBMITTED', submittedAt: new Date().toISOString() }; localIssues.unshift(issue); return issue; },
};
