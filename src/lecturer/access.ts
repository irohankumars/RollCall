import type { AuthenticatedUser } from '@/auth/types';

export type LecturerAccess = {
  isClassTeacher: boolean;
  classTeacherSubjectCode?: string;
};

const lecturerAssignments: Record<string, LecturerAccess> = {
  'lecturer@development.local': {
    isClassTeacher: true,
    classTeacherSubjectCode: 'CS401',
  },
};

const ordinaryLecturer: LecturerAccess = { isClassTeacher: false };

export function lecturerAccessFor(user?: AuthenticatedUser | null): LecturerAccess {
  if (!user || user.role !== 'LECTURER') return ordinaryLecturer;
  return lecturerAssignments[user.loginIdentifier.toLowerCase()] ?? ordinaryLecturer;
}
