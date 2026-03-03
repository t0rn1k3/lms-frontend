import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examService, academicService, moduleService, getErrorMessage } from "../../api";

function ExamsPage() {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    program: "",
    module: "",
    yearGroup: "",
    academicYear: "",
    duration: "30 minutes",
    examDate: "",
    examTime: "",
    examType: "Quiz",
    passCriteriaType: "percentage",
    passMark: 50,
    totalMark: 100,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getRefId = (val) => (typeof val === "object" ? val?._id : val);
  const getRefName = (val) => (typeof val === "object" ? val?.name : val);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await examService.list();
      setExams(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [pRes, yRes, gRes] = await Promise.all([
        academicService.getPrograms(),
        academicService.getAcademicYears(),
        academicService.getYearGroups(),
      ]);
      setPrograms(pRes.data?.data || []);
      setAcademicYears(yRes.data?.data || []);
      setYearGroups(gRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch lookups:", err);
    }
  }, []);

  const fetchModulesByProgram = useCallback(async (programId) => {
    if (!programId) {
      setModules([]);
      return;
    }
    try {
      const { data } = await moduleService.list({ program: programId });
      setModules(data?.data ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch modules:", err);
      setModules([]);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFieldErrors({});
    setFormData({
      name: "",
      description: "",
      program: "",
      module: "",
      yearGroup: "",
      academicYear: "",
      duration: "30 minutes",
      examDate: new Date().toISOString().slice(0, 10),
      examTime: "09:00",
      examType: "Quiz",
      passCriteriaType: "percentage",
      passMark: 50,
      totalMark: 100,
    });
    setModules([]);
    setFormOpen(true);
  };

  const openEditForm = async (item) => {
    setEditingId(item._id);
    setFieldErrors({});
    const programId = getRefId(item.program);
    await fetchModulesByProgram(programId);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      program: programId || "",
      module: getRefId(item.module) || "",
      yearGroup: getRefId(item.yearGroup) || "",
      academicYear: getRefId(item.academicYear) || "",
      duration: item.duration || "30 minutes",
      examDate: item.examDate
        ? new Date(item.examDate).toISOString().slice(0, 10)
        : "",
      examTime: item.examTime || "09:00",
      examType: item.examType || "Quiz",
      passCriteriaType: item.passCriteriaType || "percentage",
      passMark: item.passMark != null ? Number(item.passMark) : 50,
      totalMark: item.totalMark != null && item.totalMark > 0 ? Number(item.totalMark) : 100,
    });
    setFormOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    const passMarkNum = Number(formData.passMark);
    const totalMarkNum = Number(formData.totalMark);
    if (Number.isNaN(passMarkNum) || passMarkNum < 0 || passMarkNum > 100) {
      errs.passMark = t("teacher.passMarkValidation");
    }
    if (Number.isNaN(totalMarkNum) || totalMarkNum <= 0) {
      errs.totalMark = t("teacher.totalMarkValidation");
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        program: formData.program,
        module: formData.module,
        yearGroup: formData.yearGroup,
        academicYear: formData.academicYear,
        duration: formData.duration,
        examTime: formData.examTime,
        examType: formData.examType,
        passCriteriaType: formData.passCriteriaType || "percentage",
        passMark: Number(formData.passMark),
        totalMark: Number(formData.totalMark),
      };
      if (formData.examDate) payload.examDate = formData.examDate;
      if (editingId) {
        await examService.update(editingId, payload);
      } else {
        await examService.create(payload);
      }
      setFormOpen(false);
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
        <h1 className="text-xl font-bold text-lms-primary">
          {t("teacher.exams")}
        </h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("teacher.addExam")}
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
            {editingId ? t("teacher.editExam") : t("teacher.newExam")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.program")} *
              </label>
              <select
                value={formData.program}
                onChange={async (e) => {
                  const programId = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    program: programId,
                    module: "",
                  }));
                  await fetchModulesByProgram(programId);
                }}
                required
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="">{t("teacher.select")}</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.modules")} *
              </label>
              <select
                value={formData.module}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, module: e.target.value }))
                }
                required
                disabled={!formData.program}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg disabled:bg-lms-cream/30"
              >
                <option value="">{formData.program ? t("teacher.select") : t("admin.selectProgramFirstForModules")}</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.yearGroups")} *
                </label>
                <select
                  value={formData.yearGroup}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      yearGroup: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">{t("teacher.select")}</option>
                  {yearGroups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.academicYearLabel")} *
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      academicYear: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">{t("teacher.select")}</option>
                  {academicYears.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.name ||
                        `${new Date(y.fromYear).getFullYear()}-${new Date(y.toYear).getFullYear()}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("common.duration")} *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.examDate")} *
                </label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      examDate: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.examTime")} *
                </label>
                <input
                  type="time"
                  value={formData.examTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      examTime: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.examType")} *
                </label>
                <select
                  value={formData.examType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examType: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="Quiz">{t("teacher.examTypeQuiz")}</option>
                  <option value="project-submission">{t("teacher.examTypeProjectSubmission")}</option>
                  <option value="Midterm">{t("teacher.examTypeMidterm")}</option>
                  <option value="Final">{t("teacher.examTypeFinal")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.passCriteriaType")}
                </label>
                <select
                  value={formData.passCriteriaType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passCriteriaType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="percentage">{t("teacher.passCriteriaPercentage")}</option>
                  <option value="all-criteria">{t("teacher.passCriteriaAllCriteria")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.passMark")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={formData.passMark}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passMark: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${
                    fieldErrors.passMark ? "border-red-500" : "border-lms-cream"
                  }`}
                />
                {fieldErrors.passMark && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.passMark}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("teacher.totalMark")}
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={formData.totalMark}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalMark: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${
                    fieldErrors.totalMark ? "border-red-500" : "border-lms-cream"
                  }`}
                />
                {fieldErrors.totalMark && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.totalMark}</p>
                )}
              </div>
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
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-lms-cream overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("common.loading")}
          </div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("teacher.noExams")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("common.name")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.modules")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("student.date")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("student.questions")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream text-sm">
              {exams.map((item) => (
                <tr key={item._id} className="hover:bg-lms-cream/30/50 ">
                  <td className="px-4 py-3">
                    <Link
                      to={`/teacher/exams/${item._id}`}
                      className="font-medium text-lms-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getRefName(item.module)}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {formatDate(item.examDate)}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {(item.questions && item.questions.length) || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/teacher/exams/${item._id}`}
                      className="text-lms-primary/90 hover:text-lms-primary mr-3"
                    >
                      {t("common.view")}
                    </Link>
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-lms-primary/90 hover:text-lms-primary"
                    >
                      {t("common.edit")}
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

export default ExamsPage;
