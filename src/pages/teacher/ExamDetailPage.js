import { useState, useEffect, useRef } from "react";
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
  { value: "gap-fill", labelKey: "teacher.questionTypeGapFill" },
  { value: "translation", labelKey: "teacher.questionTypeTranslation" },
  { value: "correct-mistake", labelKey: "teacher.questionTypeCorrectMistake" },
  { value: "matching", labelKey: "teacher.questionTypeMatching" },
  { value: "sentence-ordering", labelKey: "teacher.questionTypeSentenceOrdering" },
  { value: "long-form", labelKey: "teacher.questionTypeLongForm" },
];
const BLANK_PLACEHOLDER = "_____";

function getQuestionTypeLabel(type, t) {
  const entry = QUESTION_TYPES.find((qt) => qt.value === type);
  return entry ? t(entry.labelKey) : type;
}

function getQuestionPreview(q) {
  if (q.questionType === "multiple-choice") {
    return [
      q.optionA && `A. ${q.optionA}`,
      q.optionB && `B. ${q.optionB}`,
      q.optionC && `C. ${q.optionC}`,
      q.optionD && `D. ${q.optionD}`,
    ].filter(Boolean);
  }
  if (q.questionType === "open-ended")
    return q.correctAnswer ? [q.correctAnswer] : [];
  if (q.questionType === "gap-fill" && q.gapFillPayload) {
    const { contentWithBlanks, wordBank } = q.gapFillPayload;
    return [
      contentWithBlanks && `Content: ${contentWithBlanks.slice(0, 80)}...`,
      wordBank?.length ? `Words: ${wordBank.slice(0, 5).join(", ")}` : null,
    ].filter(Boolean);
  }
  if (q.questionType === "translation" && q.translationPayload) {
    return [`${q.translationPayload.sourceText?.slice(0, 50)}...`].filter(Boolean);
  }
  if (q.questionType === "correct-mistake" && q.correctMistakePayload) {
    return [q.correctMistakePayload.incorrectSentence?.slice(0, 60)].filter(Boolean);
  }
  if (q.questionType === "matching" && q.matchingPayload) {
    const { leftItems, rightItems } = q.matchingPayload;
    return [
      leftItems?.length ? `Left: ${leftItems.length} items` : null,
      rightItems?.length ? `Right: ${rightItems.length} items` : null,
    ].filter(Boolean);
  }
  if (q.questionType === "sentence-ordering" && q.sentenceOrderingPayload) {
    const words = q.sentenceOrderingPayload.jumbledWords || [];
    return [words.length ? `Words: ${words.slice(0, 5).join(", ")}` : null].filter(Boolean);
  }
  if (q.questionType === "long-form") return [];
  return [];
}

function ExamDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const getDefaultForm = (overrides = {}) => ({
    question: "",
    questionType: "multiple-choice",
    mark: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    gapFillPayload: {
      contentWithBlanks: "",
      wordBank: [""],
      correctAnswers: [],
    },
    translationPayload: {
      sourceText: "",
      sourceLanguage: "ka",
      targetLanguage: "en",
      acceptedAnswers: "",
    },
    correctMistakePayload: {
      incorrectSentence: "",
      correctAnswers: [""],
    },
    matchingPayload: {
      leftItems: [""],
      rightItems: [""],
      correctPairs: [],
    },
    sentenceOrderingPayload: {
      jumbledWords: [""],
      correctOrder: [],
    },
    ...overrides,
  });

  const [questionForm, setQuestionForm] = useState(getDefaultForm());
  const [submitting, setSubmitting] = useState(false);
  const gapFillContentRef = useRef(null);

  const getRefName = (val) => (typeof val === "object" ? val?.name : val);

  const formatModulesDisplay = (exam) => {
    const mods = exam?.modules ?? (exam?.module ? [exam.module] : []);
    if (!mods?.length) return getRefName(exam?.subject) || "—";
    return mods.map(getRefName).filter(Boolean).join(", ") || "—";
  };

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
    setQuestionForm(getDefaultForm());
    setQuestionFormOpen(true);
  };

  const openEditQuestion = async (q) => {
    setEditingQuestionId(q._id);
    try {
      const { data } = await teacherQuestionService.getOne(q._id);
      const res = data?.data ?? data ?? q;
      const base = {
        question: res.question || "",
        questionType: res.questionType || "multiple-choice",
        mark: res.mark != null ? String(res.mark) : "",
        optionA: res.optionA || "",
        optionB: res.optionB || "",
        optionC: res.optionC || "",
        optionD: res.optionD || "",
        correctAnswer: res.correctAnswer || "A",
      };
      if (res.questionType === "gap-fill" && res.gapFillPayload) {
        base.gapFillPayload = {
          contentWithBlanks: res.gapFillPayload.contentWithBlanks || "",
          wordBank: (res.gapFillPayload.wordBank || []).length
            ? res.gapFillPayload.wordBank
            : [""],
          correctAnswers: (res.gapFillPayload.correctAnswers || []).length
            ? res.gapFillPayload.correctAnswers
            : [],
        };
      } else {
        base.gapFillPayload = { contentWithBlanks: "", wordBank: [""], correctAnswers: [] };
      }
      if (res.questionType === "translation" && res.translationPayload) {
        base.translationPayload = {
          sourceText: res.translationPayload.sourceText || "",
          sourceLanguage: res.translationPayload.sourceLanguage || "ka",
          targetLanguage: res.translationPayload.targetLanguage || "en",
          acceptedAnswers: (res.translationPayload.acceptedAnswers || []).join("\n"),
        };
      } else {
        base.translationPayload = { sourceText: "", sourceLanguage: "ka", targetLanguage: "en", acceptedAnswers: "" };
      }
      if (res.questionType === "correct-mistake" && res.correctMistakePayload) {
        base.correctMistakePayload = {
          incorrectSentence: res.correctMistakePayload.incorrectSentence || "",
          correctAnswers: (res.correctMistakePayload.correctAnswers || []).length
            ? res.correctMistakePayload.correctAnswers
            : [""],
        };
      } else {
        base.correctMistakePayload = { incorrectSentence: "", correctAnswers: [""] };
      }
      if (res.questionType === "matching" && res.matchingPayload) {
        base.matchingPayload = {
          leftItems: (res.matchingPayload.leftItems || []).length ? res.matchingPayload.leftItems : [""],
          rightItems: (res.matchingPayload.rightItems || []).length ? res.matchingPayload.rightItems : [""],
          correctPairs: res.matchingPayload.correctPairs || [],
        };
      } else {
        base.matchingPayload = { leftItems: [""], rightItems: [""], correctPairs: [] };
      }
      if (res.questionType === "sentence-ordering" && res.sentenceOrderingPayload) {
        base.sentenceOrderingPayload = {
          jumbledWords: (res.sentenceOrderingPayload.jumbledWords || []).length
            ? res.sentenceOrderingPayload.jumbledWords
            : ["", ""],
          correctOrder: res.sentenceOrderingPayload.correctOrder || [],
        };
      } else {
        base.sentenceOrderingPayload = { jumbledWords: ["", ""], correctOrder: [] };
      }
      setQuestionForm({ ...getDefaultForm(), ...base });
    } catch (err) {
      setError(getErrorMessage(err));
      return;
    }
    setQuestionFormOpen(true);
  };

  const countBlanks = (text) => (text.match(/_____|\{\d+\}/g) || []).length;

  const validateQuestionForm = () => {
    const { questionType } = questionForm;
    if (!questionForm.question?.trim()) return t("teacher.question") + " is required";
    if (questionType === "multiple-choice") {
      if (!["A","B","C","D"].includes(questionForm.correctAnswer)) return "Invalid correct answer";
      if (!questionForm.optionA?.trim() || !questionForm.optionB?.trim()) return "Options A and B required";
    }
    if (questionType === "gap-fill") {
      const gf = questionForm.gapFillPayload || {};
      const blanks = countBlanks(gf.contentWithBlanks || "");
      const words = (gf.wordBank || []).filter((w) => String(w).trim());
      const correctAnswers = gf.correctAnswers || [];
      if (blanks < 1) return t("teacher.gapFillValidation");
      if (words.length < 1) return t("teacher.gapFillValidation");
      if (correctAnswers.length !== blanks) return t("teacher.gapFillValidation");
    }
    if (questionType === "translation") {
      if (!(questionForm.translationPayload?.sourceText || "").trim()) return t("teacher.translationValidation");
    }
    if (questionType === "correct-mistake") {
      const cm = questionForm.correctMistakePayload || {};
      const correct = (cm.correctAnswers || []).filter((a) => String(a).trim());
      if (!(cm.incorrectSentence || "").trim() || correct.length < 1) return t("teacher.correctMistakeValidation");
    }
    if (questionType === "matching") {
      const mp = questionForm.matchingPayload || {};
      const left = (mp.leftItems || []).filter((x) => String(x).trim());
      const right = (mp.rightItems || []).filter((x) => String(x).trim());
      if (left.length !== right.length || left.length === 0) return t("teacher.matchingValidation");
      if ((mp.correctPairs || []).length !== left.length) return t("teacher.matchingValidation");
    }
    if (questionType === "sentence-ordering") {
      const so = questionForm.sentenceOrderingPayload || {};
      const words = (so.jumbledWords || []).filter((w) => String(w).trim());
      if (words.length < 2) return t("teacher.sentenceOrderingValidation");
      const order = so.correctOrder || [];
      if (order.length !== words.length) return t("teacher.sentenceOrderingValidation");
    }
    return null;
  };

  const buildPayload = () => {
    const type = questionForm.questionType;
    const payload = {
      question: questionForm.question.trim(),
      questionType: type,
      mark: questionForm.mark ? Number(questionForm.mark) : undefined,
    };
    if (type === "multiple-choice") {
      payload.optionA = questionForm.optionA?.trim();
      payload.optionB = questionForm.optionB?.trim();
      payload.optionC = questionForm.optionC?.trim();
      payload.optionD = questionForm.optionD?.trim();
      payload.correctAnswer = questionForm.correctAnswer;
    }
    if (type === "open-ended") {
      if (questionForm.correctAnswer?.trim()) payload.correctAnswer = questionForm.correctAnswer.trim();
    }
    if (type === "gap-fill") {
      const gf = questionForm.gapFillPayload || {};
      const blankCount = countBlanks(gf.contentWithBlanks || "");
      const rawAnswers = gf.correctAnswers || [];
      payload.gapFillPayload = {
        contentWithBlanks: gf.contentWithBlanks || "",
        wordBank: (gf.wordBank || []).map((w) => String(w).trim()).filter(Boolean),
        correctAnswers: Array.from({ length: blankCount }, (_, i) => {
          const arr = rawAnswers[i];
          if (Array.isArray(arr))
            return arr.map((a) => String(a).trim()).filter(Boolean);
          if (arr != null && arr !== "")
            return [String(arr).trim()];
          return [];
        }),
      };
    }
    if (type === "translation") {
      const tp = questionForm.translationPayload || {};
      payload.translationPayload = {
        sourceText: (tp.sourceText || "").trim(),
        sourceLanguage: tp.sourceLanguage || "ka",
        targetLanguage: tp.targetLanguage || "en",
        acceptedAnswers: (tp.acceptedAnswers || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }
    if (type === "correct-mistake") {
      const cm = questionForm.correctMistakePayload || {};
      payload.correctMistakePayload = {
        incorrectSentence: (cm.incorrectSentence || "").trim(),
        correctAnswers: (cm.correctAnswers || [])
          .map((a) => String(a).trim())
          .filter(Boolean),
      };
    }
    if (type === "matching") {
      const mp = questionForm.matchingPayload || {};
      const leftItems = (mp.leftItems || []).map((x) => String(x).trim()).filter(Boolean);
      const rightItems = (mp.rightItems || []).map((x) => String(x).trim()).filter(Boolean);
      const origLeft = mp.leftItems || [];
      const origRight = mp.rightItems || [];
      const leftOrigToFiltered = {}; // orig index -> filtered index
      const rightOrigToFiltered = {};
      let fi = 0;
      origLeft.forEach((x, i) => { if (String(x).trim()) { leftOrigToFiltered[i] = fi++; } });
      fi = 0;
      origRight.forEach((x, i) => { if (String(x).trim()) { rightOrigToFiltered[i] = fi++; } });
      const correctPairs = (mp.correctPairs || [])
        .map(([l, r]) => [leftOrigToFiltered[l], rightOrigToFiltered[r]])
        .filter(([l, r]) => l != null && r != null);
      payload.matchingPayload = { leftItems, rightItems, correctPairs };
    }
    if (type === "sentence-ordering") {
      const so = questionForm.sentenceOrderingPayload || {};
      payload.sentenceOrderingPayload = {
        jumbledWords: (so.jumbledWords || []).map((w) => String(w).trim()).filter(Boolean),
        correctOrder: so.correctOrder || [],
      };
    }
    return payload;
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationErr = validateQuestionForm();
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
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
          ← {t("student.backToExams")}
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">{t("admin.modules")}</span>
          <p className="font-medium">{formatModulesDisplay(exam)}</p>
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
          <span className="text-sm text-lms-primary/80">{t("teacher.questions")}</span>
          <p className="font-medium">{questions.length}</p>
        </div>
        {exam.passMark != null && (
          <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
            <span className="text-sm text-lms-primary/80">{t("teacher.passMark")}</span>
            <p className="font-medium">{t("teacher.passMarkLabel", { value: exam.passMark })}</p>
          </div>
        )}
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
                onChange={(e) => {
                  const newType = e.target.value;
                  setQuestionForm((p) => {
                    const defaults = getDefaultForm({ questionType: newType });
                    return {
                      ...p,
                      questionType: newType,
                      optionA: defaults.optionA,
                      optionB: defaults.optionB,
                      optionC: defaults.optionC,
                      optionD: defaults.optionD,
                      correctAnswer: defaults.correctAnswer,
                      gapFillPayload: defaults.gapFillPayload,
                      translationPayload: defaults.translationPayload,
                      correctMistakePayload: defaults.correctMistakePayload,
                      matchingPayload: defaults.matchingPayload,
                      sentenceOrderingPayload: defaults.sentenceOrderingPayload,
                    };
                  });
                }}
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
            {questionForm.questionType === "gap-fill" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.contentWithBlanks")} *
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      ref={gapFillContentRef}
                      value={questionForm.gapFillPayload?.contentWithBlanks || ""}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          gapFillPayload: {
                            ...(p.gapFillPayload || {}),
                            contentWithBlanks: e.target.value,
                          },
                        }))
                      }
                      rows={3}
                      placeholder="Use _____ for each blank"
                      className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = gapFillContentRef.current;
                        if (el) {
                          const start = el.selectionStart;
                          const val = questionForm.gapFillPayload?.contentWithBlanks || "";
                          const newVal = val.slice(0, start) + BLANK_PLACEHOLDER + val.slice(start);
                          setQuestionForm((p) => ({
                            ...p,
                            gapFillPayload: { ...(p.gapFillPayload || {}), contentWithBlanks: newVal },
                          }));
                          setTimeout(() => {
                            el.focus();
                            el.setSelectionRange(start + BLANK_PLACEHOLDER.length, start + BLANK_PLACEHOLDER.length);
                          }, 0);
                        }
                      }}
                      className="px-2 py-1 bg-lms-cream rounded text-sm"
                    >
                      {t("teacher.insertBlank")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.wordBank")} *
                  </label>
                  <div className="space-y-2">
                    {(questionForm.gapFillPayload?.wordBank || [""]).map((w, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={w}
                          onChange={(e) => {
                            const next = [...(questionForm.gapFillPayload?.wordBank || [""])];
                            next[idx] = e.target.value;
                            setQuestionForm((p) => ({
                              ...p,
                              gapFillPayload: { ...(p.gapFillPayload || {}), wordBank: next },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                          placeholder="Word"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (questionForm.gapFillPayload?.wordBank || [""]).filter((_, i) => i !== idx);
                            if (next.length === 0) next.push("");
                            setQuestionForm((p) => ({
                              ...p,
                              gapFillPayload: { ...(p.gapFillPayload || {}), wordBank: next },
                            }));
                          }}
                          className="text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm((p) => ({
                          ...p,
                          gapFillPayload: {
                            ...(p.gapFillPayload || {}),
                            wordBank: [...(p.gapFillPayload?.wordBank || [""]), ""],
                          },
                        }))
                      }
                      className="text-sm text-lms-primary/80"
                    >
                      + {t("teacher.addWord")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.correctAnswersPerBlank")} *
                  </label>
                  <div className="space-y-2">
                    {Array.from({
                      length: Math.max(
                        1,
                        countBlanks(questionForm.gapFillPayload?.contentWithBlanks || ""),
                      ),
                    }).map((_, idx) => (
                      <div key={idx}>
                        <label className="text-xs text-lms-primary/80">
                          {t("teacher.blankNumber", { num: idx + 1 })}
                        </label>
                        <input
                          type="text"
                          value={
                            (questionForm.gapFillPayload?.correctAnswers || [])[idx] != null
                              ? Array.isArray(questionForm.gapFillPayload.correctAnswers[idx])
                                ? questionForm.gapFillPayload.correctAnswers[idx].join(", ")
                                : String(questionForm.gapFillPayload.correctAnswers[idx])
                              : ""
                          }
                          onChange={(e) => {
                            const vals = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            const next = [...(questionForm.gapFillPayload?.correctAnswers || [])];
                            next[idx] = vals.length ? vals : [""];
                            setQuestionForm((p) => ({
                              ...p,
                              gapFillPayload: { ...(p.gapFillPayload || {}), correctAnswers: next },
                            }));
                          }}
                          placeholder="Accepted answers (comma-separated)"
                          className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {questionForm.questionType === "translation" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.sourceText")} *
                  </label>
                  <textarea
                    value={questionForm.translationPayload?.sourceText || ""}
                    onChange={(e) =>
                      setQuestionForm((p) => ({
                        ...p,
                        translationPayload: {
                          ...(p.translationPayload || {}),
                          sourceText: e.target.value,
                        },
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-lms-primary mb-1">
                      {t("teacher.sourceLanguage")}
                    </label>
                    <select
                      value={questionForm.translationPayload?.sourceLanguage || "ka"}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          translationPayload: {
                            ...(p.translationPayload || {}),
                            sourceLanguage: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                    >
                      <option value="en">{t("teacher.languageEn")}</option>
                      <option value="ka">{t("teacher.languageKa")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lms-primary mb-1">
                      {t("teacher.targetLanguage")}
                    </label>
                    <select
                      value={questionForm.translationPayload?.targetLanguage || "en"}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          translationPayload: {
                            ...(p.translationPayload || {}),
                            targetLanguage: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                    >
                      <option value="en">{t("teacher.languageEn")}</option>
                      <option value="ka">{t("teacher.languageKa")}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.acceptedAnswers")} ({t("common.optional")})
                  </label>
                  <textarea
                    value={questionForm.translationPayload?.acceptedAnswers || ""}
                    onChange={(e) =>
                      setQuestionForm((p) => ({
                        ...p,
                        translationPayload: {
                          ...(p.translationPayload || {}),
                          acceptedAnswers: e.target.value,
                        },
                      }))
                    }
                    rows={3}
                    placeholder="One per line"
                    className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                  />
                </div>
              </>
            )}
            {questionForm.questionType === "correct-mistake" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.incorrectSentence")} *
                  </label>
                  <textarea
                    value={questionForm.correctMistakePayload?.incorrectSentence || ""}
                    onChange={(e) =>
                      setQuestionForm((p) => ({
                        ...p,
                        correctMistakePayload: {
                          ...(p.correctMistakePayload || {}),
                          incorrectSentence: e.target.value,
                        },
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.correctAnswers")} *
                  </label>
                  <div className="space-y-2">
                    {(questionForm.correctMistakePayload?.correctAnswers || [""]).map((a, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={a}
                          onChange={(e) => {
                            const next = [...(questionForm.correctMistakePayload?.correctAnswers || [""])];
                            next[idx] = e.target.value;
                            setQuestionForm((p) => ({
                              ...p,
                              correctMistakePayload: { ...(p.correctMistakePayload || {}), correctAnswers: next },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (questionForm.correctMistakePayload?.correctAnswers || [""]).filter(
                              (_, i) => i !== idx,
                            );
                            setQuestionForm((p) => ({
                              ...p,
                              correctMistakePayload: {
                                ...(p.correctMistakePayload || {}),
                                correctAnswers: next.length ? next : [""],
                              },
                            }));
                          }}
                          className="text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm((p) => ({
                          ...p,
                          correctMistakePayload: {
                            ...(p.correctMistakePayload || {}),
                            correctAnswers: [...(p.correctMistakePayload?.correctAnswers || [""]), ""],
                          },
                        }))
                      }
                      className="text-sm text-lms-primary/80"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </>
            )}
            {questionForm.questionType === "matching" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.leftColumnItems")} *
                  </label>
                  <div className="space-y-2">
                    {(questionForm.matchingPayload?.leftItems || [""]).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const next = [...(questionForm.matchingPayload?.leftItems || [""])];
                            next[idx] = e.target.value;
                            setQuestionForm((p) => ({
                              ...p,
                              matchingPayload: { ...(p.matchingPayload || {}), leftItems: next },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const left = (questionForm.matchingPayload?.leftItems || [""]).filter(
                              (_, i) => i !== idx,
                            );
                            const pairs = (questionForm.matchingPayload?.correctPairs || []).filter(
                              ([l]) => l !== idx,
                            ).map(([l, r]) => (l > idx ? [l - 1, r] : [l, r]));
                            setQuestionForm((p) => ({
                              ...p,
                              matchingPayload: {
                                ...(p.matchingPayload || {}),
                                leftItems: left.length ? left : [""],
                                correctPairs: pairs,
                              },
                            }));
                          }}
                          className="text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm((p) => ({
                          ...p,
                          matchingPayload: {
                            ...(p.matchingPayload || {}),
                            leftItems: [...(p.matchingPayload?.leftItems || [""]), ""],
                          },
                        }))
                      }
                      className="text-sm text-lms-primary/80"
                    >
                      + {t("teacher.addItem")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.rightColumnItems")} *
                  </label>
                  <div className="space-y-2">
                    {(questionForm.matchingPayload?.rightItems || [""]).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const next = [...(questionForm.matchingPayload?.rightItems || [""])];
                            next[idx] = e.target.value;
                            setQuestionForm((p) => ({
                              ...p,
                              matchingPayload: { ...(p.matchingPayload || {}), rightItems: next },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const right = (questionForm.matchingPayload?.rightItems || [""]).filter(
                              (_, i) => i !== idx,
                            );
                            const pairs = (questionForm.matchingPayload?.correctPairs || []).filter(
                              ([, r]) => r !== idx,
                            ).map(([l, r]) => (r > idx ? [l, r - 1] : [l, r]));
                            setQuestionForm((p) => ({
                              ...p,
                              matchingPayload: {
                                ...(p.matchingPayload || {}),
                                rightItems: right.length ? right : [""],
                                correctPairs: pairs,
                              },
                            }));
                          }}
                          className="text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm((p) => ({
                          ...p,
                          matchingPayload: {
                            ...(p.matchingPayload || {}),
                            rightItems: [...(p.matchingPayload?.rightItems || [""]), ""],
                          },
                        }))
                      }
                      className="text-sm text-lms-primary/80"
                    >
                      + {t("teacher.addItem")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.matchWith")} *
                  </label>
                  <div className="space-y-2">
                    {(questionForm.matchingPayload?.leftItems || [""])
                      .map((x, originalIdx) => ({ x, originalIdx }))
                      .filter(({ x }) => x?.trim())
                      .map(({ x, originalIdx }) => (
                      <div key={originalIdx} className="flex items-center gap-2">
                        <span className="text-sm w-32 truncate">{x}</span>
                        <span>→</span>
                        <select
                          value={
                            (questionForm.matchingPayload?.correctPairs || []).find(([l]) => l === originalIdx)?.[1] ?? ""
                          }
                          onChange={(e) => {
                            const rightIdx = e.target.value === "" ? null : Number(e.target.value);
                            const pairs = (questionForm.matchingPayload?.correctPairs || []).filter(
                              ([l]) => l !== originalIdx,
                            );
                            if (rightIdx != null) pairs.push([originalIdx, rightIdx]);
                            setQuestionForm((p) => ({
                              ...p,
                              matchingPayload: { ...(p.matchingPayload || {}), correctPairs: pairs },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                        >
                          <option value="">{t("teacher.select")}</option>
                          {(questionForm.matchingPayload?.rightItems || [])
                            .filter((x) => x?.trim())
                            .map((r, rightIdx) => (
                              <option key={rightIdx} value={rightIdx}>
                                {r}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {questionForm.questionType === "sentence-ordering" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.jumbledWords")} *
                  </label>
                  <div className="space-y-2">
                    {(questionForm.sentenceOrderingPayload?.jumbledWords || ["", ""]).map((w, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={w}
                          onChange={(e) => {
                            const next = [...(questionForm.sentenceOrderingPayload?.jumbledWords || ["", ""])];
                            next[idx] = e.target.value;
                            setQuestionForm((p) => ({
                              ...p,
                              sentenceOrderingPayload: {
                                ...(p.sentenceOrderingPayload || {}),
                                jumbledWords: next,
                              },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const words = (questionForm.sentenceOrderingPayload?.jumbledWords || ["", ""]).filter(
                              (_, i) => i !== idx,
                            );
                            if (words.length < 2) return;
                            setQuestionForm((p) => ({
                              ...p,
                              sentenceOrderingPayload: {
                                ...(p.sentenceOrderingPayload || {}),
                                jumbledWords: words,
                                correctOrder: words.map((_, i) => i),
                              },
                            }));
                          }}
                          className="text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm((p) => ({
                          ...p,
                          sentenceOrderingPayload: {
                            ...(p.sentenceOrderingPayload || {}),
                            jumbledWords: [...(p.sentenceOrderingPayload?.jumbledWords || ["", ""]), ""],
                          },
                        }))
                      }
                      className="text-sm text-lms-primary/80"
                    >
                      + {t("teacher.addItem")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("teacher.correctOrder")}
                  </label>
                  <p className="text-xs text-lms-primary/70 mb-1">
                    Use the order of words above. Click the button to set that order as correct.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const words = (questionForm.sentenceOrderingPayload?.jumbledWords || []).filter((w) =>
                        String(w).trim(),
                      );
                      setQuestionForm((p) => ({
                        ...p,
                        sentenceOrderingPayload: {
                          ...(p.sentenceOrderingPayload || {}),
                          correctOrder: words.map((_, i) => i),
                        },
                      }));
                    }}
                    className="px-3 py-2 bg-lms-cream rounded-lg text-sm"
                  >
                    {t("teacher.setCurrentOrderAsCorrect")}
                  </button>
                </div>
              </>
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
                      {getQuestionTypeLabel(q.questionType, t)}
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
                  {q.questionType !== "multiple-choice" && getQuestionPreview(q).length > 0 && (
                    <div className="mt-2 space-y-1 text-sm text-lms-primary/90">
                      {getQuestionPreview(q).map((line, idx) => (
                        <p key={idx} className="text-xs">{line}</p>
                      ))}
                    </div>
                  )}
                  {(q.questionType === "multiple-choice" || (q.questionType === "open-ended" && q.correctAnswer)) && (
                    <p className="mt-2 text-xs text-green-700">
                      {q.questionType === "open-ended"
                        ? `${t("teacher.modelAnswer")}: ${q.correctAnswer}`
                        : `${t("teacher.correctAnswer")}: ${q.correctAnswer}`}
                    </p>
                  )}
                  {q.questionType === "open-ended" && !q.correctAnswer && (
                    <p className="mt-2 text-xs text-lms-primary/70">{t("teacher.openEndedNoModel")}</p>
                  )}
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
