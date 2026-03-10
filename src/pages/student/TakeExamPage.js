import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { studentService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage, PageError } from "../../components";

const OPTIONS = ["A", "B", "C", "D"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BLANK_PATTERN = /_____|\{\d+\}/g;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function countBlanks(text) {
  return (text?.match(BLANK_PATTERN) || []).length;
}

function parseGapFillContent(content) {
  if (!content) return [{ type: "text", value: "" }];
  const parts = content.split(BLANK_PATTERN);
  const blanks = content.match(BLANK_PATTERN) || [];
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) result.push({ type: "text", value: parts[i] });
    if (blanks[i]) result.push({ type: "blank", index: i });
  }
  return result;
}

function getDefaultAnswer(q) {
  const type = q?.questionType || "multiple-choice";
  if (type === "gap-fill") return new Array(countBlanks(q?.gapFillPayload?.contentWithBlanks || "")).fill("");
  if (type === "matching") return [];
  if (type === "sentence-ordering") return [];
  return "";
}

function isAnswerFilled(value, q) {
  const type = q?.questionType || "multiple-choice";
  if (type === "gap-fill") {
    if (!Array.isArray(value)) return false;
    return value.every((v) => String(v).trim());
  }
  if (type === "matching") {
    if (!Array.isArray(value)) return false;
    const leftCount = (q?.matchingPayload?.leftItems || []).filter((x) => String(x).trim()).length;
    if (value.length !== leftCount) return false;
    const rightIndices = value.map(([, r]) => r).filter((r) => r !== "" && r !== undefined);
    const uniqueRight = new Set(rightIndices);
    if (uniqueRight.size !== rightIndices.length) return false; // no duplicate right items
    return value.every((pair) => Array.isArray(pair) && pair.length === 2 && pair[1] !== "" && pair[1] !== undefined);
  }
  if (type === "sentence-ordering") {
    if (!Array.isArray(value)) return false;
    const wordCount = (q?.sentenceOrderingPayload?.jumbledWords || []).filter((w) => String(w).trim()).length;
    return value.length === wordCount;
  }
  return value != null && String(value).trim() !== "";
}

function getLanguageLabel(code, t) {
  if (code === "en") return t("student.languageEn");
  if (code === "ka") return t("student.languageKa");
  return code;
}

