import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  examService,
  teacherQuestionService,
  getErrorMessage,
} from "../../api";

const OPTIONS = ["A", "B", "C", "D"];
const QUESTION_TYPES = [
  { value: "multiple-choice", labelKey: "teacher.questionTypeMultipleChoice" },
  { value: "open-ended", labelKey: "teacher.questionTypeOpenEnded" },
];

function ExamDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question: "",
    questionType: "multiple-choice",
    mark: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });
  const [submitting, setSubmitting] = useState(false);

  const getRefName = (val) => (typeof val === "object" ? val?.name : val);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const examRes = await examService.getOne(id);
        setExam(examRes.data?.data ?? examRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const refreshExam = async () => {
    try {
      const { data } = await examService.getOne(id);
      setExam(data.data ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      question: "",
      questionType: "multiple-choice",
      mark: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    });
    setQuestionFormOpen(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestionId(q._id);
    setQuestionForm({
      question: q.question || "",
      questionType: q.questionType || "multiple-choice",
      mark: q.mark != null ? String(q.mark) : "",
      optionA: q.optionA || "",
      optionB: q.optionB || "",
      optionC: q.optionC || "",
      optionD: q.optionD || "",
      correctAnswer: q.correctAnswer || "A",
    });
    setQuestionFormOpen(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        question: questionForm.question.trim(),
        questionType: questionForm.questionType,
        mark: questionForm.mark ? Number(questionForm.mark) : undefined,
      };
      if (questionForm.questionType === "multiple-choice") {
        payload.optionA = questionForm.optionA.trim();
        payload.optionB = questionForm.optionB.trim();
        payload.optionC = questionForm.optionC.trim();
        payload.optionD = questionForm.optionD.trim();
        payload.correctAnswer = questionForm.correctAnswer;
      } else {
        payload.correctAnswer = questionForm.correctAnswer?.trim() || undefined;
        if (questionForm.optionA?.trim()) payload.optionA = questionForm.optionA.trim();
        if (questionForm.optionB?.trim()) payload.optionB = questionForm.optionB.trim();
        if (questionForm.optionC?.trim()) payload.optionC = questionForm.optionC.trim();
        if (questionForm.optionD?.trim()) payload.optionD = questionForm.optionD.trim();
      }
      if (editingQuestionId) {
        await teacherQuestionService.update(editingQuestionId, payload);
      } else {
        await teacherQuestionService.create(id, payload);
      }
      setQuestionFormOpen(false);
      refreshExam();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-lms-primary/80">Loading...</div>;
  if (error && !exam) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }
  if (!exam) return null;

  const questions = exam.questions || [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/teacher/exams"
          className="text-lms-primary/90 hover:text-lms-primary"
        >
          ← Back to Exams
        </Link>
        <button
          onClick={openAddQuestion}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("teacher.addQuestion")}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-lms-primary mb-2">{exam.name}</h1>
      <p className="text-lms-primary/90 mb-6">{exam.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">Subject</span>
          <p className="font-medium">{getRefName(exam.subject)}</p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">Date</span>
          <p className="font-medium">
            {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">Time</span>
          <p className="font-medium">{exam.examTime || "—"}</p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">Questions</span>
          <p className="font-medium">{questions.length}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {questionFormOpen && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-lms-cream">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {editingQuestionId ? t("teacher.editQuestion") : t("teacher.newQuestion")}
          </h2>
          <form onSubmit={handleQuestionSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("teacher.questionType")} *
              </label>
              <select
                value={questionForm.questionType}
                onChange={(e) =>
                  setQuestionForm((p) => ({ ...p, questionType: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                {QUESTION_TYPES.map((qt) => (
                  <option key={qt.value} value={qt.value}>
                    {t(qt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("teacher.question")} *
              </label>
              <textarea
                value={questionForm.question}
                onChange={(e) =>
                  setQuestionForm((p) => ({ ...p, question: e.target.value }))
                }
                required
                rows={3}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("teacher.mark")} ({t("common.optional")})
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={questionForm.mark}
                onChange={(e) =>
                  setQuestionForm((p) => ({ ...p, mark: e.target.value }))
                }
                placeholder="1"
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            {questionForm.questionType === "multiple-choice" && (
              <>
                {OPTIONS.map((opt) => (
                  <div key={opt}>
                    <label className="block text-sm font-medium text-lms-primary mb-1">
                      {t("teacher.option", { letter: opt })} *
                    </label>
                    <input
                      type="text"
                      value={questionForm[`option${opt}`]}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          [`option${opt}`]: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.correctAnswer")} *
                  </label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) =>
                      setQuestionForm((p) => ({
                        ...p,
                        correctAnswer: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                  >
                    {OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {t("teacher.option", { letter: opt })}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {questionForm.questionType === "open-ended" && (
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.modelAnswer")} ({t("common.optional")})
                </label>
                <textarea
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionForm((p) => ({ ...p, correctAnswer: e.target.value }))
                  }
                  rows={2}
                  placeholder={t("teacher.modelAnswerPlaceholder")}
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
              >
                {submitting ? t("common.saving") : t("common.save")}
              </button>
              <button
                type="button"
                onClick={() => setQuestionFormOpen(false)}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-lg font-semibold text-lms-primary mb-4">{t("teacher.questions")}</h2>
      {questions.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-lms-cream text-center text-lms-primary/80">
          {t("teacher.noQuestionsYet")}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={q._id}
              className="p-4 bg-white rounded-xl border border-lms-cream"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-lms-cream text-lms-primary">
                      {q.questionType === "open-ended" ? t("teacher.questionTypeOpenEnded") : t("teacher.questionTypeMultipleChoice")}
                    </span>
                    {q.mark != null && (
                      <span className="text-xs text-lms-primary/80">{t("teacher.markLabel", { mark: q.mark })}</span>
                    )}
                  </div>
                  <p className="font-medium text-lms-primary">
                    {i + 1}. {q.question}
                  </p>
                  {q.questionType === "multiple-choice" && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-lms-primary/90">
                      {q.optionA && <span>A. {q.optionA}</span>}
                      {q.optionB && <span>B. {q.optionB}</span>}
                      {q.optionC && <span>C. {q.optionC}</span>}
                      {q.optionD && <span>D. {q.optionD}</span>}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-green-700">
                    {q.questionType === "open-ended"
                      ? (q.correctAnswer ? `${t("teacher.modelAnswer")}: ${q.correctAnswer}` : t("teacher.openEndedNoModel"))
                      : `${t("teacher.correctAnswer")}: ${q.correctAnswer}`}
                  </p>
                </div>
                <button
                  onClick={() => openEditQuestion(q)}
                  className="text-lms-primary/90 hover:text-lms-primary text-sm"
                >
                  {t("common.edit")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamDetailPage;
