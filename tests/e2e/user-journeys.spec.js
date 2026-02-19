const { test, expect } = require("@playwright/test");

const ROLES = ["admin", "teacher", "student"];

async function mockApiForJourneys(page) {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname;

    if (method === "POST" && path.endsWith("/admins/login")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", data: "admin-token" }),
      });
    }

    if (method === "POST" && path.endsWith("/teachers/login")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", data: "teacher-token" }),
      });
    }

    if (method === "POST" && path.endsWith("/students/login")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", data: "student-token" }),
      });
    }

    // Provide safe defaults for dashboard/profile requests after login.
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", data: [] }),
    });
  });
}

async function forceEnglishLocale(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("i18nextLng", "en");
  });
}

test.describe("Real user journey flows", () => {
  for (const role of ROLES) {
    test(`${role} can access protected route, login, and logout`, async ({
      page,
    }) => {
      await forceEnglishLocale(page);
      await mockApiForJourneys(page);

      // Unauthenticated access should redirect to login page.
      await page.goto(`/${role}`);
      await expect(page).toHaveURL(/\/login/);
      await page.goto(`/login/${role}`);
      await expect(page).toHaveURL(new RegExp(`/login/${role}$`));

      await page.fill("#email", `${role}@school.com`);
      await page.fill("#password", "Password123!");
      await page.locator('form button[type="submit"]').click();

      await expect(page).toHaveURL(new RegExp(`/${role}$`));

      const authState = await page.evaluate(() => {
        const raw = window.localStorage.getItem("lms-auth");
        return raw ? JSON.parse(raw) : null;
      });

      expect(authState).not.toBeNull();
      expect(authState.state.role).toBe(role);
      expect(authState.state.token).toContain(role);

      await page.getByRole("button", { name: `${role}@school.com` }).click();
      await page.getByRole("button", { name: /logout/i }).click();

      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test("shows API error on invalid login", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/admins/login", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          status: "failed",
          message: "Invalid credentials",
        }),
      });
    });

    await page.goto("/login/admin");

    await page.fill("#email", "admin@school.com");
    await page.fill("#password", "wrong-password");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page).toHaveURL(/\/login\/admin$/);
  });
});
