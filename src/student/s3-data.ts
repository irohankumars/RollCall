import type { StudentAcademicEvent, StudentAcademicInfo, StudentNotification, StudentScheduleClass } from './types';

export const studentSchedule: StudentScheduleClass[] = [
  { id: 'schedule-ml-0921', date: '2026-09-21', subjectId: 'machine-learning', subject: 'Machine Learning', code: 'CS401', lecturer: 'Dr. Ananya Rao', startTime: '9:00 AM', endTime: '10:00 AM', room: 'Lab 3', status: 'completed', academicInformation: 'Laboratory session' },
  { id: 'schedule-db-0921', date: '2026-09-21', subjectId: 'database-systems', subject: 'Database Systems', code: 'CS305', lecturer: 'Dr. Ananya Rao', startTime: '11:00 AM', endTime: '12:00 PM', room: 'Room 204', status: 'current', academicInformation: 'Scheduled lecture' },
  { id: 'schedule-ai-0921', date: '2026-09-21', subjectId: 'artificial-intelligence', subject: 'Artificial Intelligence', code: 'CS402', lecturer: 'Prof. Nikhil Kumar', startTime: '2:00 PM', endTime: '3:00 PM', room: 'Room 118', status: 'next', academicInformation: 'Scheduled lecture' },
  { id: 'schedule-cn-0921', date: '2026-09-21', subjectId: 'computer-networks', subject: 'Computer Networks', code: 'CS307', lecturer: 'Prof. Rahul Sen', startTime: '4:00 PM', endTime: '5:00 PM', status: 'upcoming', academicInformation: 'Scheduled lecture' },
  { id: 'schedule-se-0922', date: '2026-09-22', subjectId: 'software-engineering', subject: 'Software Engineering', code: 'CS306', lecturer: 'Dr. Meera Iyer', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', status: 'upcoming', academicInformation: 'Scheduled lecture' },
  { id: 'schedule-ml-0922', date: '2026-09-22', subjectId: 'machine-learning', subject: 'Machine Learning', code: 'CS401', lecturer: 'Dr. Ananya Rao', startTime: '1:00 PM', endTime: '2:00 PM', room: 'Lab 3', status: 'upcoming', academicInformation: 'Laboratory session' },
  { id: 'schedule-db-0923', date: '2026-09-23', subjectId: 'database-systems', subject: 'Database Systems', code: 'CS305', lecturer: 'Dr. Ananya Rao', startTime: '9:30 AM', endTime: '10:30 AM', room: 'Room 204', status: 'upcoming', academicInformation: 'Scheduled lecture' },
  { id: 'schedule-ai-0923', date: '2026-09-23', subjectId: 'artificial-intelligence', subject: 'Artificial Intelligence', code: 'CS402', lecturer: 'Prof. Nikhil Kumar', startTime: '2:00 PM', endTime: '3:00 PM', room: 'Room 118', status: 'upcoming', academicInformation: 'Tutorial' },
  { id: 'schedule-cn-0924', date: '2026-09-24', subjectId: 'computer-networks', subject: 'Computer Networks', code: 'CS307', lecturer: 'Prof. Rahul Sen', startTime: '11:00 AM', endTime: '12:00 PM', room: 'Network Lab', status: 'upcoming', academicInformation: 'Laboratory session' },
  { id: 'schedule-se-0925', date: '2026-09-25', subjectId: 'software-engineering', subject: 'Software Engineering', code: 'CS306', lecturer: 'Dr. Meera Iyer', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', status: 'upcoming', academicInformation: 'Scheduled lecture' },
];

export const studentAcademicInfo: StudentAcademicInfo = {
  department: 'Computer Science and Engineering',
  programme: 'B.Tech Computer Science',
  semester: 'Semester 7',
  academicYear: '2026–27',
  batch: 'CSE 2024',
  currentPeriod: 'Odd Semester',
};

export const studentAcademicEvents: StudentAcademicEvent[] = [
  { id: 'mid-semester-exams', title: 'Mid-semester examinations', category: 'EXAM', date: '2026-10-12', time: '9:30 AM', location: 'See the published room allocation', description: 'The mid-semester examination period begins on this date. Review the published subject timetable before attending.', information: 'Sample academic calendar information stored in this frontend build.', notificationId: 'student-n3' },
  { id: 'course-registration-review', title: 'Course registration review closes', category: 'MILESTONE', date: '2026-09-30', time: '5:00 PM', description: 'Review the subjects shown in your academic profile before the local demonstration deadline.', information: 'Sample academic calendar information stored in this frontend build.', notificationId: 'student-n6' },
  { id: 'instructional-break', title: 'Instructional break', category: 'INSTITUTIONAL', date: '2026-10-19', description: 'No regular classes are shown in the sample schedule during this academic calendar period.', information: 'Sample academic calendar information stored in this frontend build.' },
];

export const initialStudentNotifications: StudentNotification[] = [
  { id: 'student-n1', category: 'ATTENDANCE', title: 'Attendance confirmed', preview: 'Your Machine Learning attendance was confirmed as present.', message: 'Your attendance for the Machine Learning session on 19 September was confirmed as present.', source: 'Machine Learning', timestamp: '2026-09-21T10:04:00+05:30', unread: true, destination: '/student/attendance/session/ml-0919', actionLabel: 'View Attendance', subject: 'Machine Learning', metadata: [{ label: 'Session', value: '19 Sep · 9:00 AM' }, { label: 'Status', value: 'Present' }] },
  { id: 'student-n2', category: 'ATTENDANCE_ISSUE', title: 'Issue status updated', preview: 'Your attendance issue is now under review.', message: 'The attendance issue for Artificial Intelligence is under review. Your recorded attendance has not been changed.', source: 'Attendance Support', timestamp: '2026-09-21T09:18:00+05:30', unread: true, destination: '/student/attendance/session/ai-0917', actionLabel: 'View Session', subject: 'Artificial Intelligence', metadata: [{ label: 'Issue status', value: 'Under review' }, { label: 'Session', value: '17 Sep · 2:00 PM' }] },
  { id: 'student-n3', category: 'ACADEMIC', title: 'Exam schedule updated', preview: 'The sample mid-semester examination information is available.', message: 'The sample academic calendar now includes the mid-semester examination period. Open the event to review the available date and guidance.', source: 'Academic Calendar', timestamp: '2026-09-20T16:30:00+05:30', unread: true, destination: '/student/academic/events/mid-semester-exams?from=student-n3', actionLabel: 'View Academic Event', metadata: [{ label: 'Event date', value: '12 Oct 2026' }] },
  { id: 'student-n4', category: 'ACADEMIC', title: 'Monday schedule available', preview: 'Your Monday classes are ready to review.', message: 'Your current-week Monday schedule is available, including Machine Learning, Database Systems, Artificial Intelligence, and Computer Networks.', source: 'Academic Schedule', timestamp: '2026-09-20T15:00:00+05:30', unread: false, destination: '/student/schedule', actionLabel: 'View Schedule', metadata: [{ label: 'Schedule date', value: '21 Sep 2026' }] },
  { id: 'student-n5', category: 'SYSTEM', title: 'Session secured', preview: 'Your RollCall session was renewed on this device.', message: 'Your local RollCall session was renewed. No action is required.', source: 'RollCall', timestamp: '2026-09-19T18:42:00+05:30', unread: false, metadata: [{ label: 'Device', value: 'This device' }] },
  { id: 'student-n6', category: 'IMPORTANT', title: 'Review course registration', preview: 'The sample course registration review closes on 30 September.', message: 'Review the subjects displayed in your academic profile before the sample course registration review closes.', source: 'Academic Office', timestamp: '2026-09-18T12:00:00+05:30', unread: false, priority: 'HIGH', destination: '/student/academic/events/course-registration-review?from=student-n6', actionLabel: 'View Important Date', metadata: [{ label: 'Deadline', value: '30 Sep · 5:00 PM' }] },
];

export const studentS3Client = {
  async schedule() { return studentSchedule; },
  async scheduleClass(id: string) { return studentSchedule.find((item) => item.id === id); },
  async academicInfo() { return studentAcademicInfo; },
  async academicEvents() { return studentAcademicEvents; },
  async academicEvent(id: string) { return studentAcademicEvents.find((item) => item.id === id); },
};
