import { describe, expect, it } from "vitest";
import { extractIdentityInfo, formatIdentity, sanitizeLogData } from "../types";

describe("extractIdentityInfo", () => {
  it("returns public for null/undefined", () => {
    expect(extractIdentityInfo(null)).toEqual({ identity: "public" });
    expect(extractIdentityInfo(undefined)).toEqual({ identity: "public" });
  });
  it("extracts user/organization/role", () => {
    expect(
      extractIdentityInfo({ user: { id: "u1" }, organization: { id: "o1", role: "admin" } })
    ).toEqual({ userId: "u1", organization: "o1", role: "admin" });
  });
  it("extracts id", () => {
    expect(extractIdentityInfo({ id: "x" })).toEqual({ userId: "x" });
  });
  it("extracts identity", () => {
    expect(extractIdentityInfo({ identity: "system" })).toEqual({ identity: "system" });
  });
});

describe("sanitizeLogData", () => {
  it("redacts sensitive fields", () => {
    expect(
      sanitizeLogData({ email: "a@b.com", token: "abc", password: "123", foo: "bar" })
    ).toEqual({ email: "[REDACTED]", token: "[REDACTED]", password: "[REDACTED]", foo: "bar" });
  });
  it("recursively redacts nested sensitive fields", () => {
    expect(
      sanitizeLogData({ user: { email: "a@b.com", token: "abc" }, data: { password: "123" } })
    ).toEqual({
      user: { email: "[REDACTED]", token: "[REDACTED]" },
      data: { password: "[REDACTED]" },
    });
  });
});

describe("formatIdentity", () => {
  it("formats userId/org/role", () => {
    expect(formatIdentity({ userId: "u", organization: "o", role: "r" })).toBe(
      "userId: u | org: o | role: r"
    );
  });
  it("formats identity fallback", () => {
    expect(formatIdentity({ identity: "system" })).toBe("identity: system");
  });
  it("returns unknown if no info", () => {
    expect(formatIdentity({})).toBe("unknown");
  });
});