function TakeExamPage() {
  const { t } = useTranslation();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const shuffledData = useMemo(() => {
    const questions = exam?.questions || [];
    const gapFill = {};
    const matching = {};
    const sentenceOrdering = {};
    questions.forEach((q, idx) => {
      if (q.questionType === "gap-fill" && q.gapFillPayload?.wordBank?.length) {
        gapFill[idx] = shuffleArray(q.gapFillPayload.wordBank.filter((w) => String(w).trim()));
      }
      if (q.questionType === "matching" && q.matchingPayload?.rightItems?.length) {
        const right = q.matchingPayload.rightItems.map((_, i) => i);
        matching[idx] = shuffleArray(right);
      }
      if (q.questionType === "sentence-ordering" && q.sentenceOrderingPayload?.jumbledWords?.length) {
        const words = q.sentenceOrderingPayload.jumbledWords.filter((w) => String(w).trim());
        sentenceOrdering[idx] = shuffleArray(words.map((_, i) => i));
      }
    });
    return { gapFill, matching, sentenceOrdering };
  }, [exam?.questions]);

  const isProjectSubmission = exam?.examType === "project-submission";

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await studentService.getExam(examId);
        const examData = data?.data ?? data;
        setExam(examData);
        if (examData?.examType !== "project-submission") {
          const questions = examData?.questions || [];
          setAnswers(questions.map((q) => getDefaultAnswer(q)));
        }
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError(t("student.projectFileMustBeZip"));
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(t("student.projectFileMaxSize", { mb: MAX_FILE_SIZE_MB }));
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleProjectSubmitClick = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t("student.projectSelectFile"));
      return;
    }
    setError("");
    setShowConfirm(true);
  };

  const handleProjectSubmitConfirm = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await studentService.submitProject(examId, formData);
      navigate("/student/results", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    const questions = exam?.questions || [];
    if (answers.length !== questions.length) {
      setError(t("common.answerAllQuestions"));
      return;
    }
    const hasEmpty = questions.some((q, i) => !isAnswerFilled(answers[i], q));
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
  const answeredCount = questions.filter((q, i) => isAnswerFilled(answers[i], q)).length;

  if (isProjectSubmission) {
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
            <span className="text-sm text-lms-primary/80">{t("student.date")}</span>
            <p className="font-medium">
              {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
            <span className="text-sm text-lms-primary/80">{t("student.time")}</span>
            <p className="font-medium">{exam.examTime || "—"}</p>
          </div>
          {exam.passMark != null && (
            <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
              <span className="text-sm text-lms-primary/80">{t("teacher.passMark")}</span>
              <p className="font-medium">{t("teacher.passMarkLabel", { value: exam.passMark })}</p>
            </div>
          )}
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <div className="p-6 bg-white rounded-xl border border-lms-cream max-w-xl">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {t("student.projectSubmissionTitle")}
          </h2>
          <p className="text-sm text-lms-primary/90 mb-4">
            {t("student.projectSubmissionDesc", { mb: MAX_FILE_SIZE_MB })}
          </p>
          <form onSubmit={handleProjectSubmitClick}>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="block w-full text-sm text-lms-primary/90 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-lms-cream file:text-lms-primary hover:file:bg-lms-cream/80"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-lms-primary/80">
                {t("student.projectFileSelected")}: {selectedFile.name}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="mt-4 px-6 py-3 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50 font-medium"
            >
              {t("student.submitProject")}
            </button>
          </form>
        </div>

        {showConfirm && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowConfirm(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-lms-primary mb-2">
                {t("student.projectSubmitConfirmTitle")}
              </h3>
              <p className="text-lms-primary/90 mb-6">
                {t("student.projectSubmitConfirmMessage")}
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
                  onClick={handleProjectSubmitConfirm}
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
        {exam.passMark != null && (
          <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
            <span className="text-sm text-lms-primary/80">{t("teacher.passMark")}</span>
            <p className="font-medium">{t("teacher.passMarkLabel", { value: exam.passMark })}</p>
          </div>
        )}
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
            <p className="text-xs text-lms-primary/70 mb-1">
              {t("student.questionOf", { current: i + 1, total: questions.length })}
            </p>
            <p className="font-medium text-lms-primary mb-4">
              {i + 1}. {q.question}
            </p>

            {q.questionType === "multiple-choice" && (
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

            {(q.questionType === "open-ended" || q.questionType === "long-form") && (
              <div>
                <label className="block text-sm text-lms-primary/90 mb-2">
                  {t("student.yourAnswer")}
                </label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => handleAnswer(i, e.target.value)}
                  rows={q.questionType === "long-form" ? 8 : 4}
                  placeholder={t("student.writeYourAnswer")}
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            )}

            {q.questionType === "gap-fill" && (
              <GapFillQuestion
                question={q}
                answer={answers[i] || []}
                onChange={(val) => handleAnswer(i, val)}
                shuffledWords={shuffledData.gapFill[i]}
                t={t}
              />
            )}

            {q.questionType === "translation" && (
              <TranslationQuestion
                question={q}
                answer={answers[i] || ""}
                onChange={(val) => handleAnswer(i, val)}
                t={t}
              />
            )}

            {q.questionType === "correct-mistake" && (
              <CorrectMistakeQuestion
                question={q}
                answer={answers[i] || ""}
                onChange={(val) => handleAnswer(i, val)}
                t={t}
              />
            )}

            {q.questionType === "matching" && (
              <MatchingQuestion
                question={q}
                answer={answers[i] || []}
                onChange={(val) => handleAnswer(i, val)}
                shuffledRightIndices={shuffledData.matching[i]}
                t={t}
              />
            )}

            {q.questionType === "sentence-ordering" && (
              <SentenceOrderingQuestion
                question={q}
                answer={answers[i] || []}
                onChange={(val) => handleAnswer(i, val)}
                shuffledDisplayIndices={shuffledData.sentenceOrdering[i]}
                t={t}
              />
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
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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

function GapFillQuestion({ question, answer, onChange, shuffledWords, t }) {
  const payload = question.gapFillPayload || {};
  const content = payload.contentWithBlanks || "";
  const wordBank = shuffledWords || payload.wordBank || [];
  const parts = parseGapFillContent(content);

  const blankCount = countBlanks(content);
  const currentAnswer = Array.isArray(answer) ? answer : [];
  const padded = Array.from({ length: blankCount }, (_, i) => currentAnswer[i] ?? "");

  const handleBlankChange = (blankIndex, value) => {
    const next = [...padded];
    next[blankIndex] = value;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1">
        {parts.map((part, idx) =>
          part.type === "text" ? (
            <span key={idx} className="text-lms-primary">
              {part.value}
            </span>
          ) : (
            <select
              key={idx}
              value={padded[part.index] || ""}
              onChange={(e) => handleBlankChange(part.index, e.target.value)}
              className="px-2 py-1 border border-lms-cream rounded min-w-[100px] text-lms-primary"
            >
              <option value="">{t("student.selectOption")}</option>
              {wordBank.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          )
        )}
      </div>
      <div>
        <p className="text-xs text-lms-primary/70 mb-2">{t("student.wordBank")}</p>
        <p className="text-sm text-lms-primary/90">{wordBank.join(", ")}</p>
      </div>
    </div>
  );
}

function TranslationQuestion({ question, answer, onChange, t }) {
  const payload = question.translationPayload || {};
  const from = getLanguageLabel(payload.sourceLanguage, t);
  const to = getLanguageLabel(payload.targetLanguage, t);

  return (
    <div className="space-y-4">
      <p className="text-sm text-lms-primary/80">
        {t("student.translateFromTo", { from, to })}
      </p>
      <div className="p-3 bg-lms-cream/30 rounded-lg border border-lms-cream">
        <p className="text-xs text-lms-primary/70 mb-1">{t("student.sourceText")}</p>
        <p className="text-lms-primary">{payload.sourceText || ""}</p>
      </div>
      <div>
        <label className="block text-sm text-lms-primary/90 mb-2">{t("student.yourAnswer")}</label>
        <textarea
          value={answer || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={t("student.writeYourAnswer")}
          className="w-full px-3 py-2 border border-lms-cream rounded-lg"
        />
      </div>
    </div>
  );
}

function CorrectMistakeQuestion({ question, answer, onChange, t }) {
  const payload = question.correctMistakePayload || {};

  return (
    <div className="space-y-4">
      <div className="p-3 bg-lms-cream/30 rounded-lg border border-lms-cream">
        <p className="text-xs text-lms-primary/70 mb-1">{t("student.incorrectSentence")}</p>
        <p className="text-lms-primary">{payload.incorrectSentence || ""}</p>
      </div>
      <div>
        <label className="block text-sm text-lms-primary/90 mb-2">{t("student.correctTheSentence")}</label>
        <textarea
          value={answer || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={t("student.writeYourAnswer")}
          className="w-full px-3 py-2 border border-lms-cream rounded-lg"
        />
      </div>
    </div>
  );
}

function MatchingQuestion({ question, answer, onChange, shuffledRightIndices, t }) {
  const payload = question.matchingPayload || {};
  const leftItems = (payload.leftItems || []).filter((x) => String(x).trim());
  const rightItems = (payload.rightItems || []).filter((x) => String(x).trim());
  const shuffledRight = shuffledRightIndices != null
    ? shuffledRightIndices.map((i) => ({ index: i, text: rightItems[i] }))
    : rightItems.map((r, i) => ({ index: i, text: r }));

  const pairs = Array.isArray(answer) ? answer : [];
  const pairMap = {};
  pairs.forEach(([l, r]) => { pairMap[l] = r; });

  const handleSelect = (leftIdx, rightIdx) => {
    const next = pairs.filter(([l]) => l !== leftIdx);
    if (rightIdx !== "" && rightIdx !== undefined) {
      next.push([leftIdx, Number(rightIdx)]);
    }
    next.sort((a, b) => a[0] - b[0]);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-lms-primary/80">{t("student.matchLeftWithRight")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {leftItems.map((item, leftIdx) => (
            <div key={leftIdx} className="flex items-center gap-3">
              <span className="text-sm font-medium text-lms-primary w-32 shrink-0">{item}</span>
              <span className="text-lms-primary/60">→</span>
              <select
                value={pairMap[leftIdx] ?? ""}
                onChange={(e) => handleSelect(leftIdx, e.target.value === "" ? null : e.target.value)}
                className="flex-1 px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="">{t("student.selectOption")}</option>
                {shuffledRight.map(({ index, text }) => (
                  <option key={index} value={index}>
                    {text}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentenceOrderingQuestion({ question, answer, onChange, shuffledDisplayIndices, t }) {
  const payload = question.sentenceOrderingPayload || {};
  const words = (payload.jumbledWords || []).filter((w) => String(w).trim());
  const displayOrder = shuffledDisplayIndices ?? words.map((_, i) => i);
  const displayedItems = displayOrder.map((idx) => ({ originalIndex: idx, text: words[idx] }));

  const currentOrder = Array.isArray(answer) ? answer : [];

  const handleClick = (originalIndex) => {
    const idx = currentOrder.indexOf(originalIndex);
    let next;
    if (idx >= 0) {
      next = currentOrder.filter((_, i) => i !== idx);
    } else {
      next = [...currentOrder, originalIndex];
    }
    onChange(next);
  };

  const orderText = currentOrder.map((i) => words[i]).filter(Boolean).join(" ");

  return (
    <div className="space-y-4">
      <p className="text-sm text-lms-primary/80">{t("student.clickToBuildOrder")}</p>
      <div className="flex flex-wrap gap-2">
        {displayedItems.map(({ originalIndex, text }) => (
          <button
            key={originalIndex}
            type="button"
            onClick={() => handleClick(originalIndex)}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
              currentOrder.includes(originalIndex)
                ? "border-lms-primary bg-lms-cream/50 text-lms-primary"
                : "border-lms-cream bg-white hover:bg-lms-cream/30 text-lms-primary"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="p-3 bg-lms-cream/30 rounded-lg border border-lms-cream min-h-[48px]">
        <p className="text-xs text-lms-primary/70 mb-1">{t("student.yourAnswer")}</p>
        <p className="text-lms-primary">{orderText || "—"}</p>
      </div>
    </div>
  );
}

export default TakeExamPage;
