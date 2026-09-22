import { lecturerClient } from './lecturer-client';
import type { LecturerClass, LecturerStudent, SessionSummary } from './types';

export type LecturerSearchStudent = LecturerStudent & {
  classId: string;
  subjectCode: string;
  batchName: string;
};

export type LecturerSearchData = {
  classes: LecturerClass[];
  students: LecturerSearchStudent[];
  sessions: SessionSummary[];
};

export async function loadLecturerSearchData(token: string): Promise<LecturerSearchData> {
  const [classes, history] = await Promise.all([
    lecturerClient.classes(token),
    lecturerClient.history(token),
  ]);
  const allowedClassIds = new Set(classes.map((item) => item.id));
  const rosters = await Promise.all(classes.map(async (item) => {
    const students = await lecturerClient.roster(token, item.id);
    return students.map((student) => ({
      ...student,
      classId: item.id,
      subjectCode: item.subjectCode,
      batchName: item.batchName,
    }));
  }));

  return {
    classes,
    students: rosters.flat(),
    sessions: history
      .filter((item) => item.status === 'COMPLETED' && allowedClassIds.has(item.classId))
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
  };
}
