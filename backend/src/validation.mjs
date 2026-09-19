import { AppError } from './errors.mjs';

export function validateLogin(input) {
  const loginIdentifier = typeof input?.loginIdentifier === 'string' ? input.loginIdentifier.trim().toLowerCase() : '';
  const password = typeof input?.password === 'string' ? input.password : '';
  const fields = {};
  if (!loginIdentifier || loginIdentifier.length > 254) fields.loginIdentifier = 'Enter a valid login identifier.';
  if (!password || password.length > 512) fields.password = 'Enter your password.';
  if (Object.keys(fields).length) throw new AppError(400, 'VALIDATION_ERROR', 'Check the highlighted fields.', fields);
  return { loginIdentifier, password };
}
