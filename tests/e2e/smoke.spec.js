const { test, expect } = require("@playwright/test");

test.describe("Public smoke flows", () => {
  test("home page renders and has expected metadata", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/EduManage/i);
    await expect(page.getByRole("img", { name: /EduManage/i }).first()).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});
