export const Roles = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  COLLEGE_ADMIN: 'COLLEGE_ADMIN',
  HOD: 'HOD',
  LECTURER: 'LECTURER',
  STUDENT: 'STUDENT',
});
export const roleValues = Object.freeze(Object.values(Roles));
export const collegeScopedRoles = Object.freeze(roleValues.filter((role) => role !== Roles.SUPER_ADMIN));
