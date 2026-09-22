import React, { createContext, useCallback, useMemo, useState } from 'react';

export type EntityStatus = 'Active' | 'Inactive' | 'Pending';
export type AcademicYear = { id: string; name: string; period: string; current: boolean; status: EntityStatus };
export type Semester = { id: string; name: string; academicYearId: string; current: boolean; status: EntityStatus };
export type Batch = { id: string; name: string; semesterId: string; studentCount: number; status: EntityStatus };
export type ClassSection = { id: string; name: string; academicYearId: string; semesterId: string; batchId: string; studentCount: number; classTeacherId?: string; status: EntityStatus };
export type DepartmentStudent = { id: string; name: string; usn: string; email: string; semesterId: string; batchId: string; sectionId: string; attendance: number; status: EntityStatus };
export type DepartmentLecturer = { id: string; name: string; employeeId: string; email: string; phone?: string; status: EntityStatus; invitationStatus?: 'Pending' | 'Sent' };
export type DepartmentSubject = { id: string; name: string; code: string; academicYearId: string; semesterId: string; batchId: string; credits: number; status: EntityStatus };
export type TeachingAssignment = { id: string; subjectId: string; sectionId: string; lecturerId: string; active: boolean };

type NewStudent = Omit<DepartmentStudent, 'id' | 'attendance' | 'status'>;
type NewLecturer = Pick<DepartmentLecturer, 'name' | 'employeeId' | 'email' | 'phone'>;
type NewSubject = Omit<DepartmentSubject, 'id' | 'status'>;
type NewSection = Omit<ClassSection, 'id' | 'studentCount' | 'classTeacherId' | 'status'>;

type ManagementContextValue = {
  department: { id: string; name: string; code: string; hodName: string };
  academicYears: AcademicYear[]; semesters: Semester[]; batches: Batch[]; sections: ClassSection[];
  students: DepartmentStudent[]; lecturers: DepartmentLecturer[]; subjects: DepartmentSubject[]; assignments: TeachingAssignment[];
  addStudent: (value: NewStudent) => DepartmentStudent; updateStudent: (id: string, value: Pick<DepartmentStudent, 'name' | 'email'>) => void; updateStudentPlacement: (id: string, placement: Pick<DepartmentStudent, 'semesterId' | 'batchId' | 'sectionId'>) => void; toggleStudent: (id: string) => void;
  inviteLecturer: (value: NewLecturer) => DepartmentLecturer; toggleLecturer: (id: string) => void;
  addAcademicYear: (name: string, period: string) => void; updateAcademicYear: (id: string, name: string, period: string) => void; activateAcademicYear: (id: string) => void; archiveAcademicYear: (id: string) => void;
  addSemester: (name: string, academicYearId: string) => void; updateSemester: (id: string, name: string, academicYearId: string) => void; activateSemester: (id: string) => void; toggleSemester: (id: string) => void;
  addBatch: (name: string, semesterId: string) => void; updateBatch: (id: string, name: string, semesterId: string) => void; toggleBatch: (id: string) => void;
  addSubject: (value: NewSubject) => DepartmentSubject;
  addSection: (value: NewSection) => ClassSection;
  assignLecturer: (subjectId: string, sectionId: string, lecturerId: string, replace?: boolean) => 'assigned' | 'conflict'; removeAssignment: (id: string) => void;
  assignClassTeacher: (sectionId: string, lecturerId?: string) => void;
};

const ManagementContext = createContext<ManagementContextValue | null>(null);
const hodLecturer: DepartmentLecturer = { id: 'me', name: 'Dr. Vikram Shah (Me)', employeeId: 'HOD-CSE-01', email: 'hod@development.local', status: 'Active' };

