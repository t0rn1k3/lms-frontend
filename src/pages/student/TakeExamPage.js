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

  const handleSubmit = async (e) => {
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
    setSubmitting(true);
    try {
      await studentService.writeExam(examId, { answers });
      navigate("/student/results", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TakeExamPage;
