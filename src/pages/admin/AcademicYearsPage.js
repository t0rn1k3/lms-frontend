import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { academicService, getErrorMessage } from "../../api";

function AcademicYearsPage() {
  const { t } = useTranslation();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    fromYear: "",
    toYear: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const { data } = await academicService.getAcademicYears();
      setYears(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: "", fromYear: "", toYear: "" });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      fromYear: item.fromYear
        ? new Date(item.fromYear).toISOString().slice(0, 10)
        : "",
      toYear: item.toYear
        ? new Date(item.toYear).toISOString().slice(0, 10)
        : "",
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
        fromYear: new Date(formData.fromYear),
        toYear: new Date(formData.toYear),
      };
      if (editingId) {
        await academicService.updateAcademicYear(editingId, payload);
      } else {
        await academicService.createAcademicYear(payload);
      }
      setFormOpen(false);
      fetchYears();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteAcademicYear"))) return;
    try {
      await academicService.deleteAcademicYear(id);
      fetchYears();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t("admin.academicYears")}</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          {t("admin.addAcademicYear")}
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
            {editingId ? t("admin.editAcademicYear") : t("admin.newAcademicYear")}
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
                placeholder={t("admin.academicYearNamePlaceholder")}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("admin.fromDate")}
                </label>
                <input
                  type="date"
                  value={formData.fromYear}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fromYear: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("admin.toDate")}
                </label>
                <input
                  type="date"
                  value={formData.toYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, toYear: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
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
        ) : years.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {t("admin.noAcademicYears")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  {t("common.name")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  {t("admin.from")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  {t("admin.to")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {years.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(item.fromYear)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(item.toYear)}
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

export default AcademicYearsPage;