const initialYears: AcademicYear[] = [
  { id: 'ay-2026', name: '2026–27', period: 'July 2026 – June 2027', current: true, status: 'Active' },
  { id: 'ay-2025', name: '2025–26', period: 'July 2025 – June 2026', current: false, status: 'Inactive' },
];
const initialSemesters: Semester[] = [
  { id: 'sem-7', name: 'Semester 7', academicYearId: 'ay-2026', current: true, status: 'Active' },
  { id: 'sem-5', name: 'Semester 5', academicYearId: 'ay-2026', current: true, status: 'Active' },
  { id: 'sem-6', name: 'Semester 6', academicYearId: 'ay-2025', current: false, status: 'Inactive' },
];
const initialBatches: Batch[] = [
  { id: 'batch-2024', name: 'Batch 2024', semesterId: 'sem-7', studentCount: 6, status: 'Active' },
  { id: 'batch-2025', name: 'Batch 2025', semesterId: 'sem-5', studentCount: 6, status: 'Active' },
];
const initialLecturers: DepartmentLecturer[] = [
  hodLecturer,
  { id: 'lec-ananya', name: 'Dr. Ananya Rao', employeeId: 'CSE-104', email: 'ananya.rao@development.local', phone: '+91 98765 41004', status: 'Active' },
  { id: 'lec-rahul', name: 'Prof. Rahul Sen', employeeId: 'CSE-112', email: 'rahul.sen@development.local', status: 'Active' },
  { id: 'lec-nikhil', name: 'Prof. Nikhil Kumar', employeeId: 'CSE-118', email: 'nikhil.kumar@development.local', status: 'Pending', invitationStatus: 'Sent' },
];
const initialSections: ClassSection[] = [
  { id: 'section-7a', name: 'CSE 2024 A', academicYearId: 'ay-2026', semesterId: 'sem-7', batchId: 'batch-2024', studentCount: 6, classTeacherId: 'me', status: 'Active' },
  { id: 'section-5b', name: 'CSE 2025 B', academicYearId: 'ay-2026', semesterId: 'sem-5', batchId: 'batch-2025', studentCount: 6, classTeacherId: 'lec-ananya', status: 'Active' },
];
const studentNames = ['Aarav Mehta', 'Diya Sharma', 'Ishaan Verma', 'Meera Nair', 'Rohan Gupta', 'Sara Khan'];
const initialStudents: DepartmentStudent[] = studentNames.map((name, index) => ({ id: `student-${index + 1}`, name, usn: `CSE24${String(index + 1).padStart(3, '0')}`, email: `${name.toLowerCase().replace(' ', '.')}@development.local`, semesterId: 'sem-7', batchId: 'batch-2024', sectionId: 'section-7a', attendance: [78, 84, 69, 91, 74, 87][index], status: 'Active' }));
const initialSubjects: DepartmentSubject[] = [
  { id: 'subject-ml', name: 'Machine Learning', code: 'CS401', academicYearId: 'ay-2026', semesterId: 'sem-7', batchId: 'batch-2024', credits: 4, status: 'Active' },
  { id: 'subject-db', name: 'Database Systems', code: 'CS305', academicYearId: 'ay-2026', semesterId: 'sem-5', batchId: 'batch-2025', credits: 4, status: 'Active' },
  { id: 'subject-cn', name: 'Computer Networks', code: 'CS307', academicYearId: 'ay-2026', semesterId: 'sem-7', batchId: 'batch-2024', credits: 3, status: 'Active' },
];
const initialAssignments: TeachingAssignment[] = [
  { id: 'assignment-ml', subjectId: 'subject-ml', sectionId: 'section-7a', lecturerId: 'me', active: true },
  { id: 'assignment-db', subjectId: 'subject-db', sectionId: 'section-5b', lecturerId: 'lec-ananya', active: true },
];

function nextId(prefix: string) { return `${prefix}-${Date.now().toString(36)}`; }

