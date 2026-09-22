import type { AuthenticatedUser } from '@/auth/types';

export type HodAccess = {
  isClassTeacher: boolean;
  classTeacherSubjectCode?: string;
};

const hodAssignments: Record<string, HodAccess> = {
  'hod@development.local': {
    isClassTeacher: true,
    classTeacherSubjectCode: 'CS401',
  },
};

const ordinaryHod: HodAccess = { isClassTeacher: false };

export function hodAccessFor(user?: AuthenticatedUser | null): HodAccess {
  if (!user || user.role !== 'HOD') return ordinaryHod;
  return hodAssignments[user.loginIdentifier.toLowerCase()] ?? ordinaryHod;
}

