/**
 * Utilities for displaying student answers in grading and result views.
 * Supports all question types: multiple-choice, open-ended, gap-fill, translation,
 * correct-mistake, matching, sentence-ordering, long-form.
 */

const BLANK_PATTERN = /_____|\{\d+\}/g;

/**
 * Format student answer for display by question type.
 * @param {Object} aq - answeredQuestion from API
 * @param {Object} question - full question from exam.questions (optional, for gap-fill in-context)
 * @returns {string|React.ReactNode} - formatted display
 */
export function formatStudentAnswer(aq, question = null) {
  const type = aq?.questionType || "multiple-choice";
  const payload = aq?.studentAnswerPayload;
  const raw = aq?.studentAnswer;

  switch (type) {
    case "multiple-choice":
      return raw || "—";

    case "open-ended":
    case "long-form":
    case "translation":
    case "correct-mistake":
      return raw || "—";

    case "gap-fill": {
      const arr = Array.isArray(payload) ? payload : (raw ? parseJsonSafe(raw) : null);
      if (!Array.isArray(arr) || arr.length === 0) return raw || "—";

      if (question?.gapFillPayload?.contentWithBlanks) {
        return formatGapFillInContext(question.gapFillPayload.contentWithBlanks, arr);
      }
      return arr.join(", ");
    }

    case "matching": {
      const pairs = Array.isArray(payload) ? payload : (raw ? parseJsonSafe(raw) : null);
      if (!Array.isArray(pairs) || pairs.length === 0) return raw || "—";

      const leftItems = question?.matchingPayload?.leftItems || [];
      const rightItems = question?.matchingPayload?.rightItems || [];
      return pairs
        .map(([lIdx, rIdx]) => {
          const left = leftItems[lIdx] ?? `[${lIdx}]`;
          const right = rightItems[rIdx] ?? `[${rIdx}]`;
          return `${left} → ${right}`;
        })
        .join("; ");
    }

    case "sentence-ordering": {
      const order = Array.isArray(payload) ? payload : (raw ? parseJsonSafe(raw) : null);
      if (!Array.isArray(order) || order.length === 0) return raw || "—";

      const words = question?.sentenceOrderingPayload?.jumbledWords || [];
      return order.map((idx) => words[idx] ?? `[${idx}]`).join(" ");
    }

    default:
      return raw || "—";
  }
}

function parseJsonSafe(str) {
  if (typeof str !== "string") return null;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatGapFillInContext(contentWithBlanks, studentAnswers) {
  if (!contentWithBlanks) return studentAnswers.join(", ");
  const parts = contentWithBlanks.split(BLANK_PATTERN);
  const blanks = contentWithBlanks.match(BLANK_PATTERN) || [];
  let result = "";
  let idx = 0;
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (blanks[i] !== undefined) {
      result += `[${studentAnswers[idx] ?? "—"}]`;
      idx++;
    }
  }
  return result;
}

/**
 * Check if question type is auto-graded (no manual points input).
 */
export function isAutoGraded(type) {
  return [
    "multiple-choice",
    "gap-fill",
    "correct-mistake",
    "matching",
    "sentence-ordering",
  ].includes(type);
}

/**
 * Check if question type needs manual grading.
 */
export function needsManualGrading(type) {
  return ["open-ended", "translation", "long-form"].includes(type);
}
