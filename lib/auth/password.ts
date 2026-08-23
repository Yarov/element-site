import { scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SCRYPT_KEY_LENGTH = 64;

interface ScryptPasswordHash {
  salt: Buffer;
  derivedKey: Buffer;
}

export function isSupportedPasswordHash(passwordHash: string): boolean {
  return parseScryptPasswordHash(passwordHash) !== null;
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const parsed = parseScryptPasswordHash(passwordHash);
  if (!parsed) return false;

  try {
    const derivedKey = await deriveScryptKey(password, parsed.salt);

    return timingSafeEqual(derivedKey, parsed.derivedKey);
  } catch {
    return false;
  }
}

function deriveScryptKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      {
        cost: SCRYPT_COST,
        blockSize: SCRYPT_BLOCK_SIZE,
        parallelization: SCRYPT_PARALLELIZATION,
        maxmem: 32 * 1024 * 1024,
      },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

function parseScryptPasswordHash(
  passwordHash: string,
): ScryptPasswordHash | null {
  const [
    algorithm,
    cost,
    blockSize,
    parallelization,
    salt,
    derivedKey,
    ...extra
  ] = passwordHash.split("$");

  if (
    algorithm !== "scrypt" ||
    cost !== String(SCRYPT_COST) ||
    blockSize !== String(SCRYPT_BLOCK_SIZE) ||
    parallelization !== String(SCRYPT_PARALLELIZATION) ||
    !salt ||
    !derivedKey ||
    extra.length > 0
  ) {
    return null;
  }

  const decodedSalt = decodeBase64Url(salt);
  const decodedKey = decodeBase64Url(derivedKey);
  if (
    !decodedSalt ||
    decodedSalt.length < 16 ||
    !decodedKey ||
    decodedKey.length !== SCRYPT_KEY_LENGTH
  ) {
    return null;
  }

  return { salt: decodedSalt, derivedKey: decodedKey };
}

function decodeBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;

  const decoded = Buffer.from(value, "base64url");
  return decoded.toString("base64url") === value ? decoded : null;
}
