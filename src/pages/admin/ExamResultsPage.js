import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  adminService,
  examResultService,
  studentService,
  getErrorMessage,
} from "../../api";

function ExamResultsPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [resultsRes, studentsRes] = await Promise.all([
          adminService.getExamResults(),
          studentService.list(),
        ]);
        setResults(resultsRes.data?.data || []);
        const students = studentsRes.data?.data || [];
        const map = {};
        students.forEach((s) => {
          if (s.studentId) map[s.studentId] = s.name;
        });
        setStudentMap(map);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      setTogglingId(id);
      await examResultService.togglePublish(id, !currentStatus);
      setResults((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isPublished: !currentStatus } : r,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const getRefName = (val, key = "name") => {
    if (!val) return "—";
    return typeof val === "object" ? val?.[key] || val?._id : val;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-6">{t("admin.examResultsTitle")}</h1>
      <p className="text-lms-primary/90 mb-6">
        {t("admin.examResultsIntro")}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-lms-cream overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-lms-primary/80">{t("common.loading")}</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noExamResults")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.tableStudent")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.tableExam")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.tableScore")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.tableStatus")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.tablePublished")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  {t("admin.tableAction")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream">
              {results.map((item) => (
                <tr key={item._id} className="hover:bg-lms-cream/30/50">
                  <td className="px-4 py-3">
                    <div className="inline-flex flex-col rounded-lg overflow-hidden border border-lms-cream min-w-[100px]">
                      <div className="bg-teal-50 px-3 py-1.5 text-center text-xs font-medium text-lms-primary">
                        {t("admin.tableStudent")}
                      </div>
                      <div className="bg-white px-3 py-2 text-center text-sm font-medium text-lms-primary">
                        {studentMap[item.studentId] || item.studentId || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getRefName(item.exam)}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {item.score ?? "—"} / {item.passMark ?? 50}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === "Passed"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-lms-cream/50 text-lms-primary/80"
                      }`}
                    >
                      {item.isPublished ? t("admin.pub") : t("admin.unpub")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        handleTogglePublish(item._id, item.isPublished)
                      }
                      disabled={togglingId === item._id}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        item.isPublished
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      } disabled:opacity-50`}
                    >
                      {togglingId === item._id
                        ? "..."
                        : item.isPublished
                          ? t("admin.unpublish")
                          : t("admin.publish")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ExamResultsPage;
