import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16); const derived = await scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, n, r, p, saltText, hashText] = encoded.split('$');
  if (algorithm !== 'scrypt' || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, 'base64url'); const actual = Buffer.from(await scrypt(password, Buffer.from(saltText, 'base64url'), expected.length, { N: Number(n), r: Number(r), p: Number(p) }));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
