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

async function loginAsStudent(page) {
  await page.goto("/login/student");
  await page.fill("#email", "student@school.com");
  await page.fill("#password", "Password123!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/student$/);
}

async function mockStudentExamApi(page, { seedPublishedResult = false } = {}) {
  const exam = {
    _id: "exam-1",
    name: "Mathematics Basics",
    description: "Simple mixed quiz for student flow.",
    duration: "30 min",
    examDate: "2026-03-10T00:00:00.000Z",
    examTime: "10:00",
    subject: { _id: "subject-1", name: "Mathematics" },
    questions: [
      {
        _id: "q-1",
        questionType: "multiple-choice",
        question: "2 + 2 = ?",
        optionA: "3",
        optionB: "4",
        optionC: "5",
        optionD: "6",
        correctAnswer: "B",
        mark: 5,
      },
      {
        _id: "q-2",
        questionType: "open-ended",
        question: "Explain what a right triangle is.",
        correctAnswer: "A triangle with one 90 degree angle.",
        mark: 5,
      },
    ],
  };

  const state = {
    results: seedPublishedResult
      ? [
          {
            _id: "result-1",
            exam: { _id: exam._id, name: exam.name },
            answeredQuestions: [
              {
                question: exam.questions[0].question,
                questionType: "multiple-choice",
                studentAnswer: "B",
                correctAnswer: "B",
                isCorrect: true,
                mark: 5,
              },
              {
                question: exam.questions[1].question,
                questionType: "open-ended",
                studentAnswer: "Triangle with one 90 degree angle.",
                correctAnswer: exam.questions[1].correctAnswer,
                pointsAwarded: 5,
                mark: 5,
                needsManualGrading: false,
              },
            ],
            score: 10,
            totalMark: 10,
            grade: 100,
            status: "Passed",
            remarks: "Great work",
            isFullyGraded: true,
            isPublished: true,
          },
        ]
      : [],
  };

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname;

    if (method === "POST" && path.endsWith("/students/login")) {
      return jsonResponse(route, { status: "success", data: "student-token" });
    }

    if (method === "GET" && path.endsWith("/students/profile")) {
      return jsonResponse(route, {
        status: "success",
        data: { _id: "student-1", name: "Student One", studentId: "ST-1001" },
      });
    }

    if (method === "GET" && path.endsWith("/students/exams")) {
      return jsonResponse(route, { status: "success", data: [exam] });
    }

    if (method === "GET" && path.endsWith(`/students/exams/${exam._id}`)) {
      return jsonResponse(route, { status: "success", data: exam });
    }

    if (method === "POST" && path.endsWith(`/students/exams/${exam._id}`)) {
      const body = request.postDataJSON();
      const answers = body.answers || [];

      const isMcCorrect = answers[0] === exam.questions[0].correctAnswer;
      const score = isMcCorrect ? 5 : 0;

      state.results = [
        {
          _id: "result-1",
          exam: { _id: exam._id, name: exam.name },
          answeredQuestions: [
            {
              question: exam.questions[0].question,
              questionType: "multiple-choice",
              studentAnswer: answers[0] || "",
              correctAnswer: exam.questions[0].correctAnswer,
              isCorrect: isMcCorrect,
              mark: 5,
            },
            {
              question: exam.questions[1].question,
              questionType: "open-ended",
              studentAnswer: answers[1] || "",
              correctAnswer: exam.questions[1].correctAnswer,
              pointsAwarded: 0,
              mark: 5,
              needsManualGrading: true,
            },
          ],
          score,
          totalMark: 10,
          grade: score * 10,
          status: "Pending",
          remarks: "",
          isFullyGraded: false,
          isPublished: false,
        },
      ];

      return jsonResponse(route, { status: "success", data: state.results[0] });
    }

    if (method === "GET" && path.endsWith("/exam-results")) {
      return jsonResponse(route, { status: "success", data: state.results });
    }

    if (method === "GET" && path.endsWith("/exam-results/result-1")) {
      const result = state.results.find((r) => r._id === "result-1");
      if (!result) {
        return jsonResponse(
          route,
          { status: "failed", message: "Result not found" },
          404,
        );
      }
      return jsonResponse(route, { status: "success", data: result });
    }

    return jsonResponse(route, { status: "success", data: [] });
  });
}

test.describe("Student exam-taking journey pack", () => {
  test("student can take exam and sees pending unpublished result", async ({
    page,
  }) => {
    await forceEnglishLocale(page);
    await mockStudentExamApi(page);
    await loginAsStudent(page);

    await page.goto("/student/exams");
    await expect(page.getByText("Mathematics Basics")).toBeVisible();

    await page.getByRole("link", { name: "Take Exam" }).click();
    await expect(page).toHaveURL(/\/student\/exams\/exam-1\/take$/);

    await page.locator('input[name="q-0"][value="B"]').check();
    await page
      .getByPlaceholder("Write your answer here...")
      .fill("A right triangle has one 90 degree angle.");
    await page.getByRole("button", { name: "Submit Exam" }).click();
    await page.getByRole("button", { name: "Yes, submit" }).click();

    await expect(page).toHaveURL(/\/student\/results$/);
    await expect(page.getByText("Mathematics Basics")).toBeVisible();
    await expect(page.getByText("Pending").first()).toBeVisible();
    await expect(page.getByText("—").first()).toBeVisible();

    await page.goto("/student/exams");
    await expect(page.getByText("Completed", { exact: true })).toBeVisible();
  });

  test("student can open published result details", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockStudentExamApi(page, { seedPublishedResult: true });
    await loginAsStudent(page);

    await page.goto("/student/results");
    await expect(page.getByText("Mathematics Basics")).toBeVisible();
    await expect(page.getByText("Yes").first()).toBeVisible();

    const detailPath = await page
      .getByRole("link", { name: /^View$/ })
      .first()
      .getAttribute("href");
    expect(detailPath).toContain("/student/results/result-1");
    await page.goto(detailPath);
    await expect(page).toHaveURL(/\/student\/results\/result-1\/?$/);

    await expect(page.getByText("Answer breakdown")).toBeVisible();
    await expect(page.getByText("Great work")).toBeVisible();
    await expect(page.getByText("10 / 10")).toBeVisible();
  });
});
