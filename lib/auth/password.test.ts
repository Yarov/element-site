// @vitest-environment node

import { randomBytes, scryptSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isSupportedPasswordHash, verifyPassword } from "@/lib/auth/password";

const password = "correct horse battery staple";
const salt = randomBytes(16);
const derivedKey = scryptSync(password, salt, 64, {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
});
const passwordHash = `scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;

describe("password verification", () => {
  it("accepts the supported scrypt format and the matching password", async () => {
    expect(isSupportedPasswordHash(passwordHash)).toBe(true);
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
  });

  it("rejects invalid formats and nonmatching passwords", async () => {
    expect(isSupportedPasswordHash("$2b$12$unsupported")).toBe(false);
    await expect(verifyPassword("incorrect", passwordHash)).resolves.toBe(
      false,
    );
    await expect(
      verifyPassword(password, "scrypt$1$1$1$salt$key"),
    ).resolves.toBe(false);
  });
});
