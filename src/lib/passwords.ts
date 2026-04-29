import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(value: string) {
  return value.trim().length >= MIN_PASSWORD_LENGTH;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = scryptSync(password, salt, SCRYPT_KEYLEN);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (computedHash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedHash, storedHashBuffer);
}
