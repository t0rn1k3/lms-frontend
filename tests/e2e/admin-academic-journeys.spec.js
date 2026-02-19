const { test, expect } = require("@playwright/test");

function jsonResponse(route, payload, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

async function forceEnglishLocale(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("i18nextLng", "en");
  });
}

async function loginAsAdmin(page) {
  await page.goto("/login/admin");
  await page.fill("#email", "admin@school.com");
  await page.fill("#password", "Password123!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function mockAcademicApi(page) {
  const db = {
    academicYears: [],
    programs: [],
    subjects: [],
    classLevels: [
      { _id: "cl-1", name: "Grade 10" },
      { _id: "cl-2", name: "Grade 11" },
    ],
    academicTerms: [{ _id: "term-1", name: "1st term" }],
  };

  let yearCounter = 1;
  let programCounter = 1;
  let subjectCounter = 1;

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname;

    if (method === "POST" && path.endsWith("/admins/login")) {
      return jsonResponse(route, { status: "success", data: "admin-token" });
    }

    if (method === "GET" && path.endsWith("/academic-years")) {
      return jsonResponse(route, { status: "success", data: db.academicYears });
    }

    if (method === "POST" && path.endsWith("/academic-years")) {
      const body = request.postDataJSON();
      const item = {
        _id: `year-${yearCounter++}`,
        name: body.name,
        fromYear: body.fromYear,
        toYear: body.toYear,
      };
      db.academicYears.push(item);
      return jsonResponse(route, { status: "success", data: item });
    }

    if (method === "PUT" && /\/academic-years\/[^/]+$/.test(path)) {
      const yearId = path.split("/").pop();
      const body = request.postDataJSON();
      db.academicYears = db.academicYears.map((year) =>
        year._id === yearId ? { ...year, ...body } : year,
      );
      const updated = db.academicYears.find((year) => year._id === yearId);
      return jsonResponse(route, { status: "success", data: updated || {} });
    }

    if (method === "DELETE" && /\/academic-years\/[^/]+$/.test(path)) {
      const yearId = path.split("/").pop();
      db.academicYears = db.academicYears.filter((year) => year._id !== yearId);
      return jsonResponse(route, { status: "success", data: {} });
    }

    if (method === "GET" && path.endsWith("/class-levels")) {
      return jsonResponse(route, { status: "success", data: db.classLevels });
    }

    if (method === "GET" && path.endsWith("/academic-terms")) {
      return jsonResponse(route, { status: "success", data: db.academicTerms });
    }

    if (method === "GET" && path.endsWith("/programs")) {
      return jsonResponse(route, { status: "success", data: db.programs });
    }

    if (method === "POST" && path.endsWith("/programs")) {
      const body = request.postDataJSON();
      const item = {
        _id: `program-${programCounter++}`,
        name: body.name,
        description: body.description,
        duration: body.duration,
        classLevels: body.classLevels || [],
        subjects: [],
      };
      db.programs.push(item);
      return jsonResponse(route, { status: "success", data: item });
    }

    if (method === "GET" && path.endsWith("/subjects")) {
      return jsonResponse(route, { status: "success", data: db.subjects });
    }

    if (method === "POST" && /\/subjects\/[^/]+$/.test(path)) {
      const body = request.postDataJSON();
      const programId = path.split("/").pop();
      const item = {
        _id: `subject-${subjectCounter++}`,
        name: body.name,
        description: body.description,
        academicTerm: body.academicTerm || "",
      };

      db.subjects.push(item);
      db.programs = db.programs.map((program) =>
        program._id === programId
          ? { ...program, subjects: [...(program.subjects || []), item._id] }
          : program,
      );

      return jsonResponse(route, { status: "success", data: item });
    }

    // Safe defaults for requests we do not explicitly assert in this pack.
    return jsonResponse(route, { status: "success", data: [] });
  });
}

test.describe("Admin academic journey pack", () => {
  test("admin can create, edit, and delete an academic year", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAcademicApi(page);
    await loginAsAdmin(page);

    await page.goto("/admin/academic-years");
    await expect(page.getByText("No academic years yet.")).toBeVisible();

    await page.getByRole("button", { name: "Add Academic Year" }).click();
    await page.getByPlaceholder("e.g. 2024/2025").fill("2026/2027");
    await page.locator('input[type="date"]').nth(0).fill("2026-09-01");
    await page.locator('input[type="date"]').nth(1).fill("2027-06-30");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("cell", { name: "2026/2027" })).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByPlaceholder("e.g. 2024/2025").fill("2026/2027 Updated");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByRole("cell", { name: "2026/2027 Updated" }),
    ).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).first().click();

    await expect(page.getByText("No academic years yet.")).toBeVisible();
  });

  test("admin can create a program and then create a subject under it", async ({
    page,
  }) => {
    await forceEnglishLocale(page);
    await mockAcademicApi(page);
    await loginAsAdmin(page);

    await page.goto("/admin/programs");
    await page.getByRole("button", { name: "Add Program" }).click();
    await page.getByPlaceholder("e.g. Computer Science").fill("Computer Science");
    await page.getByPlaceholder("Program description").fill("CS core track");
    await page.getByPlaceholder("e.g. 4 years").fill("4 years");
    await page.getByText("Grade 10").click();
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByRole("cell", { name: "Computer Science" }),
    ).toBeVisible();
    await expect(page.getByText("Grade 10")).toBeVisible();

    await page.goto("/admin/subjects");
    await page.getByRole("button", { name: "Add Subject" }).click();
    await page.locator("select").nth(0).selectOption({ label: "Computer Science" });
    await page.getByPlaceholder("e.g. Mathematics").fill("Algorithms");
    await page.getByPlaceholder("Subject description").fill("Algorithm design basics");
    await page.locator("select").nth(1).selectOption({ label: "1st term" });
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("cell", { name: "Algorithms" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Computer Science" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "1st term" })).toBeVisible();
  });
});
