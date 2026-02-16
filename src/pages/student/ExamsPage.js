import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentService, examResultService, getErrorMessage } from "../../api";

function getRefName(val) {
  return typeof val === "object" ? val?.name : val;
}

function ExamsPage() {
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
    return (
      <div className="p-8 text-center text-slate-500">Loading exams...</div>
    );
  }

  if (error && exams.length === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Available Exams
      </h1>
      <p className="text-slate-600 mb-6">
        Take exams or view completed ones. Each exam can be taken only once.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {exams.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
          No exams available yet. Check back later.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const taken = takenExamIds.includes(exam._id);
            const questions = exam.questions || [];
            return (
              <div
                key={exam._id}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <h2 className="font-semibold text-slate-800 mb-1">
                  {exam.name}
                </h2>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {exam.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
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
                  <span>{questions.length} questions</span>
                </div>
                {taken ? (
                  <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm">
                    Completed
                  </span>
                ) : (
                  <Link
                    to={`/student/exams/${exam._id}/take`}
                    className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
                  >
                    Take Exam
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
