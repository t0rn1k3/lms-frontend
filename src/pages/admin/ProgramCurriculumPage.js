import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { academicService, moduleService, getErrorMessage } from "../../api";

function getRefName(val, key = "name") {
  if (!val) return "—";
  return typeof val === "object" ? val?.[key] || val?._id : val;
}

const MODULE_TYPES = Object.freeze([
  { value: "professional", labelKey: "admin.typeProfessional" },
  { value: "commonProfessional", labelKey: "admin.typeCommonProfessional" },
  { value: "general", labelKey: "admin.typeGeneral" },
  { value: "integratedGeneral", labelKey: "admin.typeIntegratedGeneral" },
]);

function AddModuleModal({
  programId,
  programs,
  teachers,
  onClose,
  onSaved,
  t,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    program: programId,
    code: "",
    type: "professional",
    contactHours: "",
    independentHours: "",
    assessmentHours: "",
    durationWeeks: "",
    credits: "",
    startWeek: 1,
    order: 1,
    criteria: [],
    teachers: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleTeacher = (id) => {
    setFormData((prev) =>
      prev.teachers.includes(id)
        ? { ...prev, teachers: prev.teachers.filter((x) => x !== id) }
        : { ...prev, teachers: [...prev.teachers, id] },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        program: formData.program,
        order: Number(formData.order) || 0,
        type: formData.type || "professional",
        contactHours: Number(formData.contactHours) || 0,
        independentHours: Number(formData.independentHours) || 0,
        assessmentHours: Number(formData.assessmentHours) || 0,
        durationWeeks: Number(formData.durationWeeks) || 0,
        credits: Number(formData.credits) || 0,
        startWeek: Number(formData.startWeek) || 1,
        teachers: formData.teachers || [],
        learningOutcomes: [
          {
            id: `lo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            order: 1,
            name: t("admin.learningOutcome"),
            description: "",
            criteria: [
              {
                id: `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                name: t("admin.criterionNamePlaceholder"),
                description: "",
              },
            ],
          },
        ],
      };
      if (formData.code?.trim()) payload.code = formData.code.trim();
      await moduleService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-xl border border-lms-cream max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {t("admin.addModuleToCurriculum")}
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("common.name")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.moduleCode")}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="M101"
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("common.description")} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                rows={2}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.moduleType")}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  {MODULE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.startWeek")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.startWeek}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startWeek: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.contactHours")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.contactHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactHours: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.independentHours")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.independentHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      independentHours: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.assessmentHours")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.assessmentHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assessmentHours: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.durationWeeksModule")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.durationWeeks}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      durationWeeks: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.credits")}
              </label>
              <input
                type="number"
                min={0}
                value={formData.credits}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, credits: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg max-w-[120px]"
              />
            </div>
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
                onClick={onClose}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProgramCurriculumPage({ readOnly = false, backTo = "/admin/programs", backLabel = "admin.programs" }) {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [weekOverrides, setWeekOverrides] = useState({});

  const fetchCurriculum = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await academicService.getProgramCurriculum(id);
      const c = data?.data ?? data ?? {};
      setCurriculum(c);
      setWeekOverrides({});
    } catch (err) {
      setError(getErrorMessage(err));
      setCurriculum(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleWeekChange = (moduleId, weekNum, value) => {
    // Keep cells editable: when user clears a value, preserve empty string
    // instead of forcing 0 on each keystroke.
    const normalizedValue =
      value === "" ? "" : Math.max(0, Number(value) || 0);
    setWeekOverrides((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [String(weekNum)]: normalizedValue,
      },
    }));
  };

  const getModuleWeekRange = (mod) => {
    const startWeek = mod.startWeek || 1;
    const durWeeks = mod.durationWeeks || 0;
    const effective = mod.effectiveWeeklyHours || mod.weeklyOverrides || {};
    const effectiveWeekNums = Object.keys(effective)
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 1);
    const computedRange = Array.from(
      { length: durWeeks },
      (_, i) => startWeek + i,
    );
    return effectiveWeekNums.length > 0
      ? [...new Set([...computedRange, ...effectiveWeekNums])].sort(
          (a, b) => a - b,
        )
      : computedRange;
  };

  const handleSaveWeeklyOverrides = async (moduleId) => {
    const overrides = weekOverrides[moduleId];
    if (!overrides || Object.keys(overrides).length === 0) return;
    const mod = modules.find((m) => m._id === moduleId);
    if (!mod) return;
    const programTotalWeeks =
      curriculum?.totalWeeks || curriculum?.program?.durationWeeks || 0;
    const baseRange = getModuleWeekRange(mod);
    const overrideWeeks = Object.keys(overrides)
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 1);
    // Cap by program length, but never drop weeks the user explicitly edited
    // (e.g. split hours into W11 when API totalWeeks is still 10 — otherwise W11
    // is filtered out, actualSum loses those hours, validation fails incorrectly).
    const maxOverrideWeek =
      overrideWeeks.length > 0 ? Math.max(...overrideWeeks) : 0;
    const weekCap =
      programTotalWeeks > 0
        ? Math.max(programTotalWeeks, maxOverrideWeek)
        : maxOverrideWeek || 0;
    const weekRange = [...new Set([...baseRange, ...overrideWeeks])]
      .filter((w) => (weekCap > 0 ? w <= weekCap : true))
      .sort((a, b) => a - b);
    const effective = mod.effectiveWeeklyHours || mod.weeklyOverrides || {};
    const fullOverrides = {};
    for (const w of weekRange) {
      const key = String(w);
      const val = key in overrides ? overrides[key] : (effective[key] ?? 0);
      fullOverrides[key] = typeof val === "number" ? val : Number(val) || 0;
    }
    const requiredSum = (mod.contactHours || 0) + (mod.assessmentHours || 0);
    const actualSum = Object.values(fullOverrides).reduce((s, v) => s + v, 0);
    if (Math.abs(actualSum - requiredSum) > 0.01) {
      setError(t("errors.module.weekly_hours_invalid"));
      return;
    }
    try {
      setSavingId(moduleId);
      setError("");
      await academicService.updateProgramCurriculum(id, {
        modules: [{ moduleId, weeklyOverrides: fullOverrides }],
      });
      setWeekOverrides((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
      await fetchCurriculum();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleResetCurriculum = async () => {
    try {
      setResetting(true);
      setError("");
      await academicService.deleteProgramCurriculum(id);
      setResetModalOpen(false);
      await fetchCurriculum();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  const handleDownloadCurriculum = async () => {
    try {
      setDownloading(true);
      setError("");
      await academicService.downloadProgramCurriculum(id, i18n.language);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteCurriculum = async () => {
    try {
      setDeleting(true);
      setError("");
      await academicService.deleteProgramCurriculum(id);
      setDeleteModalOpen(false);
      await fetchCurriculum();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const getWeekHours = (mod, weekNum) => {
    const key = String(weekNum);
    const overrides = weekOverrides[mod._id];
    if (overrides && key in overrides) return overrides[key];
    const effective = mod.effectiveWeeklyHours || mod.weeklyOverrides || {};
    const val = effective[key];
    return val === undefined || val === null ? "" : val;
  };

  if (loading) {
    return <div className="p-8 text-lms-primary/80">{t("common.loading")}</div>;
  }

  if (error && !curriculum) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
        <Link
          to="/admin/programs"
          className="inline-block mt-4 text-lms-primary/90 hover:text-lms-primary"
        >
          ← {t("admin.programs")}
        </Link>
      </div>
    );
  }

  const program = curriculum?.program || {};
  const modules = curriculum?.modules || [];
  const totalWeeks = curriculum?.totalWeeks || program?.durationWeeks || 0;
  const weekLabels = curriculum?.weekLabels || [];

  return (
    <div>
      <Link
        to={backTo}
        className="inline-block mb-6 text-lms-primary/90 hover:text-lms-primary"
      >
        ← {t(backLabel)}
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lms-primary">
            {getRefName(program)} — {t("admin.curriculum")}
          </h1>
          <p className="text-sm text-lms-primary/80 mt-1">
            {t("admin.curriculumTable")} • {totalWeeks} {t("admin.weeks")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadCurriculum}
            disabled={modules.length === 0 || downloading}
            className="px-4 py-2 border border-lms-primary/40 text-lms-primary rounded-lg hover:bg-lms-cream/30 disabled:opacity-50"
          >
            {downloading ? t("common.loading") : t("admin.downloadCurriculum")}
          </button>
          {!readOnly && (
            <>
              <button
                onClick={() => setResetModalOpen(true)}
                disabled={modules.length === 0 || resetting}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {t("admin.resetCurriculum")}
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                disabled={modules.length === 0 || deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {t("admin.deleteCurriculum")}
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
              >
                {t("admin.addModuleToCurriculum")}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-lms-cream overflow-x-auto">
        {modules.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noModulesInProgram")}
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-separate border-spacing-0">
            <thead className="bg-lms-cream/30">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-lms-primary sticky left-0 bg-lms-cream/30 border border-lms-cream">
                  {t("admin.moduleCode")}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-lms-primary min-w-[140px] border border-lms-cream">
                  {t("common.name")}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-lms-primary border border-lms-cream">
                  {t("admin.moduleType")}
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary border border-lms-cream">
                  Total
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary border border-lms-cream">
                  {t("admin.contactHours")}
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary border border-lms-cream">
                  {t("admin.independentHours")}
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary border border-lms-cream">
                  {t("admin.assessmentHours")}
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary border border-lms-cream">
                  {t("admin.durationWeeksModule")}
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary border border-lms-cream">
                  {t("admin.credits")}
                </th>
                {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(
                  (w) => (
                    <th
                      key={w}
                      className="px-2 py-2 text-center text-xs font-medium text-lms-primary/80 w-16 border border-lms-cream"
                      title={weekLabels?.[w - 1] || `Week ${w}`}
                    >
                      W{w}
                    </th>
                  ),
                )}
                {!readOnly && (
                  <th className="px-3 py-2 text-center text-xs font-medium text-lms-primary w-20 border border-lms-cream">
                    {t("common.save")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-sm">
              {modules.map((mod) => {
                const total =
                  (mod.contactHours || 0) +
                  (mod.independentHours || 0) +
                  (mod.assessmentHours || 0);
                const hasOverrides =
                  weekOverrides[mod._id] &&
                  Object.keys(weekOverrides[mod._id]).length > 0;

                return (
                  <tr key={mod._id} className="hover:bg-lms-cream/20">
                    <td className="px-3 py-2 font-medium text-lms-primary sticky left-0 bg-lms-cream/15 border border-lms-cream z-10">
                      {mod.code || " "}
                    </td>
                    <td className="px-3 py-2 text-lms-primary/90 bg-lms-cream/15 border border-lms-cream">
                      {mod.name}
                    </td>
                    <td className="px-3 py-2 text-lms-primary/90 bg-lms-cream/15 border border-lms-cream">
                      {t(
                        MODULE_TYPES.find((x) => x.value === mod.type)
                          ?.labelKey || "admin.typeProfessional",
                      )}
                    </td>
                    <td className="px-3 py-2 text-center bg-lms-cream/15 border border-lms-cream">
                      {total}
                    </td>
                    <td className="px-3 py-2 text-center bg-lms-cream/15 border border-lms-cream">
                      {mod.contactHours ?? ""}
                    </td>
                    <td className="px-3 py-2 text-center bg-lms-cream/15 border border-lms-cream">
                      {mod.independentHours ?? ""}
                    </td>
                    <td className="px-3 py-2 text-center bg-lms-cream/15 border border-lms-cream">
                      {mod.assessmentHours ?? ""}
                    </td>
                    <td className="px-3 py-2 text-center bg-lms-cream/15 border border-lms-cream">
                      {mod.durationWeeks ?? 0}
                    </td>
                    <td className="px-3 py-2 text-center bg-lms-cream/15 border border-lms-cream">
                      {mod.credits ?? 0}
                    </td>
                    {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(
                      (w) => (
                        <td
                          key={w}
                          className="px-1 py-1 border border-lms-cream"
                        >
                          {readOnly ? (
                            <span className="text-xs">
                              {getWeekHours(mod, w) ?? ""}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={getWeekHours(mod, w) ?? ""}
                              onChange={(e) =>
                                handleWeekChange(mod._id, w, e.target.value)
                              }
                              className="w-14 px-1 py-0.5 cursor-pointer rounded text-center text-xs bg-transparent"
                            />
                          )}
                        </td>
                      ),
                    )}
                    {!readOnly && (
                      <td className="px-2 py-2 border border-lms-cream">
                        <button
                          type="button"
                          onClick={() => handleSaveWeeklyOverrides(mod._id)}
                          disabled={!hasOverrides || savingId === mod._id}
                          className="px-2 py-1 text-xs bg-lms-primary text-white rounded hover:bg-lms-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingId === mod._id
                            ? t("common.loading")
                            : t("common.save")}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!readOnly && addModalOpen && (
        <AddModuleModal
          programId={id}
          programs={[]}
          teachers={[]}
          onClose={() => setAddModalOpen(false)}
          onSaved={fetchCurriculum}
          t={t}
        />
      )}

      {resetModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setResetModalOpen(false)
          }
          onKeyDown={(e) => e.key === "Escape" && setResetModalOpen(false)}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-xl border border-lms-cream max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-lms-primary mb-2">
              {t("admin.resetCurriculum")}
            </h2>
            <p className="text-sm text-lms-primary/80 mb-4">
              {t("admin.resetCurriculumConfirm")}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleResetCurriculum}
                disabled={resetting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? t("common.loading") : t("admin.resetCurriculum")}
              </button>
            </div>
          </div>
        </div>
      )}

      {!readOnly && deleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteModalOpen(false)
          }
          onKeyDown={(e) => e.key === "Escape" && setDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-xl border border-lms-cream max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              {t("admin.deleteCurriculum")}
            </h2>
            <p className="text-sm text-lms-primary/80 mb-4">
              {t("admin.deleteCurriculumConfirm")}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteCurriculum}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t("common.loading") : t("admin.deleteCurriculum")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramCurriculumPage;
