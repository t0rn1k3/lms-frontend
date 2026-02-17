import { useState, useEffect } from "react";
import {
  questionService,
  adminService,
  getErrorMessage,
} from "../../api";

const OPTIONS = ["A", "B", "C", "D"];
const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "open-ended", label: "Open-ended" },
];

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    examId: "",
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

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await questionService.list();
      setQuestions(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const { data } = await adminService.getExams();
      setExams(data.data || []);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, []);

  const getExamName = (questionId) => {
    for (const exam of exams) {
      const ids = (exam.questions || []).map((q) =>
        typeof q === "object" ? q._id : q
      );
      if (ids.includes(questionId)) return exam.name || "—";
    }
    return "—";
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      examId: exams.length === 1 ? exams[0]._id : "",
      question: "",
      questionType: "multiple-choice",
      mark: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setFormData({
      examId: "",
      question: item.question || "",
      questionType: item.questionType || "multiple-choice",
      mark: item.mark != null ? String(item.mark) : "",
      optionA: item.optionA || "",
      optionB: item.optionB || "",
      optionC: item.optionC || "",
      optionD: item.optionD || "",
      correctAnswer: item.correctAnswer || "A",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        question: formData.question.trim(),
        questionType: formData.questionType,
        mark: formData.mark ? Number(formData.mark) : undefined,
      };
      if (formData.questionType === "multiple-choice") {
        payload.optionA = formData.optionA.trim();
        payload.optionB = formData.optionB.trim();
        payload.optionC = formData.optionC.trim();
        payload.optionD = formData.optionD.trim();
        payload.correctAnswer = formData.correctAnswer;
      } else {
        payload.correctAnswer = formData.correctAnswer?.trim() || undefined;
        if (formData.optionA?.trim()) payload.optionA = formData.optionA.trim();
        if (formData.optionB?.trim()) payload.optionB = formData.optionB.trim();
        if (formData.optionC?.trim()) payload.optionC = formData.optionC.trim();
        if (formData.optionD?.trim()) payload.optionD = formData.optionD.trim();
      }
      if (editingId) {
        await questionService.update(editingId, payload);
      } else {
        if (!formData.examId) {
          setError("Please select an exam.");
          setSubmitting(false);
          return;
        }
        await questionService.create(formData.examId, payload);
      }
      setFormOpen(false);
      fetchQuestions();
      fetchExams();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lms-primary">Questions</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          Add Question
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {formOpen && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-lms-cream">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {editingId ? "Edit Question" : "New Question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  Exam <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.examId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examId: e.target.value }))
                  }
                  required={!editingId}
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">
                    {exams.length === 0 ? "No exams—create an exam first" : "Select exam"}
                  </option>
                  {exams.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                Question Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.questionType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, questionType: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                {QUESTION_TYPES.map((qt) => (
                  <option key={qt.value} value={qt.value}>
                    {qt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
                placeholder="Enter the question text"
                required
                rows={3}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                Mark (optional)
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={formData.mark}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mark: e.target.value }))
                }
                placeholder="1"
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            {formData.questionType === "multiple-choice" && (
              <>
                {OPTIONS.map((opt) => (
                  <div key={opt}>
                    <label className="block text-sm font-medium text-lms-primary mb-1">
                      Option {opt} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData[`option${opt}`]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
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
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        correctAnswer: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                  >
                    {OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        Option {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {formData.questionType === "open-ended" && (
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  Model answer (optional)
                </label>
                <textarea
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, correctAnswer: e.target.value }))
                  }
                  rows={2}
                  placeholder="Reference answer for grading"
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
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-lms-cream overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-lms-primary/80">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            No questions yet. Click &quot;Add Question&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  Question
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  Exam
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  Correct
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream">
              {questions.map((item) => (
                <tr key={item._id} className="hover:bg-lms-cream/30/50">
                  <td className="px-4 py-3 max-w-md">
                    <span className="text-lms-primary line-clamp-2">
                      {item.question}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-lms-cream text-lms-primary">
                      {item.questionType === "open-ended" ? "Open-ended" : "Multiple Choice"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getExamName(item._id)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {item.correctAnswer}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-lms-primary/90 hover:text-lms-primary"
                    >
                      Edit
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

export default QuestionsPage;
