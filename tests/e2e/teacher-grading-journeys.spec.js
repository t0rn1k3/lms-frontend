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

async function loginAsTeacher(page) {
  await page.goto("/login/teacher");
  await page.fill("#email", "teacher@school.com");
  await page.fill("#password", "Password123!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/teacher$/);
}

async function mockTeacherExamResultApi(page) {
  const result = {
    _id: "result-1",
    exam: { _id: "exam-1", name: "Math Midterm" },
    studentId: "ST-1001",
    answeredQuestions: [
      {
        question: "2 + 2 = ?",
        questionType: "multiple-choice",
        studentAnswer: "4",
        correctAnswer: "4",
        isCorrect: true,
        mark: 5,
      },
      {
        question: "Explain Pythagorean theorem briefly.",
        questionType: "open-ended",
        studentAnswer: "a2 + b2 = c2 in right triangles.",
        correctAnswer: "In a right triangle, square of hypotenuse equals sum of squares of legs.",
        needsManualGrading: true,
        pointsAwarded: 0,
        mark: 5,
      },
    ],
    score: 5,
    totalMark: 10,
    grade: 50,
    status: "Pending",
    isFullyGraded: false,
    isPublished: false,
  };

  const recompute = () => {
    const score = result.answeredQuestions.reduce((sum, aq) => {
      if (aq.questionType === "multiple-choice") {
        return sum + (aq.isCorrect ? aq.mark ?? 0 : 0);
      }
      return sum + (aq.pointsAwarded ?? 0);
    }, 0);

    const totalMark = result.answeredQuestions.reduce(
      (sum, aq) => sum + (aq.mark ?? 0),
      0,
    );
    const grade = totalMark ? Math.round((score / totalMark) * 100) : 0;
    const hasUngraded = result.answeredQuestions.some(
      (aq) => aq.questionType === "open-ended" && aq.needsManualGrading,
    );

    result.score = score;
    result.totalMark = totalMark;
    result.grade = grade;
    result.isFullyGraded = !hasUngraded;
    result.status = hasUngraded ? "Pending" : grade >= 50 ? "Passed" : "Failed";
  };

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname;

    if (method === "POST" && path.endsWith("/teachers/login")) {
      return jsonResponse(route, { status: "success", data: "teacher-token" });
    }

    if (method === "GET" && path.includes("teachers/exam-results")) {
      // Handle both "/teachers/exam-results" and "/teachers/exam-results/:id"
      const segments = path.split("/");
      const last = segments[segments.length - 1];
      if (last === "exam-results" || last === "v1teachers" || !last) {
        return jsonResponse(route, { status: "success", data: [result] });
      }
      if (last === "result-1") {
        return jsonResponse(route, { status: "success", data: result });
      }
    }

    if (method === "PUT" && path.endsWith("/teachers/exam-results/result-1/grade")) {
      const body = request.postDataJSON();
      const gradedAnswers = body.gradedAnswers || [];
      for (const ga of gradedAnswers) {
        const target = result.answeredQuestions[ga.index];
        if (!target || target.questionType !== "open-ended") continue;
        target.pointsAwarded = Number(ga.pointsAwarded || 0);
        target.needsManualGrading = false;
      }
      recompute();
      return jsonResponse(route, { status: "success", data: result });
    }

    if (method === "PUT" && path.endsWith("/teachers/exam-results/result-1/publish")) {
      result.isPublished = true;
      return jsonResponse(route, { status: "success", data: result });
    }

    // Safe defaults for teacher dashboard and unrelated API calls.
    return jsonResponse(route, { status: "success", data: [] });
  });
}

test.describe("Teacher grading journey pack", () => {
  test("teacher can grade open-ended answers and publish result", async ({
    page,
  }) => {
    await forceEnglishLocale(page);
    await mockTeacherExamResultApi(page);
    await loginAsTeacher(page);

    await page.goto("/teacher/exam-results");
    await expect(page.getByText("ST-1001")).toBeVisible();
    await expect(page.getByText("No").first()).toBeVisible();

    const detailPath = await page
      .getByRole("link", { name: /^View$/ })
      .first()
      .getAttribute("href");
    expect(detailPath).toContain("/teacher/exam-results/result-1");
    await page.goto(detailPath);
    await expect(page).toHaveURL(/\/teacher\/exam-results\/result-1\/?$/);
    await expect(page.getByText("Math Midterm")).toBeVisible();
    await expect(page.getByText("Needs grading")).toBeVisible();

    await page.locator('input[type="number"]').first().fill("4");
    await page.getByRole("button", { name: "Grade & Publish" }).click();

    await expect(page.getByText("All questions are graded.")).toBeVisible();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Published")).toBeVisible();

    await page.getByRole("link", { name: /Exam Results/ }).first().click();
    await expect(page).toHaveURL(/\/teacher\/exam-results$/);
    await expect(page.getByText("Yes").first()).toBeVisible();
    await expect(page.getByText("Passed").first()).toBeVisible();
  });
});