export function HodManagementProvider({ children }: React.PropsWithChildren) {
  const [academicYears, setAcademicYears] = useState(initialYears); const [semesters, setSemesters] = useState(initialSemesters); const [batches, setBatches] = useState(initialBatches);
  const [sections, setSections] = useState(initialSections); const [students, setStudents] = useState(initialStudents); const [lecturers, setLecturers] = useState(initialLecturers);
  const [subjects, setSubjects] = useState(initialSubjects); const [assignments, setAssignments] = useState(initialAssignments);

  const addStudent = useCallback((value: NewStudent) => { if (students.some((item) => item.usn.toLowerCase() === value.usn.toLowerCase())) throw new Error('A student with this USN already exists.'); if (students.some((item) => item.email.toLowerCase() === value.email.toLowerCase())) throw new Error('A student with this email already exists.'); const item = { ...value, id: nextId('student'), attendance: 0, status: 'Active' as const }; setStudents((current) => [...current, item]); setSections((current) => current.map((section) => section.id === value.sectionId ? { ...section, studentCount: section.studentCount + 1 } : section)); return item; }, [students]);
  const updateStudent = useCallback((id: string, value: Pick<DepartmentStudent, 'name' | 'email'>) => { if (students.some((item) => item.id !== id && item.email.toLowerCase() === value.email.toLowerCase())) throw new Error('A student with this email already exists.'); setStudents((current) => current.map((item) => item.id === id ? { ...item, ...value } : item)); }, [students]);
  const updateStudentPlacement = useCallback((id: string, placement: Pick<DepartmentStudent, 'semesterId' | 'batchId' | 'sectionId'>) => { setStudents((current) => current.map((item) => item.id === id ? { ...item, ...placement } : item)); }, []);
  const toggleStudent = useCallback((id: string) => setStudents((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item)), []);
  const inviteLecturer = useCallback((value: NewLecturer) => { if (lecturers.some((item) => item.employeeId.toLowerCase() === value.employeeId.toLowerCase())) throw new Error('A lecturer with this employee ID already exists.'); if (lecturers.some((item) => item.email.toLowerCase() === value.email.toLowerCase())) throw new Error('A lecturer with this email already exists.'); const item = { ...value, id: nextId('lecturer'), status: 'Pending' as const, invitationStatus: 'Sent' as const }; setLecturers((current) => [...current, item]); return item; }, [lecturers]);
  const toggleLecturer = useCallback((id: string) => setLecturers((current) => current.map((item) => item.id === id && id !== 'me' ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item)), []);
  const addAcademicYear = useCallback((name: string, period: string) => setAcademicYears((current) => [...current, { id: nextId('year'), name, period, current: false, status: 'Active' }]), []);
  const updateAcademicYear = useCallback((id: string, name: string, period: string) => setAcademicYears((current) => current.map((item) => item.id === id ? { ...item, name, period } : item)), []);
  const activateAcademicYear = useCallback((id: string) => setAcademicYears((current) => current.map((item) => ({ ...item, current: item.id === id, status: item.id === id ? 'Active' : item.status }))), []);
  const archiveAcademicYear = useCallback((id: string) => setAcademicYears((current) => current.map((item) => item.id === id && !item.current ? { ...item, status: 'Inactive' } : item)), []);
  const addSemester = useCallback((name: string, academicYearId: string) => setSemesters((current) => [...current, { id: nextId('semester'), name, academicYearId, current: false, status: 'Active' }]), []);
  const updateSemester = useCallback((id: string, name: string, academicYearId: string) => setSemesters((current) => current.map((item) => item.id === id ? { ...item, name, academicYearId } : item)), []);
  const activateSemester = useCallback((id: string) => setSemesters((current) => current.map((item) => item.id === id ? { ...item, current: true, status: 'Active' } : item)), []);
  const toggleSemester = useCallback((id: string) => setSemesters((current) => current.map((item) => item.id === id && !item.current ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item)), []);
  const addBatch = useCallback((name: string, semesterId: string) => setBatches((current) => [...current, { id: nextId('batch'), name, semesterId, studentCount: 0, status: 'Active' }]), []);
  const updateBatch = useCallback((id: string, name: string, semesterId: string) => setBatches((current) => current.map((item) => item.id === id ? { ...item, name, semesterId } : item)), []);
  const toggleBatch = useCallback((id: string) => setBatches((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item)), []);
  const addSubject = useCallback((value: NewSubject) => { if (subjects.some((item) => item.code.toLowerCase() === value.code.toLowerCase() && item.academicYearId === value.academicYearId)) throw new Error('This subject code already exists in the selected academic year.'); const item = { ...value, id: nextId('subject'), status: 'Active' as const }; setSubjects((current) => [...current, item]); return item; }, [subjects]);
  const addSection = useCallback((value: NewSection) => { if (sections.some((item) => item.name.toLowerCase() === value.name.toLowerCase() && item.academicYearId === value.academicYearId && item.semesterId === value.semesterId)) throw new Error('This section already exists in the selected academic context.'); const item = { ...value, id: nextId('section'), studentCount: 0, status: 'Active' as const }; setSections((current) => [...current, item]); return item; }, [sections]);
  const assignLecturer = useCallback((subjectId: string, sectionId: string, lecturerId: string, replace = false) => { const existing = assignments.find((item) => item.subjectId === subjectId && item.sectionId === sectionId && item.active); if (existing && !replace) return 'conflict' as const; setAssignments((current) => [...current.map((item) => item.id === existing?.id ? { ...item, active: false } : item), { id: nextId('assignment'), subjectId, sectionId, lecturerId, active: true }]); return 'assigned' as const; }, [assignments]);
  const removeAssignment = useCallback((id: string) => setAssignments((current) => current.map((item) => item.id === id ? { ...item, active: false } : item)), []);
  const assignClassTeacher = useCallback((sectionId: string, lecturerId?: string) => setSections((current) => current.map((item) => item.id === sectionId ? { ...item, classTeacherId: lecturerId } : item)), []);
  const value = useMemo(() => ({ department: { id: 'dept-cse', name: 'Computer Science & Engineering', code: 'CSE', hodName: 'Dr. Vikram Shah' }, academicYears, semesters, batches, sections, students, lecturers, subjects, assignments, addStudent, updateStudent, updateStudentPlacement, toggleStudent, inviteLecturer, toggleLecturer, addAcademicYear, updateAcademicYear, activateAcademicYear, archiveAcademicYear, addSemester, updateSemester, activateSemester, toggleSemester, addBatch, updateBatch, toggleBatch, addSubject, addSection, assignLecturer, removeAssignment, assignClassTeacher }), [academicYears, semesters, batches, sections, students, lecturers, subjects, assignments, addStudent, updateStudent, updateStudentPlacement, toggleStudent, inviteLecturer, toggleLecturer, addAcademicYear, updateAcademicYear, activateAcademicYear, archiveAcademicYear, addSemester, updateSemester, activateSemester, toggleSemester, addBatch, updateBatch, toggleBatch, addSubject, addSection, assignLecturer, removeAssignment, assignClassTeacher]);
  return <ManagementContext value={value}>{children}</ManagementContext>;
}

export function useHodManagement() { const value = React.use(ManagementContext); if (!value) throw new Error('useHodManagement must be used within HodManagementProvider'); return value; }
