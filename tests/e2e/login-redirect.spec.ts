import { test, expect } from "@playwright/test";

/**
 * Deliberately stops at the boundary of Google's real OAuth UI. Everything
 * past this redirect (the signIn/session callbacks, the beta-check call,
 * JWT minting) is covered by mocked unit tests in lib/auth.test.ts instead —
 * see README.md's Testing section for why.
 */
test("signing in redirects to Google's OAuth endpoint", async ({ page }) => {
  await page.goto("/login");

  await Promise.all([
    page.waitForURL(/accounts\.google\.com/),
    page.getByRole("button", { name: "Sign in with Google" }).click(),
  ]);

  expect(page.url()).toContain("accounts.google.com");
});
