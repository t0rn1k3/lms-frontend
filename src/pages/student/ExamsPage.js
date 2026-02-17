import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { studentService, examResultService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage, PageError } from "../../components";

function getRefName(val) {
  return typeof val === "object" ? val?.name : val;
}

function ExamsPage() {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [examsRes, resultsRes] = await Promise.all([
          studentService.getExams(),
          examResultService.list(),
        ]);
        setExams(examsRes.data?.data ?? examsRes.data ?? []);
        setResults(resultsRes.data?.data ?? resultsRes.data ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const takenExamIds = results.map((r) =>
    typeof r.exam === "object" ? r.exam?._id : r.exam,
  );

  if (loading) {
    return <PageLoader message={t("student.loadingExams")} />;
  }

  if (error && exams.length === 0) {
    return <PageError message={error} backTo="/student/exams" backLabel={t("student.backToExams")} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-2">
        {t("student.examsPageTitle")}
      </h1>
      <p className="text-lms-primary/90 mb-6">
        {t("student.examsPageIntro")}
      </p>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {exams.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-lms-cream text-center text-lms-primary/80">
          {t("student.noExamsAvailable")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const taken = takenExamIds.includes(exam._id);
            const questions = exam.questions || [];
            return (
              <div
                key={exam._id}
                className="p-5 bg-white rounded-xl border border-lms-cream hover:border-lms-cream hover:shadow-md transition-all"
              >
                <h2 className="font-semibold text-lms-primary mb-1">
                  {exam.name}
                </h2>
                <p className="text-sm text-lms-primary/90 mb-4 line-clamp-2">
                  {exam.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-lms-primary/80 mb-4">
                  <span>{getRefName(exam.subject)}</span>
                  <span>•</span>
                  <span>{exam.duration || "—"}</span>
                  <span>•</span>
                  <span>
                    {exam.examDate
                      ? new Date(exam.examDate).toLocaleDateString()
                      : "—"}
                  </span>
                  <span>•</span>
                  <span>{questions.length} {t("student.questions")}</span>
                </div>
                {taken ? (
                  <span className="inline-block px-3 py-1.5 bg-lms-light text-lms-primary/90 rounded-lg text-sm">
                    {t("student.completed")}
                  </span>
                ) : (
                  <Link
                    to={`/student/exams/${exam._id}/take`}
                    className="inline-block px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark text-sm font-medium"
                  >
                    {t("student.takeExamButton")}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExamsPage;
