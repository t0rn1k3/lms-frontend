import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { examResultService, getErrorMessage } from "../../api";

function getRefName(val) {
  return typeof val === "object" ? val?.name : val;
}

function ResultDetailPage() {
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
    return (
      <div className="p-8 text-center text-slate-500">Loading result...</div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || "Result not found"}
        </div>
        <Link
          to="/student/results"
          className="text-slate-600 hover:text-slate-800"
        >
          ← Back to Results
        </Link>
      </div>
    );
  }

  const answeredQuestions = result.answeredQuestions || [];

  return (
    <div>
      <Link
        to="/student/results"
        className="inline-block mb-6 text-slate-600 hover:text-slate-800"
      >
        ← Back to Results
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {getRefName(result.exam)}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Score</span>
          <p className="font-medium">{result.score ?? "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Grade</span>
          <p className="font-medium">
            {result.grade != null ? `${result.grade}%` : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Status</span>
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
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Remarks</span>
          <p className="font-medium">{result.remarks || "—"}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Answer breakdown
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
                Your answer: <strong>{aq.studentAnswer}</strong>
              </span>
              <span className="text-slate-600">
                Correct:{" "}
                <strong className="text-green-700">{aq.correctAnswer}</strong>
              </span>
              <span
                className={
                  aq.isCorrect
                    ? "text-green-700 font-medium"
                    : "text-red-700 font-medium"
                }
              >
                {aq.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultDetailPage;
