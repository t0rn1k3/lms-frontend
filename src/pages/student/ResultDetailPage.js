import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examResultService, getErrorMessage } from "../../api";
import { PageLoader, PageError } from "../../components";
import { formatStudentAnswer, isAutoGraded, needsManualGrading } from "../../utils/answerDisplay";

function getRefName(val) {
  return typeof val === "object" ? val?.name : val;
}

function ResultDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await examResultService.getOne(id);
        setResult(data?.data ?? data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return <PageLoader message={t("student.loadingResult")} />;
  }

  if (error || !result) {
    return (
      <PageError
        message={error || t("common.resultNotFound")}
        backTo="/student/results"
        backLabel={t("student.backToResults")}
      />
    );
  }

  if (!result.isPublished) {
    return (
      <div>
        <Link
          to="/student/results"
          className="inline-block mb-6 text-lms-primary/90 hover:text-lms-primary"
        >
          ← {t("student.backToResults")}
        </Link>
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-amber-800 font-medium">{t("student.resultNotYetPublished")}</p>
          <p className="text-sm text-amber-700/90 mt-2">{t("student.resultNotYetPublishedHint")}</p>
        </div>
      </div>
    );
  }

  const answeredQuestions = result.answeredQuestions || [];
  const questionsById = new Map((result.exam?.questions || []).map((q) => [q._id, q]));
  // CRITERIA_DISABLED: always percentage - hide criteria results display
  // const passCriteriaType = (typeof result.exam === "object" && result.exam?.passCriteriaType) || "percentage";
  const isAllCriteria = false; // CRITERIA_DISABLED: was passCriteriaType === "all-criteria"
  const criterionResults = result.criterionResults || [];

  return (
    <div>
      <Link
        to="/student/results"
        className="inline-block mb-6 text-lms-primary/90 hover:text-lms-primary"
      >
        ← {t("student.backToResults")}
      </Link>

      <h1 className="text-2xl font-bold text-lms-primary mb-2">
        {getRefName(result.exam)}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream shadow-sm">
          <span className="text-sm text-lms-primary/80">{t("student.score")}</span>
          <p className="font-medium">
            {result.totalMark != null
              ? `${result.score ?? 0} / ${result.totalMark}`
              : result.score ?? "—"}
          </p>
        </div>
        {(typeof result.exam === "object" && result.exam?.passMark != null) || result.passMark != null ? (
          <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream shadow-sm">
            <span className="text-sm text-lms-primary/80">{t("teacher.passMark")}</span>
            <p className="font-medium">
              {t("teacher.passMarkLabel", {
                value:
                  typeof result.exam === "object" && result.exam?.passMark != null
                    ? result.exam.passMark
                    : result.passMark,
              })}
            </p>
          </div>
        ) : null}
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream shadow-sm">
          <span className="text-sm text-lms-primary/80">{t("student.grade")}</span>
          <p className="font-medium">
            {result.grade != null ? `${result.grade}%` : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream shadow-sm">
          <span className="text-sm text-lms-primary/80">{t("student.status")}</span>
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
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream shadow-sm">
          <span className="text-sm text-lms-primary/80">{t("student.remarks")}</span>
          <p className="font-medium">{result.remarks || "—"}</p>
        </div>
      </div>

      {/* CRITERIA_DISABLED: criteria results - isAllCriteria forced to false above */}
      {isAllCriteria && criterionResults.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {t("teacher.criteriaResults")}
          </h2>
          <div className="space-y-3 mb-8">
            {criterionResults.map((cr) => (
              <div
                key={cr.criterionId || cr.id || cr.criterionName}
                className={`p-4 rounded-xl border ${
                  cr.passed
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p className="font-medium text-lms-primary">
                  {cr.criterionName || cr.name || "—"}
                </p>
                <p
                  className={
                    cr.passed
                      ? "text-sm text-green-700 font-medium"
                      : "text-sm text-red-700 font-medium"
                  }
                >
                  {cr.passed ? t("student.passed") : t("student.failed")}
                </p>
                {cr.notes?.trim() && (
                  <p className="text-sm text-lms-primary/80 mt-1">{cr.notes}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {answeredQuestions.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {t("student.answerBreakdown")}
          </h2>
          <div className="space-y-4">
            {answeredQuestions.map((aq, i) => {
              const question = questionsById.get(aq.questionId);
              const formattedAnswer = formatStudentAnswer(aq, question);
              const isManual = needsManualGrading(aq.questionType);
              const cardClass = isManual
                ? "bg-lms-cream/30 border-lms-cream"
                : aq.isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200";

              return (
                <div key={i} className={`p-4 rounded-xl border ${cardClass}`}>
                  <p className="font-medium text-lms-primary mb-2">
                    {i + 1}. {aq.question}
                  </p>
                  <div className="text-sm text-lms-primary/90 space-y-1">
                    <p className="whitespace-pre-wrap">
                      {t("student.yourAnswer")}: <strong>{formattedAnswer}</strong>
                    </p>
                    {isAutoGraded(aq.questionType) && (
                      <>
                        {aq.correctAnswer != null && (
                          <p>
                            {t("student.correctAnswerLabel")}:{" "}
                            <strong className="text-green-700">{aq.correctAnswer}</strong>
                          </p>
                        )}
                        <p>
                          <span
                            className={
                              aq.isCorrect
                                ? "text-green-700 font-medium"
                                : "text-red-700 font-medium"
                            }
                          >
                            {aq.isCorrect ? t("student.correct") : t("student.incorrect")}
                          </span>{" "}
                          ({aq.pointsAwarded ?? 0}/{aq.mark ?? 1})
                        </p>
                      </>
                    )}
                    {isManual && (
                      <p>
                        {t("teacher.pointsAwarded")}: {aq.pointsAwarded ?? "—"} / {aq.mark ?? 1}
                      </p>
                    )}
                    {isManual && aq.correctAnswer && (
                      <p>
                        {t("teacher.modelAnswer")}:{" "}
                        <span className="text-green-700">{aq.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ResultDetailPage;
