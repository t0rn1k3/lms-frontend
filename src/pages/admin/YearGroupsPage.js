import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { academicService, getErrorMessage } from "../../api";

function YearGroupsPage() {
  const { t } = useTranslation();
  const [yearGroups, setYearGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    academicYear: "",
    program: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchYearGroups = async () => {
    try {
      setLoading(true);
      const { data } = await academicService.getYearGroups();
      setYearGroups(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const { data } = await academicService.getAcademicYears();
      setAcademicYears(data.data || []);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data } = await academicService.getPrograms();
      setPrograms(data.data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  useEffect(() => {
    fetchYearGroups();
    fetchAcademicYears();
    fetchPrograms();
  }, []);

  const getAcademicYearName = (id) => {
    const y = academicYears.find((x) => x._id === id);
    if (!y) return id;
    const from = y.fromYear ? new Date(y.fromYear).getFullYear() : "";
    const to = y.toYear ? new Date(y.toYear).getFullYear() : "";
    return y.name || (from && to ? `${from}-${to}` : id);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      academicYear: academicYears.length === 1 ? academicYears[0]._id : "",
      program: programs.length === 1 ? programs[0]._id : "",
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const yearId =
      typeof item.academicYear === "object"
        ? item.academicYear?._id
        : item.academicYear;
    const programId =
      typeof item.program === "object"
        ? item.program?._id
        : item.program;
    setFormData({
      name: item.name || "",
      academicYear: yearId || "",
      program: programId || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const name = formData.name.trim();
    const academicYearId = formData.academicYear?.trim?.() || formData.academicYear;
    if (!academicYearId) {
      setError(t("admin.selectAcademicYear") || "Please select an academic year.");
      return;
    }
    if (!name) {
      setError(t("common.name") || "Name is required.");
      return;
    }
    setSubmitting(true);
    try {
    const payload = {
      name,
      academicYear: academicYearId,
    };
    if (formData.program) payload.program = formData.program;
      if (editingId) {
        await academicService.updateYearGroup(editingId, payload);
      } else {
        await academicService.createYearGroup(payload);
      }
      setFormOpen(false);
      fetchYearGroups();
    } catch (err) {
      if (err?.response?.status === 500) {
        console.error("[YearGroups] 500 on create/update:", {
          url: err?.config?.url,
          payload: { name, academicYear: academicYearId },
          response: err?.response?.data,
          fullError: err,
        });
      }
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteYearGroup"))) return;
    try {
      await academicService.deleteYearGroup(id);
      fetchYearGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-lms-primary">
          {t("admin.yearGroups")}
        </h1>
        <div className="flex items-center gap-2">
          {academicYears.length === 0 && (
            <span className="text-sm text-amber-600">
              {t("admin.createAcademicYearFirst")}
            </span>
          )}
          <button
            onClick={openCreateForm}
            disabled={academicYears.length === 0}
            className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("admin.addYearGroup")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {formOpen && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-lms-cream">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {editingId ? t("admin.editYearGroup") : t("admin.newYearGroup")}
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
                placeholder={t("admin.yearGroupNamePlaceholder")}
                required
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.academicYearLabel")}
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
                <option value="">{t("admin.selectAcademicYear")}</option>
                {academicYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    {getAcademicYearName(y._id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.programs")}
              </label>
              <select
                value={formData.program}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, program: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="">{t("admin.selectProgramOption")}</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name || p.code || p._id}
                  </option>
                ))}
              </select>
              <p className="text-xs text-lms-primary/70 mt-1">
                {t("admin.groupProgramHint")}
              </p>
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
        ) : yearGroups.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noYearGroups")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("common.name")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.academicYearLabel")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                  {t("admin.programs")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream">
              {yearGroups.map((item) => (
                <tr key={item._id} className="hover:bg-lms-cream/30/50">
                  <td className="px-4 py-3 font-medium text-lms-primary">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getAcademicYearName(
                      typeof item.academicYear === "object"
                        ? item.academicYear?._id
                        : item.academicYear,
                    )}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {typeof item.program === "object"
                      ? item.program?.name || item.program?.code || "—"
                      : (() => {
                          const p = programs.find((x) => x._id === item.program);
                          return p?.name || p?.code || item.program || "—";
                        })()}
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

export default YearGroupsPage;
