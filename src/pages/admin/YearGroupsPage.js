import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { academicService, getErrorMessage } from "../../api";

function YearGroupsPage() {
  const { t } = useTranslation();
  const [yearGroups, setYearGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    academicYear: "",
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

  useEffect(() => {
    fetchYearGroups();
    fetchAcademicYears();
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
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const yearId =
      typeof item.academicYear === "object"
        ? item.academicYear?._id
        : item.academicYear;
    setFormData({
      name: item.name || "",
      academicYear: yearId || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        academicYear: formData.academicYear,
      };
      if (editingId) {
        await academicService.updateYearGroup(editingId, payload);
      } else {
        await academicService.createYearGroup(payload);
      }
      setFormOpen(false);
      fetchYearGroups();
    } catch (err) {
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
        <h1 className="text-2xl font-bold text-slate-800">{t("admin.yearGroups")}</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          {t("admin.addYearGroup")}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {formOpen && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? t("admin.editYearGroup") : t("admin.newYearGroup")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">{t("admin.selectAcademicYear")}</option>
                {academicYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    {getAcademicYearName(y._id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting ? t("common.saving") : t("common.save")}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">{t("common.loading")}</div>
        ) : yearGroups.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {t("admin.noYearGroups")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  {t("common.name")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  {t("admin.academicYearLabel")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yearGroups.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getAcademicYearName(
                      typeof item.academicYear === "object"
                        ? item.academicYear?._id
                        : item.academicYear,
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-slate-600 hover:text-slate-800 mr-3"
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
