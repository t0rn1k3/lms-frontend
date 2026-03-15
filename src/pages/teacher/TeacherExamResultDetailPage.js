import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examResultService, moduleService, getErrorMessage } from "../../api";
import { PageLoader, PageError, ErrorMessage } from "../../components";
import { formatStudentAnswer, isAutoGraded, needsManualGrading } from "../../utils/answerDisplay";

function getRefName(val, key = "name") {
  if (!val) return "—";
  return typeof val === "object" ? val?.[key] || val?._id : val;
}

/** Extract criteria from module: top-level criteria or flattened from learningOutcomes */
function getModuleCriteria(mod) {
  if (!mod) return [];
  if (Array.isArray(mod.criteria) && mod.criteria.length > 0) {
    return mod.criteria;
  }
  const los = mod.learningOutcomes || [];
  return los.flatMap((lo) => lo.criteria || []);
}

function getCriterionName(c, index) {
  return c?.name || c?.criterionName || c?.title || c?.description || `Criterion ${index + 1}`;
}

function TeacherExamResultDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradedAnswers, setGradedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [projectGrade, setProjectGrade] = useState({
    score: "",
    totalMark: "",
    status: "Pending",
    remarks: "",
  });
  const [criterionResults, setCriterionResults] = useState([]);

  const passCriteriaType =
    (typeof result?.exam === "object" && result?.exam?.passCriteriaType) ||
    "percentage";
  const isAllCriteria = passCriteriaType === "all-criteria";

  const isProjectResult =
    result?.submittedFile ||
    (typeof result?.exam === "object" &&
      result?.exam?.examType === "project-submission");

  const getStudentName = (r) => getRefName(r?.student) || r?.studentId || "—";

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await examResultService.teacherGetOne(id);
        const r = data?.data ?? data;
        setResult(r);
        const pt = (typeof r?.exam === "object" && r?.exam?.passCriteriaType) || "percentage";
        const isAllCriteriaMode = pt === "all-criteria";

        if (
          r?.submittedFile ||
          (typeof r?.exam === "object" &&
            r?.exam?.examType === "project-submission")
        ) {
          if (isAllCriteriaMode) {
            const effectiveCriteria = r?.effectiveCriteria;
            let criteria = [];
            if (Array.isArray(effectiveCriteria) && effectiveCriteria.length > 0) {
              criteria = effectiveCriteria;
            } else {
              let mod = typeof r?.exam?.module === "object" ? r.exam.module : null;
              const moduleId = mod?._id ?? (typeof r?.exam?.module === "string" ? r.exam.module : null);
              if (moduleId) {
                try {
                  const mRes = await moduleService.getOne(moduleId);
                  mod = mRes.data?.data ?? mRes.data ?? mod;
                } catch {
                  mod = mod || {};
                }
              }
              setModule(mod);
              criteria = getModuleCriteria(mod);
            }
            const existing = r.criterionResults || [];
            const prefill = criteria.map((c, i) => {
              const cid = c.id || c._id || `c-${i}`;
              const found = existing.find(
                (e) => (e.criterionId || e.id) === cid
              );
              return {
                criterionId: cid,
                criterionName: getCriterionName(c, i),
                passed: found ? found.passed : null,
              };
            });
            setCriterionResults(prefill);
          } else {
            setProjectGrade({
              score: r.score != null ? String(r.score) : "",
              totalMark: r.totalMark != null ? String(r.totalMark) : "",
              status: r.status || "Pending",
              remarks: r.remarks || "",
            });
          }
        } else {
          const initial = {};
          (r.answeredQuestions || []).forEach((aq, idx) => {
            if (aq.needsManualGrading && needsManualGrading(aq.questionType)) {
              initial[idx] = aq.pointsAwarded ?? 0;
            }
          });
          setGradedAnswers(initial);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const refreshResult = useCallback(async () => {
    try {
      const { data } = await examResultService.teacherGetOne(id);
      const r = data?.data ?? data;
      setResult(r);
      const pt = (typeof r?.exam === "object" && r?.exam?.passCriteriaType) || "percentage";
      if (pt === "all-criteria" && r?.criterionResults?.length) {
        setCriterionResults((prev) =>
          prev.length
            ? prev.map((p) => {
                const found = r.criterionResults.find(
                  (e) => (e.criterionId || e.id) === p.criterionId
                );
                return found ? { ...p, passed: found.passed } : p;
              })
            : (r.criterionResults || []).map((e) => ({
                criterionId: e.criterionId || e.id,
                criterionName: e.criterionName || e.name || "",
                passed: e.passed,
              }))
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [id]);

  const handleGradeChange = (index, value) => {
    const num = Math.max(0, Number(value) || 0);
    setGradedAnswers((prev) => ({ ...prev, [index]: num }));
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const aq = result?.answeredQuestions || [];
      const payload = Object.entries(gradedAnswers)
        .filter(([idx, pts]) => {
          const aqi = aq[Number(idx)];
          return pts != null && pts >= 0 && aqi?.needsManualGrading && needsManualGrading(aqi.questionType);
        })
        .map(([idx, pts]) => ({
          index: Number(idx),
          pointsAwarded: Number(pts),
        }));
      await examResultService.teacherGrade(id, payload);
      await refreshResult();
      setGradedAnswers({});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setError("");
    setPublishing(true);
    try {
      await examResultService.teacherPublish(id);
      await refreshResult();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = async () => {
    setError("");
    setDownloading(true);
    try {
      const response = await examResultService.teacherDownload(id);
      const blob = response.data;
      const headers = response.headers || {};
      const contentType = headers["content-type"] || "";

      if (contentType.includes("application/json") && blob instanceof Blob) {
        try {
          const text = await blob.text();
          const errJson = JSON.parse(text || "{}");
          throw new Error(errJson.message || "Download failed");
        } catch (e) {
          throw e instanceof Error ? e : new Error("Download failed");
        }
      }

      if (!blob || !(blob instanceof Blob)) {
        throw new Error("Invalid file response");
      }

      const contentDisp = headers["content-disposition"] || "";
      const match = contentDisp.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1]?.trim() ||
        result?.submittedFile?.originalName ||
        "submission.zip";
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleCriterionChange = (index, field, value) => {
    setCriterionResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleProjectGradeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const pt = (typeof result?.exam === "object" && result?.exam?.passCriteriaType) || "percentage";
      if (pt === "all-criteria") {
        const hasUnset = criterionResults.some((c) => c.passed === null || c.passed === undefined);
        if (hasUnset) {
          setError(t("teacher.criterionResultsRequired"));
          setSubmitting(false);
          return;
        }
        const payload = {
          criterionResults: criterionResults.map((c) => ({
            criterionId: c.criterionId,
            criterionName: c.criterionName,
            passed: Boolean(c.passed),
            ...(c.notes?.trim() && { notes: c.notes.trim() }),
          })),
        };
        await examResultService.teacherGradeProject(id, payload);
        await refreshResult();
      } else {
        const scoreNum = Number(projectGrade.score);
        if (Number.isNaN(scoreNum) || scoreNum < 0) {
          setError(t("teacher.projectGradeScoreRequired"));
          setSubmitting(false);
          return;
        }
        const payload = { score: scoreNum };
        if (projectGrade.totalMark)
          payload.totalMark = Number(projectGrade.totalMark);
        if (projectGrade.status) payload.status = projectGrade.status;
        if (projectGrade.remarks?.trim())
          payload.remarks = projectGrade.remarks.trim();
        await examResultService.teacherGradeProject(id, payload);
        await refreshResult();
        setProjectGrade((prev) => ({
          ...prev,
          score: "",
          totalMark: "",
          remarks: "",
        }));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader message={t("common.loading")} />;
  }

  if (error && !result) {
    return (
      <PageError
        message={error}
        backTo="/teacher/exam-results"
        backLabel={t("teacher.examResults")}
      />
    );
  }

  if (!result) return null;

  const answeredQuestions = result.answeredQuestions || [];
  const manualToGrade = answeredQuestions.filter(
    (aq) => aq.needsManualGrading && needsManualGrading(aq.questionType),
  );
  const hasUngraded = manualToGrade.length > 0;
  const canPublish = result.isFullyGraded && !result.isPublished;
  const questionsById = new Map(
    (result.exam?.questions || []).map((q) => [q._id, q]),
  );

  return (
    <div>
      <Link
        to="/teacher/exam-results"
        className="inline-block mb-6 text-lms-primary/90 hover:text-lms-primary"
      >
        ← {t("teacher.examResults")}
      </Link>

      <h1 className="text-2xl font-bold text-lms-primary mb-2">
        {getRefName(result.exam)}
      </h1>
      <p className="text-lms-primary/90 mb-6">
        {t("teacher.tableStudent")}: <strong>{getStudentName(result)}</strong>
      </p>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {isProjectResult && result.submittedFile && (
        <div className="mb-6 p-4 bg-lms-cream/30 rounded-xl border border-lms-cream">
          <h3 className="font-semibold text-lms-primary mb-2">
            {t("teacher.submittedFile")}
          </h3>
          <p className="text-sm text-lms-primary/90">
            {result.submittedFile.originalName ||
              result.submittedFile.filename ||
              "—"}
            {result.submittedFile.size != null && (
              <span className="ml-2">
                ({(result.submittedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="mt-3 px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
          >
            {downloading
              ? t("common.loading")
              : t("teacher.downloadSubmission")}
          </button>
        </div>
      )}

      {isProjectResult &&
        !result.submittedFile &&
        result.status === "Pending" && (
          <p className="mb-6 text-amber-700">
            {t("teacher.projectNotYetSubmitted")}
          </p>
        )}

      {isProjectResult && isAllCriteria && (
        <form
          onSubmit={handleProjectGradeSubmit}
          className="mb-8 p-6 bg-lms-cream/30 rounded-xl border border-lms-cream max-w-2xl"
        >
          <h3 className="font-semibold text-lms-primary mb-4">
            {t("teacher.gradeProject")} — {t("teacher.passCriteriaAllCriteria")}
          </h3>
          <p className="text-sm text-lms-primary/80 mb-4">
            {t("teacher.criteriaChecklistHint")}
          </p>
          <div className="space-y-4 mb-6">
            {criterionResults.map((cr, idx) => (
              <div
                key={cr.criterionId}
                className="p-4 border border-lms-cream rounded-lg bg-white"
              >
                <p className="font-medium text-lms-primary mb-3">
                  {cr.criterionName}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`criterion-result-${idx}`}
                      checked={cr.passed === true}
                      onChange={() => handleCriterionChange(idx, "passed", true)}
                      className="rounded-full border-lms-cream"
                    />
                    <span className="text-sm text-green-700">{t("student.passedYes")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`criterion-result-${idx}`}
                      checked={cr.passed === false}
                      onChange={() => handleCriterionChange(idx, "passed", false)}
                      className="rounded-full border-lms-cream"
                    />
                    <span className="text-sm text-red-700">{t("student.passedNo")}</span>
                  </label>
                </div>
              </div>
            ))}
            {criterionResults.length === 0 && module && (
              <p className="text-sm text-lms-primary/70">
                {t("teacher.noCriteriaInModule")}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || criterionResults.length === 0}
            className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
          >
            {submitting ? t("common.saving") : t("teacher.saveGrade")}
          </button>
        </form>
      )}

      {isProjectResult && !isAllCriteria && (
        <form
          onSubmit={handleProjectGradeSubmit}
          className="mb-8 p-6 bg-lms-cream/30 rounded-xl border border-lms-cream max-w-md"
        >
          <h3 className="font-semibold text-lms-primary mb-4">
            {t("teacher.gradeProject")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("student.score")} *
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={projectGrade.score}
                onChange={(e) =>
                  setProjectGrade((p) => ({ ...p, score: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("teacher.totalMark")} ({t("common.optional")})
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={projectGrade.totalMark}
                onChange={(e) =>
                  setProjectGrade((p) => ({ ...p, totalMark: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("student.status")}
              </label>
              <select
                value={projectGrade.status}
                onChange={(e) =>
                  setProjectGrade((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="Pending">{t("student.pending")}</option>
                <option value="Passed">{t("student.passed")}</option>
                <option value="Failed">{t("student.failed")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("student.remarks")} ({t("common.optional")})
              </label>
              <textarea
                rows={2}
                value={projectGrade.remarks}
                onChange={(e) =>
                  setProjectGrade((p) => ({ ...p, remarks: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                placeholder={t("teacher.remarksPlaceholder")}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
            >
              {submitting ? t("common.saving") : t("teacher.saveGrade")}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">
            {t("student.score")}
          </span>
          <p className="font-medium">
            {result.score ?? 0} / {result.totalMark ?? "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">
            {t("student.grade")}
          </span>
          <p className="font-medium">
            {result.grade != null ? `${result.grade}%` : "—"}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">
            {t("student.status")}
          </span>
          <p className="font-medium">
            <span
              className={
                result.status === "Passed"
                  ? "text-green-700"
                  : result.status === "Pending"
                    ? "text-amber-700"
                    : "text-red-700"
              }
            >
              {result.status || "—"}
            </span>
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">
            {t("teacher.fullyGraded")}
          </span>
          <p className="font-medium">
            {result.isFullyGraded ? t("common.yes") : t("common.no")}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-lms-cream/30 border border-lms-cream">
          <span className="text-sm text-lms-primary/80">
            {t("admin.tablePublished")}
          </span>
          <p className="font-medium">
            {result.isPublished ? t("common.yes") : t("common.no")}
          </p>
        </div>
      </div>

      {!isProjectResult && (
        <>
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {t("student.answerBreakdown")}
          </h2>
          <div className="space-y-4 mb-8">
            {answeredQuestions.map((aq, i) => {
              const question = questionsById.get(aq.questionId);
              const formattedAnswer = formatStudentAnswer(aq, question);
              const isManual = aq.needsManualGrading && needsManualGrading(aq.questionType);
              const cardClass = isManual
                ? "bg-lms-cream/30 border-lms-cream"
                : aq.isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200";

              return (
                <div key={i} className={`p-4 rounded-xl border ${cardClass}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-lms-primary mb-2">
                        {i + 1}. {aq.question}
                      </p>
                      <div className="text-sm text-lms-primary/90 space-y-1">
                        <p className="whitespace-pre-wrap">
                          <span className="font-medium">
                            {t("student.yourAnswer")}:
                          </span>{" "}
                          {formattedAnswer}
                        </p>
                        {isAutoGraded(aq.questionType) && (
                          <>
                            {aq.correctAnswer != null && (
                              <p>
                                <span className="font-medium text-green-700">
                                  {t("student.correctAnswerLabel")}:
                                </span>{" "}
                                {aq.correctAnswer}
                              </p>
                            )}
                            <p>
                              <span
                                className={
                                  aq.isCorrect
                                    ? "text-green-700 font-medium"
                                    : "text-red-700 font-medium"
                                }
                              >
                                {aq.isCorrect
                                  ? t("student.correct")
                                  : t("student.incorrect")}
                              </span>{" "}
                              ({aq.pointsAwarded ?? 0}/{aq.mark ?? 1})
                            </p>
                          </>
                        )}
                        {isManual && (
                          <p>
                            {t("teacher.pointsAwarded")}: {aq.pointsAwarded ?? "—"} / {aq.mark ?? 1}
                          </p>
                        )}
                        {isManual && aq.correctAnswer && (
                          <p>
                            <span className="font-medium">
                              {t("teacher.modelAnswer")}:
                            </span>{" "}
                            {aq.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                    {isManual && (
                      <div className="flex-shrink-0 w-24">
                        <label className="block text-xs text-lms-primary/90 mb-1">
                          {t("teacher.pointsAwarded")}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={aq.mark ?? 10}
                          step={0.5}
                          value={gradedAnswers[i] ?? ""}
                          onChange={(e) => handleGradeChange(i, e.target.value)}
                          className="w-full px-2 py-1 border border-lms-cream rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasUngraded && (
            <form
              onSubmit={handleSubmitGrade}
              className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200"
            >
              <h3 className="font-semibold text-lms-primary mb-2">
                {t("teacher.gradeAnswers")}
              </h3>
              <p className="text-sm text-lms-primary/90 mb-4">
                {t("teacher.needsGrading")} — Enter points for each open-ended,
                translation, and long-form question above, then click Save.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
              >
                {submitting ? t("common.saving") : t("teacher.gradeAndPublish")}
              </button>
            </form>
          )}

          {canPublish && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-lms-primary mb-2">
                {t("teacher.publishResult")}
              </h3>
              <p className="text-sm text-lms-primary/90 mb-4">
                All questions are graded. Publish this result so the student can
                view it.
              </p>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {publishing ? t("common.loading") : t("admin.publish")}
              </button>
            </div>
          )}

          {result.isPublished && (
            <p className="text-green-700 font-medium">{t("admin.pub")}</p>
          )}
        </>
      )}

      {isProjectResult && canPublish && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200 mt-6">
          <h3 className="font-semibold text-lms-primary mb-2">
            {t("teacher.publishResult")}
          </h3>
          <p className="text-sm text-lms-primary/90 mb-4">
            Project is graded. Publish this result so the student can view it.
          </p>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {publishing ? t("common.loading") : t("admin.publish")}
          </button>
        </div>
      )}
    </div>
  );
}

export default TeacherExamResultDetailPage;
