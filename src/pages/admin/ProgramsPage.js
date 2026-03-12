import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  academicService,
  moduleService,
  getErrorMessage,
} from "../../api";

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

function ProgramsPage() {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
  const [expandedProgramId, setExpandedProgramId] = useState(null);
  const [programModules, setProgramModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "4 years",
    durationWeeks: "",
    startDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data } = await academicService.getPrograms();
      setPrograms(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchYearGroups = async () => {
    try {
      const { data } = await academicService.getYearGroups();
      setYearGroups(data.data || []);
    } catch (err) {
      console.error("Failed to fetch year groups:", err);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchYearGroups();
  }, []);

  const getGroupsCountForProgram = (programId) => {
    return yearGroups.filter((g) => {
      const gProgramId = typeof g.program === "object" ? g.program?._id : g.program;
      return gProgramId === programId;
    }).length;
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      duration: "4 years",
      durationWeeks: "",
      startDate: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      duration: item.duration || "4 years",
      durationWeeks: item.durationWeeks != null ? String(item.durationWeeks) : "",
      startDate: item.startDate
        ? new Date(item.startDate).toISOString().slice(0, 10)
        : "",
    });
    setFormOpen(true);
  };

  const toggleClassLevel = (id) => {
    setFormData((prev) =>
      prev.classLevels.includes(id)
        ? { ...prev, classLevels: prev.classLevels.filter((x) => x !== id) }
        : { ...prev, classLevels: [...prev.classLevels, id] },
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
        duration: formData.duration.trim(),
      };
      const dw = Number(formData.durationWeeks);
      if (!Number.isNaN(dw) && dw > 0) payload.durationWeeks = dw;
      if (formData.startDate) payload.startDate = formData.startDate;
      if (editingId) {
        await academicService.updateProgram(editingId, payload);
      } else {
        await academicService.createProgram(payload);
      }
      setFormOpen(false);
      fetchPrograms();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteProgram"))) return;
    try {
      await academicService.deleteProgram(id);
      fetchPrograms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleProgramModules = async (programId) => {
    if (expandedProgramId === programId) {
      setExpandedProgramId(null);
      setProgramModules([]);
      return;
    }
    setExpandedProgramId(programId);
    setModulesLoading(true);
    try {
      const { data } = await moduleService.list({ program: programId });
      setProgramModules(data?.data ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch program modules:", err);
      setProgramModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-lms-primary">
          {t("admin.programs")}
        </h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("admin.addProgram")}
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
            {editingId ? t("admin.editProgram") : t("admin.newProgram")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("common.name")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("admin.programNamePlaceholder")}
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
                placeholder={t("admin.programDescription")}
                required
                rows={3}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("common.duration")}
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: e.target.value }))
                  }
                  placeholder={t("admin.programDurationPlaceholder")}
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.durationWeeks")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.durationWeeks}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      durationWeeks: e.target.value,
                    }))
                  }
                  placeholder="34"
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.startDate")} ({t("common.optional")})
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
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
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noPrograms")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("common.name")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("common.duration")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.durationWeeks")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.yearGroups")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream">
              {programs.map((item) => (
                <Fragment key={item._id}>
                <tr className="hover:bg-lms-cream/30/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-lms-primary">
                      {item.name}
                    </span>
                    {item.code && (
                      <span className="ml-2 text-xs text-lms-primary/80">
                        ({item.code})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {item.duration}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {item.durationWeeks ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getGroupsCountForProgram(item._id)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(item.durationWeeks ?? 0) > 0 && (
                      <Link
                        to={`/admin/programs/${item._id}/curriculum`}
                        className="text-lms-primary/90 hover:text-lms-primary mr-3"
                      >
                        {t("admin.viewCurriculum")}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleProgramModules(item._id)}
                      className="text-lms-primary/90 hover:text-lms-primary mr-3"
                    >
                      {expandedProgramId === item._id
                        ? t("admin.hideModules")
                        : t("admin.viewModules")}
                    </button>
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
                {expandedProgramId === item._id && (
                  <tr>
                    <td colSpan={5} className="p-4 bg-lms-cream/20">
                      <div className="pl-4 border-l-2 border-lms-primary/30">
                        <h4 className="text-sm font-medium text-lms-primary mb-3">
                          {t("admin.modules")}
                        </h4>
                        {modulesLoading ? (
                          <p className="text-sm text-lms-primary/70">
                            {t("common.loading")}
                          </p>
                        ) : programModules.length === 0 ? (
                          <p className="text-sm text-lms-primary/70">
                            {t("admin.noModulesInProgram")}
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {programModules.map((mod) => (
                              <li
                                key={mod._id}
                                className="flex flex-wrap items-center gap-2 text-sm"
                              >
                                <span className="font-medium text-lms-primary">
                                  {mod.name}
                                </span>
                                <span className="text-lms-primary/70">—</span>
                                {mod.teachers?.length ? (
                                  <TeacherChips teachers={mod.teachers} />
                                ) : (
                                  <span className="text-lms-primary/60">
                                    {t("admin.noTeachersAssigned")}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProgramsPage;
