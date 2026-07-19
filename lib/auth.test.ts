// @vitest-environment node
//
// This file tests server-only auth logic (JWT signing via `jose`, which
// relies on Node's crypto internals). jsdom's separate global realm makes
// `TextEncoder`'s output fail jose's `instanceof Uint8Array` checks, so
// this suite runs in the "node" environment instead of the project default.
import { describe, it, expect, vi, afterEach } from "vitest";
import { jwtVerify } from "jose";
import { authOptions } from "./auth";

describe("authOptions.callbacks.session", () => {
  it("mints an HS256 JWT carrying email and sub, verifiable with NEXTAUTH_SECRET", async () => {
    const session = { user: { name: "Test User" } } as never;
    const token = { email: "user@example.com", sub: "12345" } as never;

    const result = await authOptions.callbacks!.session!({
      session,
      token,
    } as never);

    expect(result.backendToken).toBeTruthy();

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(result.backendToken as string, secret);
    expect(payload.email).toBe("user@example.com");
    expect(payload.sub).toBe("12345");
    expect(payload.exp).toBeDefined();
  });
});

describe("authOptions.callbacks.signIn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when the user has no email", async () => {
    const result = await authOptions.callbacks!.signIn!({
      user: {},
    } as never);
    expect(result).toBe(false);
  });

  it("returns true when the beta-check responds ok, calling the correct endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await authOptions.callbacks!.signIn!({
      user: { email: "user@example.com" },
    } as never);

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.BACKEND_URL}/auth/check-beta`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-internal-secret": process.env.INTERNAL_SECRET,
        }),
        body: JSON.stringify({ email: "user@example.com" }),
      })
    );
  });

  it("returns false when the beta-check responds non-ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false } as Response));

    const result = await authOptions.callbacks!.signIn!({
      user: { email: "user@example.com" },
    } as never);

    expect(result).toBe(false);
  });

  it("returns false when the beta-check request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await authOptions.callbacks!.signIn!({
      user: { email: "user@example.com" },
    } as never);

    expect(result).toBe(false);
  });
});
