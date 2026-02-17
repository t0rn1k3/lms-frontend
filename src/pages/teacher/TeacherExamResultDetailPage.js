import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examResultService, getErrorMessage } from "../../api";
import { PageLoader, PageError, ErrorMessage } from "../../components";

function getRefName(val, key = "name") {
  if (!val) return "—";
  return typeof val === "object" ? val?.[key] || val?._id : val;
}

function TeacherExamResultDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradedAnswers, setGradedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await examResultService.teacherGetOne(id);
        const r = data?.data ?? data;
        setResult(r);
        const initial = {};
        (r.answeredQuestions || []).forEach((aq, idx) => {
          if (aq.needsManualGrading && aq.questionType === "open-ended") {
            initial[idx] = aq.pointsAwarded ?? 0;
          }
        });
        setGradedAnswers(initial);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const refreshResult = async () => {
    try {
      const { data } = await examResultService.teacherGetOne(id);
      setResult(data?.data ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleGradeChange = (index, value) => {
    const num = Math.max(0, Number(value) || 0);
    setGradedAnswers((prev) => ({ ...prev, [index]: num }));
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = Object.entries(gradedAnswers)
        .filter(([_, pts]) => pts != null && pts >= 0)
        .map(([idx, pts]) => ({
          index: Number(idx),
          pointsAwarded: Number(pts),
        }));
      await examResultService.teacherGrade(id, payload);
      await refreshResult();
      setGradedAnswers({});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setError("");
    setPublishing(true);
    try {
      await examResultService.teacherPublish(id);
      await refreshResult();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <PageLoader message={t("common.loading")} />;
  }

  if (error && !result) {
    return (
      <PageError
        message={error}
        backTo="/teacher/exam-results"
        backLabel={t("teacher.examResults")}
      />
    );
  }

  if (!result) return null;

  const answeredQuestions = result.answeredQuestions || [];
  const openEndedToGrade = answeredQuestions.filter(
    (aq, idx) => aq.needsManualGrading && aq.questionType === "open-ended"
  );
  const hasUngraded = openEndedToGrade.length > 0;
  const canPublish = result.isFullyGraded && !result.isPublished;

  return (
    <div>
      <Link
        to="/teacher/exam-results"
        className="inline-block mb-6 text-slate-600 hover:text-slate-800"
      >
        ← {t("teacher.examResults")}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {getRefName(result.exam)}
      </h1>
      <p className="text-slate-600 mb-6">
        {t("teacher.tableStudent")}: <strong>{result.studentId}</strong>
      </p>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">{t("student.score")}</span>
          <p className="font-medium">{result.score ?? 0} / {result.totalMark ?? "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">{t("student.grade")}</span>
          <p className="font-medium">{result.grade != null ? `${result.grade}%` : "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">{t("student.status")}</span>
          <p className="font-medium">
            <span
              className={
                result.status === "Passed"
                  ? "text-green-700"
                  : result.status === "Pending"
                    ? "text-amber-700"
                    : "text-red-700"
              }
            >
              {result.status || "—"}
            </span>
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">{t("teacher.fullyGraded")}</span>
          <p className="font-medium">{result.isFullyGraded ? t("common.yes") : t("common.no")}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">{t("admin.tablePublished")}</span>
          <p className="font-medium">{result.isPublished ? t("common.yes") : t("common.no")}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {t("student.answerBreakdown")}
      </h2>
      <div className="space-y-4 mb-8">
        {answeredQuestions.map((aq, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border ${
              aq.questionType === "open-ended"
                ? "bg-slate-50 border-slate-200"
                : aq.isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-medium text-slate-800 mb-2">
                  {i + 1}. {aq.question}
                </p>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    <span className="font-medium">{t("student.yourAnswer")}:</span>{" "}
                    {aq.studentAnswer || "—"}
                  </p>
                  {aq.questionType === "multiple-choice" && (
                    <p>
                      <span className="font-medium text-green-700">{t("student.correctAnswerLabel")}:</span>{" "}
                      {aq.correctAnswer || "—"}
                    </p>
                  )}
                  {aq.questionType === "open-ended" && aq.correctAnswer && (
                    <p>
                      <span className="font-medium">{t("teacher.modelAnswer")}:</span>{" "}
                      {aq.correctAnswer}
                    </p>
                  )}
                  <p>
                    {aq.questionType === "open-ended" ? (
                      <span>
                        {t("teacher.pointsAwarded")}: {aq.pointsAwarded ?? "—"} / {aq.mark ?? 1}
                      </span>
                    ) : (
                      <span
                        className={
                          aq.isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"
                        }
                      >
                        {aq.isCorrect ? t("student.correct") : t("student.incorrect")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {aq.needsManualGrading && aq.questionType === "open-ended" && (
                <div className="flex-shrink-0 w-24">
                  <label className="block text-xs text-slate-600 mb-1">
                    {t("teacher.pointsAwarded")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={aq.mark ?? 10}
                    step={0.5}
                    value={gradedAnswers[i] ?? ""}
                    onChange={(e) => handleGradeChange(i, e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasUngraded && (
        <form onSubmit={handleSubmitGrade} className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h3 className="font-semibold text-slate-800 mb-2">
            {t("teacher.gradeAnswers")}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {t("teacher.needsGrading")} — Enter points for each open-ended question above, then click Save.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? t("common.saving") : t("teacher.gradeAndPublish")}
          </button>
        </form>
      )}

      {canPublish && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <h3 className="font-semibold text-slate-800 mb-2">
            {t("teacher.publishResult")}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            All questions are graded. Publish this result so the student can view it.
          </p>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {publishing ? t("common.loading") : t("admin.publish")}
          </button>
        </div>
      )}

      {result.isPublished && (
        <p className="text-green-700 font-medium">{t("admin.pub")}</p>
      )}
    </div>
  );
}

export default TeacherExamResultDetailPage;
