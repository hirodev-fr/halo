import { expect, test } from "bun:test";

import app from "../src/index";

const origin = "http://localhost:5173";
const password = "A-strong-test-password-123!";

const post = (path: string, body: unknown, cookie?: string) =>
  app.request(path, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin,
      ...(cookie ? { cookie } : {}),
    },
    method: "POST",
  });

const sessionCookie = (response: Response) =>
  response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

test("registration, sessions, protected access, and sign-out", async () => {
  const email = `test-${crypto.randomUUID()}@example.test`;
  const unauthenticated = await post("/rpc/privateData", { json: null });
  expect(unauthenticated.status).toBe(401);

  const signUp = await post("/api/auth/sign-up/email", {
    email,
    name: "Test User",
    password,
  });
  expect(signUp.status).toBe(200);
  const setCookies = signUp.headers.getSetCookie();
  expect(
    setCookies.some((value) => /session_token=.*HttpOnly/iu.test(value))
  ).toBe(true);
  expect(
    setCookies.some((value) => /session_token=.*Secure/iu.test(value))
  ).toBe(true);
  expect(
    setCookies.some((value) => /session_token=.*SameSite=None/iu.test(value))
  ).toBe(true);
  const cookie = sessionCookie(signUp);
  expect(cookie).toContain("session_token=");

  const session = await app.request("/api/auth/get-session", {
    headers: { cookie, origin },
  });
  expect(session.status).toBe(200);
  const sessionData = await session.json();
  expect(sessionData).toMatchObject({ user: { email } });

  const authorized = await post("/rpc/privateData", { json: null }, cookie);
  expect(authorized.status).toBe(200);
  const authorizedData = await authorized.json();
  expect(authorizedData).toMatchObject({ json: { user: { email } } });

  const forgedSignOut = await app.request("/api/auth/sign-out", {
    body: "{}",
    headers: {
      "content-type": "application/json",
      cookie,
      origin: "https://untrusted.example",
    },
    method: "POST",
  });
  expect(forgedSignOut.status).toBe(403);
  const stillAuthorized = await post(
    "/rpc/privateData",
    { json: null },
    cookie
  );
  expect(stillAuthorized.status).toBe(200);

  const signOut = await post("/api/auth/sign-out", {}, cookie);
  expect(signOut.status).toBe(200);
  const revoked = await post("/rpc/privateData", { json: null }, cookie);
  expect(revoked.status).toBe(401);

  const badPassword = await post("/api/auth/sign-in/email", {
    email,
    password: "incorrect-password",
  });
  expect(badPassword.status).toBe(401);
  const signIn = await post("/api/auth/sign-in/email", { email, password });
  expect(signIn.status).toBe(200);
  const signedInCookie = sessionCookie(signIn);
  expect(signedInCookie).toContain("session_token=");
  const signedInAccess = await post(
    "/rpc/privateData",
    { json: null },
    signedInCookie
  );
  expect(signedInAccess.status).toBe(200);
});

test("rejects untrusted origins and invalid registration input", async () => {
  const untrusted = await app.request("/api/auth/sign-up/email", {
    body: JSON.stringify({
      email: "test@example.test",
      name: "Test",
      password,
    }),
    headers: {
      "content-type": "application/json",
      origin: "https://untrusted.example",
    },
    method: "POST",
  });
  expect(untrusted.status).toBe(403);

  const invalid = await post("/api/auth/sign-up/email", {
    email: "not-an-email",
    name: "Test",
    password,
  });
  expect(invalid.status).toBe(400);
});

test("allows credentialed CORS only for the configured origin", async () => {
  const trusted = await app.request("/api/auth/get-session", {
    headers: { origin },
  });
  expect(trusted.headers.get("access-control-allow-origin")).toBe(origin);
  expect(trusted.headers.get("access-control-allow-credentials")).toBe("true");

  const untrusted = await app.request("/api/auth/get-session", {
    headers: { origin: "https://untrusted.example" },
  });
  expect(untrusted.headers.get("access-control-allow-origin")).not.toBe(
    "https://untrusted.example"
  );
});
