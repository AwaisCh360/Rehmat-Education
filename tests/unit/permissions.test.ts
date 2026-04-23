import { describe, expect, it } from "vitest";

import { isAdmin, isAgent } from "@/lib/auth/permissions";

describe("role helpers", () => {
  it("identifies admin and agent roles", () => {
    expect(isAdmin({ role: "ADMIN" })).toBe(true);
    expect(isAdmin({ role: "AGENT" })).toBe(false);
    expect(isAgent({ role: "AGENT" })).toBe(true);
    expect(isAgent({ role: "ADMIN" })).toBe(false);
  });
});
