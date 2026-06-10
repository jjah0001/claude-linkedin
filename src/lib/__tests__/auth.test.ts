// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

import { createSession } from "@/lib/auth";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");
const COOKIE_NAME = "auth-token";

beforeEach(() => {
  vi.clearAllMocks();
});

test("sets the auth-token cookie", async () => {
  await createSession("user-1", "user@example.com");
  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  expect(mockCookieStore.set.mock.calls[0][0]).toBe(COOKIE_NAME);
});

test("token encodes userId and email", async () => {
  await createSession("user-abc", "test@example.com");
  const token = mockCookieStore.set.mock.calls[0][1] as string;
  const { payload } = await jwtVerify(token, JWT_SECRET);
  expect(payload.userId).toBe("user-abc");
  expect(payload.email).toBe("test@example.com");
});

test("token expires in ~7 days", async () => {
  await createSession("user-1", "user@example.com");
  const token = mockCookieStore.set.mock.calls[0][1] as string;
  const { payload } = await jwtVerify(token, JWT_SECRET);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expiresIn = payload.exp! * 1000 - Date.now();
  expect(expiresIn).toBeGreaterThan(sevenDaysMs - 5000);
  expect(expiresIn).toBeLessThanOrEqual(sevenDaysMs);
});

test("cookie is httpOnly", async () => {
  await createSession("user-1", "user@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.httpOnly).toBe(true);
});

test("cookie sameSite is lax", async () => {
  await createSession("user-1", "user@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.sameSite).toBe("lax");
});

test("cookie path is /", async () => {
  await createSession("user-1", "user@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.path).toBe("/");
});

test("cookie is not secure outside production", async () => {
  await createSession("user-1", "user@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.secure).toBe(false);
});
