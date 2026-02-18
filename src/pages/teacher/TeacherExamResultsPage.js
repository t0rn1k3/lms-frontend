import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examResultService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage } from "../../components";

function getRefName(val, key = "name") {
  if (!val) return "—";
  return typeof val === "object" ? val?.[key] || val?._id : val;
}

function TeacherExamResultsPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await examResultService.teacherList();
        setResults(data?.data ?? data ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statusBadgeClass = (status) => {
    if (status === "Passed") return "bg-green-100 text-green-800";
    if (status === "Pending") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return <PageLoader message={t("common.loading")} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-2">
        {t("teacher.examResults")}
      </h1>
      <p className="text-lms-primary/90 mb-6">
        {t("teacher.examResultsIntro")}
      </p>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {results.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-lms-cream text-center text-lms-primary/80">
          {t("admin.noExamResults")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-lms-cream bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-lms-cream bg-lms-cream/30">
                <th className="text-left py-3 px-4 font-semibold text-lms-primary">
                  {t("teacher.tableStudent")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-lms-primary">
                  {t("teacher.tableExam")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-lms-primary">
                  {t("teacher.tableScore")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-lms-primary">
                  {t("teacher.tableStatus")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-lms-primary">
                  {t("admin.tablePublished")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-lms-primary">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b border-lms-cream hover:bg-lms-cream/30">
                  <td className="py-3 px-4">
                    <div className="inline-flex flex-col rounded-lg overflow-hidden border border-lms-cream min-w-[100px]">
                      <div className="bg-teal-50 px-3 py-1.5 text-center text-xs font-medium text-lms-primary">
                        {t("teacher.tableStudent")}
                      </div>
                      <div className="bg-white px-3 py-2 text-center text-sm font-medium text-lms-primary">
                        {r.studentId || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-lms-primary/90">
                    {getRefName(r.exam)}
                  </td>
                  <td className="py-3 px-4">
                    {r.totalMark != null
                      ? `${r.score ?? 0} / ${r.totalMark}`
                      : r.score ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${statusBadgeClass(r.status)}`}
                    >
                      {r.status || "—"}
                    </span>
                    {!r.isFullyGraded && (
                      <span className="ml-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                        {t("teacher.needsGrading")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {r.isPublished ? (
                      <span className="text-green-600 font-medium">{t("common.yes")}</span>
                    ) : (
                      <span className="text-lms-primary/80">{t("common.no")}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/teacher/exam-results/${r._id}`}
                      className="text-lms-primary hover:text-lms-primary font-medium"
                    >
                      {t("common.view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherExamResultsPage;
