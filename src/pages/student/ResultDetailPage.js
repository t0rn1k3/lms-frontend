import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examResultService, getErrorMessage } from "../../api";
import { PageLoader, PageError } from "../../components";

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

  const answeredQuestions = result.answeredQuestions || [];

  return (
    <div>
      <Link
        to="/student/results"
        className="inline-block mb-6 text-slate-600 hover:text-slate-800"
      >
        ← {t("student.backToResults")}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {getRefName(result.exam)}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">{t("student.score")}</span>
          <p className="font-medium">{result.score ?? "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">{t("student.grade")}</span>
          <p className="font-medium">
            {result.grade != null ? `${result.grade}%` : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">{t("student.status")}</span>
          <p className="font-medium">
            <span
              className={
                result.status === "Passed" ? "text-green-700" : "text-red-700"
              }
            >
              {result.status || "—"}
            </span>
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500">{t("student.remarks")}</span>
          <p className="font-medium">{result.remarks || "—"}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {t("student.answerBreakdown")}
      </h2>
      <div className="space-y-4">
        {answeredQuestions.map((aq, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border ${
              aq.isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="font-medium text-slate-800 mb-2">
              {i + 1}. {aq.question}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-slate-600">
                {t("student.yourAnswer")}: <strong>{aq.studentAnswer}</strong>
              </span>
              <span className="text-slate-600">
                {t("student.correctAnswerLabel")}:{" "}
                <strong className="text-green-700">{aq.correctAnswer}</strong>
              </span>
              <span
                className={
                  aq.isCorrect
                    ? "text-green-700 font-medium"
                    : "text-red-700 font-medium"
                }
              >
                {aq.isCorrect ? t("student.correct") : t("student.incorrect")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultDetailPage;
