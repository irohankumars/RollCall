export type StudentAttendanceStatus = 'good' | 'attention' | 'low';

export type StudentIdentity = {
  id: string;
  name: string;
  rollNumber: string;
  programme: string;
  semester: string;
};

export type AttendanceSummary = {
  percentage: number;
  present: number;
  absent: number;
  total: number;
  threshold: number;
  status: StudentAttendanceStatus;
};

export type StudentSubject = AttendanceSummary & {
  id: string;
  code: string;
  name: string;
  lecturer: string;
};

export type TodayClass = {
  id: string;
  subjectId: string;
  subject: string;
  code: string;
  lecturer: string;
  time: string;
  duration: string;
  room?: string;
  status: 'completed' | 'current' | 'upcoming';
  attendance?: 'Present' | 'Absent';
  context?: string;
};

export type StudentRecentActivity = {
  id: string;
  subject: string;
  detail: string;
  timestamp: string;
  status: 'confirmed' | 'updated' | 'recorded';
};

export type StudentHomeData = {
  student: StudentIdentity;
  attendance?: AttendanceSummary;
  today: TodayClass[];
  subjects: StudentSubject[];
  activity: StudentRecentActivity[];
  unreadNotifications: number;
};

export type StudentAttendanceMark = 'PRESENT' | 'ABSENT';
export type StudentAttendanceSession = {
  id: string;
  subjectId: string;
  subject: string;
  code: string;
  lecturer: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  room?: string;
  sessionStatus: 'Completed';
  confirmation: 'Confirmed' | 'Pending confirmation';
  recordedAt: string;
  attendance: StudentAttendanceMark;
  information: string;
};

export type StudentSubjectAttendance = StudentSubject & {
  recentSessions: StudentAttendanceSession[];
};

export type StudentAttendanceOverview = {
  summary: AttendanceSummary;
  subjects: StudentSubject[];
};

export type AttendanceIssueType = 'ABSENT_INCORRECT' | 'MISSING' | 'INCORRECT_INFORMATION' | 'OTHER';
export type AttendanceIssueStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
export type AttendanceIssue = {
  id: string;
  type: AttendanceIssueType;
  sessionId: string;
  explanation: string;
  status: AttendanceIssueStatus;
  submittedAt: string;
};

export type StudentNotificationCategory = 'ATTENDANCE' | 'ATTENDANCE_ISSUE' | 'ACADEMIC' | 'SYSTEM' | 'IMPORTANT';
export type StudentNotification = {
  id: string;
  category: StudentNotificationCategory;
  title: string;
  preview: string;
  message: string;
  source: string;
  timestamp: string;
  unread: boolean;
  priority?: 'HIGH';
  destination?: string;
  actionLabel?: string;
  subject?: string;
  metadata: { label: string; value: string }[];
};

export type ScheduleClassStatus = 'completed' | 'current' | 'next' | 'upcoming';
export type StudentScheduleClass = {
  id: string;
  date: string;
  subjectId: string;
  subject: string;
  code: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  room?: string;
  status: ScheduleClassStatus;
  academicInformation?: string;
};

export type StudentAcademicInfo = {
  department: string;
  programme: string;
  semester: string;
  academicYear: string;
  batch: string;
  currentPeriod: string;
};

export type AcademicEventCategory = 'EXAM' | 'ACADEMIC' | 'INSTITUTIONAL' | 'MILESTONE';
export type StudentAcademicEvent = {
  id: string;
  title: string;
  category: AcademicEventCategory;
  date: string;
  time?: string;
  location?: string;
  description: string;
  information?: string;
  notificationId?: string;
};

export type StudentRecentItem = {
  id: string;
  kind: 'SUBJECT' | 'ATTENDANCE' | 'ACADEMIC_EVENT';
  title: string;
  detail: string;
  href: string;
  viewedAt: string;
};

export type StudentNotificationPreferences = {
  attendance: boolean;
  attendanceIssues: boolean;
  academic: boolean;
  important: boolean;
  system: boolean;
};
