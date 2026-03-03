import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  moduleService,
  academicService,
  teacherService,
  getErrorMessage,
} from "../../api";

function getRefName(val, key = "name") {
  if (!val) return "—";
  return typeof val === "object" ? val?.[key] || val?._id : val;
}

function TeacherChips({ teachers }) {
  if (!teachers?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {teachers.map((t) => (
        <span
          key={t._id || t.teacherId}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-lms-cream text-lms-primary"
        >
          {t.name || t.email || t._id}
        </span>
      ))}
    </div>
  );
}

function ModulesPage() {
  const { t } = useTranslation();
  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [programFilter, setProgramFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    program: "",
    order: 1,
    criteria: [],
    teachers: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data } = await moduleService.list(
        programFilter ? { program: programFilter } : {}
      );
      setModules(data?.data ?? data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data } = await academicService.getPrograms();
      setPrograms(data?.data ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await teacherService.list();
      setTeachers(data?.data ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchModules();
  }, [programFilter]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      program: programFilter || (programs[0]?._id ?? ""),
      order: (modules.length + 1) || 1,
      criteria: [],
      teachers: [],
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const criteria = (item.criteria || []).map((c) => ({
      id: c.id || `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: c.name || "",
      description: c.description || "",
    }));
    const teacherIds = (item.teachers || []).map((t) =>
      typeof t === "object" ? t._id || t.teacherId : t
    );
    setFormData({
      name: item.name || "",
      description: item.description || "",
      program: typeof item.program === "object" ? item.program?._id : item.program || "",
      order: item.order ?? 1,
      criteria,
      teachers: teacherIds,
    });
    setFormOpen(true);
  };

  const toggleTeacher = (teacherId) => {
    setFormData((prev) =>
      prev.teachers.includes(teacherId)
        ? { ...prev, teachers: prev.teachers.filter((id) => id !== teacherId) }
        : { ...prev, teachers: [...prev.teachers, teacherId] }
    );
  };

  const addCriterion = () => {
    setFormData((prev) => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        {
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: "",
          description: "",
        },
      ],
    }));
  };

  const removeCriterion = (index) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const updateCriterion = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.criteria];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, criteria: next };
    });
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
        teachers: formData.teachers || [],
        criteria: formData.criteria
          .filter((c) => c.name?.trim())
          .map((c) => ({
            id: c.id,
            name: c.name.trim(),
            description: (c.description || "").trim(),
          })),
      };
      if (editingId) {
        await moduleService.update(editingId, payload);
      } else {
        await moduleService.create(payload);
      }
      setFormOpen(false);
      fetchModules();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteModule"))) return;
    try {
      await moduleService.delete(id);
      fetchModules();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-lms-primary">
          {t("admin.modules")}
        </h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("admin.addModule")}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-lms-primary mb-1">
          {t("admin.filterByProgram")}
        </label>
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2 border border-lms-cream rounded-lg min-w-[200px]"
        >
          <option value="">{t("admin.allPrograms")}</option>
          {programs.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {formOpen && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-lms-cream">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {editingId ? t("admin.editModule") : t("admin.newModule")}
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
                {t("common.description")}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.program")} *
                </label>
                <select
                  value={formData.program}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, program: e.target.value }))
                  }
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
                  {t("admin.moduleOrder")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-lms-primary mb-2">
                {t("admin.teachers")}
              </label>
              <div className="border border-lms-cream rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {formData.teachers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formData.teachers.map((id) => {
                      const teacher = teachers.find((t) => t._id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-lms-primary/10 text-lms-primary"
                        >
                          {teacher?.name || teacher?.email || id}
                          <button
                            type="button"
                            onClick={() => toggleTeacher(id)}
                            className="text-red-600 hover:text-red-800 text-xs ml-1"
                            aria-label={t("common.delete")}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {teachers.length === 0 ? (
                  <p className="text-sm text-lms-primary/70">
                    {t("admin.noTeachersYet")}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {teachers
                      .filter((t) => !formData.teachers.includes(t._id))
                      .map((teacher) => (
                        <label
                          key={teacher._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-lms-cream/30 rounded px-2 py-1"
                        >
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleTeacher(teacher._id)}
                            className="rounded border-lms-cream"
                          />
                          <span className="text-lms-primary text-sm">
                            {teacher.name} {teacher.email && `(${teacher.email})`}
                          </span>
                        </label>
                      ))}
                    {formData.teachers.length === teachers.length && (
                      <p className="text-sm text-lms-primary/70">
                        {t("admin.allTeachersSelected")}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-lms-primary/70 mt-1">
                {t("admin.teachersOptionalHint")}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-lms-primary">
                  {t("admin.criteria")}
                </label>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="text-sm px-2 py-1 bg-lms-cream rounded hover:bg-lms-cream/80 text-lms-primary"
                >
                  + {t("admin.addCriterion")}
                </button>
              </div>
              <div className="space-y-3">
                {formData.criteria.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3 border border-lms-cream rounded-lg bg-lms-cream/20"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) =>
                          updateCriterion(idx, "name", e.target.value)
                        }
                        placeholder={t("admin.criterionNamePlaceholder")}
                        className="flex-1 px-2 py-1.5 border border-lms-cream rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeCriterion(idx)}
                        className="text-red-600 hover:text-red-800 text-sm px-1"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={c.description}
                      onChange={(e) =>
                        updateCriterion(idx, "description", e.target.value)
                      }
                      placeholder={t("admin.criterionDescPlaceholder")}
                      className="w-full px-2 py-1.5 border border-lms-cream rounded text-sm"
                    />
                  </div>
                ))}
                {formData.criteria.length === 0 && (
                  <p className="text-sm text-lms-primary/70">
                    {t("admin.noCriteriaYet")}
                  </p>
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
        ) : modules.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noModules")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("common.name")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.program")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.moduleOrder")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.teachers")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.criteria")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream text-sm">
              {modules.map((item) => (
                <tr key={item._id} className="hover:bg-lms-cream/30/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-lms-primary">
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="text-xs text-lms-primary/80 mt-0.5 max-w-xs truncate">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getRefName(item.program)}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {item.order ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90 max-w-[200px]">
                    {item.teachers?.length ? (
                      <TeacherChips teachers={item.teachers} />
                    ) : (
                      <span className="text-lms-primary/60 text-sm">
                        {t("admin.noTeachersAssigned")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {(item.criteria?.length ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-lms-primary/90 hover:text-lms-primary mr-3"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t("common.delete")}
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

export default ModulesPage;
