import { describe, expect, it } from "vitest";
import {
  parseAdminEmails,
  verifyAdminCredentials,
} from "@/server/admin-credentials";

const config = {
  adminEmails: "Owner@Example.com, second@example.com",
  adminPassword: "correct-horse-battery",
};

describe("parseAdminEmails", () => {
  it("trims, lowercases and drops empty entries", () => {
    expect(parseAdminEmails(" A@x.com, ,b@X.com ")).toEqual(["a@x.com", "b@x.com"]);
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});

describe("verifyAdminCredentials", () => {
  it("accepts a listed email with the right password (case-insensitive email)", () => {
    expect(verifyAdminCredentials("owner@example.com", "correct-horse-battery", config)).toBe(true);
    expect(verifyAdminCredentials(" SECOND@example.com ", "correct-horse-battery", config)).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(verifyAdminCredentials("owner@example.com", "admin123", config)).toBe(false);
  });

  it("rejects an email that is not an admin", () => {
    expect(verifyAdminCredentials("attacker@example.com", "correct-horse-battery", config)).toBe(false);
  });

  it("disables admin login when ADMIN_PASSWORD is unset (no default password)", () => {
    const noPassword = { ...config, adminPassword: undefined };
    expect(verifyAdminCredentials("owner@example.com", "admin123", noPassword)).toBe(false);
    expect(verifyAdminCredentials("owner@example.com", "", noPassword)).toBe(false);
  });

  it("disables admin login when ADMIN_PASSWORD is too short", () => {
    const weak = { ...config, adminPassword: "short" };
    expect(verifyAdminCredentials("owner@example.com", "short", weak)).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(verifyAdminCredentials(undefined, undefined, config)).toBe(false);
    expect(verifyAdminCredentials(["owner@example.com"], "correct-horse-battery", config)).toBe(false);
  });
});
