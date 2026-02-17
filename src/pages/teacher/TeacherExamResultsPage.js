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
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {t("teacher.examResults")}
      </h1>
      <p className="text-slate-600 mb-6">
        {t("teacher.examResultsIntro")}
      </p>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {results.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
          {t("admin.noExamResults")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("teacher.tableStudent")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("teacher.tableExam")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("teacher.tableScore")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("teacher.tableStatus")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("admin.tablePublished")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800">
                    <span className="font-medium">{r.studentId || "—"}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
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
                      <span className="text-slate-500">{t("common.no")}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/teacher/exam-results/${r._id}`}
                      className="text-slate-700 hover:text-slate-900 font-medium"
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
