import { randomBytes, scryptSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthConfiguration } from "./config";

const password = "correct horse battery staple";
const salt = randomBytes(16);
const derivedKey = scryptSync(password, salt, 64, {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
});
const passwordHash = `scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;

afterEach(() => vi.unstubAllEnvs());

describe("authentication configuration", () => {
  it("fails closed when a required credential is missing or invalid", () => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD_HASH", passwordHash);
    vi.stubEnv("AUTH_SECRET", "");
    expect(getAuthConfiguration()).toBeNull();

    vi.stubEnv("AUTH_SECRET", "a".repeat(32));
    vi.stubEnv("ADMIN_PASSWORD_HASH", "invalid");
    expect(getAuthConfiguration()).toBeNull();
  });

  it("normalizes a complete bootstrap administrator configuration", () => {
    vi.stubEnv("ADMIN_USERNAME", " Admin ");
    vi.stubEnv("ADMIN_PASSWORD_HASH", passwordHash);
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));

    expect(getAuthConfiguration()).toEqual({
      username: "admin",
      passwordHash,
      secret: "a".repeat(32),
    });
  });
});
