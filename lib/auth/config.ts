import { isSupportedPasswordHash } from "@/lib/auth/password";

export const ADMIN_ROLE = "admin";

interface AuthConfiguration {
  username: string;
  passwordHash: string;
  secret: string;
}

export function getAuthConfiguration(): AuthConfiguration | null {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const secret = process.env.AUTH_SECRET?.trim();

  if (
    !username ||
    !isValidUsername(username) ||
    !passwordHash ||
    !isSupportedPasswordHash(passwordHash) ||
    !secret ||
    secret.length < 32
  ) {
    return null;
  }

  return { username, passwordHash, secret };
}

function isValidUsername(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,63}$/.test(value);
}
