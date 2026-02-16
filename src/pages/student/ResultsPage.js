import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examResultService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage, PageError } from "../../components";

function getRefName(val) {
  return typeof val === "object" ? val?.name : val;
}

function ResultsPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await examResultService.list();
        setResults(data?.data ?? data ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <PageLoader message={t("student.loadingResults")} />;
  }

  if (error && results.length === 0) {
    return <PageError message={error} backTo="/student" backLabel={t("student.backToOverview")} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{t("student.resultsPageTitle")}</h1>
      <p className="text-slate-600 mb-6">
        {t("student.resultsPageIntro")}
      </p>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {results.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
          {t("student.noResultsYet")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("student.exam")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("student.score")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("student.grade")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("student.status")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("student.published")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {t("student.action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r._id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 text-slate-800">
                    {getRefName(r.exam)}
                  </td>
                  <td className="py-3 px-4">{r.score ?? "—"}</td>
                  <td className="py-3 px-4">
                    {r.grade != null ? `${r.grade}%` : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        r.status === "Passed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.status || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {r.isPublished ? (
                      <span className="text-green-600 font-medium">{t("common.yes")}</span>
                    ) : (
                      <span className="text-amber-600">{t("student.pending")}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {r.isPublished ? (
                      <Link
                        to={`/student/results/${r._id}`}
                        className="text-slate-700 hover:text-slate-900 font-medium"
                      >
                        {t("common.view")}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
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

export default ResultsPage;
