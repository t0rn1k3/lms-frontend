import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { studentService, getErrorMessage } from "../../api";

const OPTIONS = ["A", "B", "C", "D"];

function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await studentService.getExam(examId);
        const examData = data?.data ?? data;
        setExam(examData);
        setAnswers(new Array(examData?.questions?.length || 0).fill(""));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [examId]);

  const handleAnswer = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    const questions = exam?.questions || [];
    if (answers.length !== questions.length) {
      setError("Please answer all questions.");
      return;
    }
    const hasEmpty = answers.some((a) => !a);
    if (hasEmpty) {
      setError("Please answer all questions.");
      return;
    }
    setError("");
    setShowConfirm(true);
  };

  const handleSubmitConfirm = async () => {
    setSubmitting(true);
    try {
      await studentService.writeExam(examId, { answers });
      navigate("/student/results", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading exam...</div>
    );
  }

  if (error && !exam) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
        <Link
          to="/student/exams"
          className="text-slate-600 hover:text-slate-800"
        >
          ← Back to Exams
        </Link>
      </div>
    );
  }

  if (!exam) return null;

  const questions = exam.questions || [];
  const answeredCount = answers.filter((a) => a).length;

  return (
    <div>
      <Link
        to="/student/exams"
        className="inline-block mb-6 text-slate-600 hover:text-slate-800"
      >
        ← Back to Exams
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">{exam.name}</h1>
      <p className="text-slate-600 mb-6">{exam.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Duration</span>
          <p className="font-medium">{exam.duration || "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Date</span>
          <p className="font-medium">
            {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Time</span>
          <p className="font-medium">{exam.examTime || "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-sm text-slate-500">Questions</span>
          <p className="font-medium">{questions.length}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600">
          Progress: <strong>{answeredCount}</strong> of {questions.length}{" "}
          questions answered
        </p>
        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-700 transition-all"
            style={{
              width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmitClick} className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={q._id}
            className="p-6 bg-white rounded-xl border border-slate-200"
          >
            <p className="font-medium text-slate-800 mb-4">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    answers[i] === opt
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={opt}
                    checked={answers[i] === opt}
                    onChange={() => handleAnswer(i, opt)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">
                    {opt}. {q[`option${opt}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 font-medium"
          >
            Submit Exam
          </button>
        </div>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Submit exam?
            </h3>
            <p className="text-slate-600 mb-6">
              You have answered all questions. This action cannot be undone.
              Submit now?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Yes, submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TakeExamPage;
