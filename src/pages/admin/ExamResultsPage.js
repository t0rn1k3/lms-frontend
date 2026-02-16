import { useState, useEffect } from "react";
import {
  adminService,
  examResultService,
  studentService,
  getErrorMessage,
} from "../../api";

function ExamResultsPage() {
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
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Exam Results</h1>
      <p className="text-slate-600 mb-6">
        Publish or unpublish exam results. Published results are visible to
        students.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No exam results yet.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Exam
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Published
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">
                      {studentMap[item.studentId] || "—"}
                    </span>
                    {item.studentId && (
                      <span className="block text-xs text-slate-500">
                        {item.studentId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getRefName(item.exam)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.score ?? "—"} / {item.passMark ?? 50}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === "Passed"
                          ? "bg-green-100 text-green-800"
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
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Unpublished"}
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
                          ? "Unpublish"
                          : "Publish"}
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
