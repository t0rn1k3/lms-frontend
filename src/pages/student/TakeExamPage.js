import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { studentService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage, PageError } from "../../components";

const OPTIONS = ["A", "B", "C", "D"];

function TakeExamPage() {
  const { t } = useTranslation();
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
      setError(t("common.answerAllQuestions"));
      return;
    }
    const hasEmpty = answers.some((a) => !a);
    if (hasEmpty) {
      setError(t("common.answerAllQuestions"));
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
    return <PageLoader message={t("student.loadingExam")} />;
  }

  if (error && !exam) {
    return (
      <PageError
        message={error}
        backTo="/student/exams"
        backLabel={t("student.backToExams")}
      />
    );
  }

  if (!exam) return null;

  const questions = exam.questions || [];
  const answeredCount = answers.filter((a) => a).length;

  return (
    <div>
      <Link
        to="/student/exams"
        className="inline-block mb-6 text-lms-primary/90 hover:text-lms-primary"
      >
        ← {t("student.backToExams")}
      </Link>

      <h1 className="text-2xl font-bold text-lms-primary mb-2">{exam.name}</h1>
      <p className="text-lms-primary/90 mb-6">{exam.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">{t("student.duration")}</span>
          <p className="font-medium">{exam.duration || "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">{t("student.date")}</span>
          <p className="font-medium">
            {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">{t("student.time")}</span>
          <p className="font-medium">{exam.examTime || "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">{t("student.questions")}</span>
          <p className="font-medium">{questions.length}</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <div className="mb-6 p-4 bg-lms-cream/30 rounded-lg border border-lms-cream">
        <p className="text-sm text-lms-primary/90">
          {t("student.progress")}: {t("student.progressOf", { answered: answeredCount, total: questions.length })}
        </p>
        <div className="mt-2 h-2 bg-lms-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-lms-primary-dark transition-all"
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
            className="p-6 bg-white rounded-xl border border-lms-cream"
          >
            <p className="font-medium text-lms-primary mb-4">
              {i + 1}. {q.question}
            </p>
            {q.questionType === "open-ended" ? (
              <div>
                <label className="block text-sm text-lms-primary/90 mb-2">
                  {t("student.yourAnswer")}
                </label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => handleAnswer(i, e.target.value)}
                  rows={4}
                  placeholder={t("student.writeYourAnswer")}
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[i] === opt
                        ? "border-lms-primary bg-lms-cream/30"
                        : "border-lms-cream hover:border-lms-cream"
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
                    <span className="text-lms-primary">
                      {opt}. {q[`option${opt}`] || ""}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50 font-medium"
          >
            {t("student.submitExam")}
          </button>
        </div>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-lms-primary mb-2">
              {t("student.submitConfirmTitle")}
            </h3>
            <p className="text-lms-primary/90 mb-6">
              {t("student.submitConfirmMessage")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSubmitConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
              >
                {submitting ? t("common.saving") : t("student.submitConfirmYes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TakeExamPage;
