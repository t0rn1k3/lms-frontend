import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { academicService, getErrorMessage } from "../../api";

function SubjectsPage() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    programId: "",
    name: "",
    description: "",
    academicTerm: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await academicService.getSubjects();
      setSubjects(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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

  const fetchAcademicTerms = async () => {
    try {
      const { data } = await academicService.getAcademicTerms();
      setAcademicTerms(data.data || []);
    } catch (err) {
      console.error("Failed to fetch academic terms:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchPrograms();
    fetchAcademicTerms();
  }, []);

  const getProgramName = (id) => {
    const p = programs.find((x) => x._id === id);
    return p?.name || id;
  };

  const getAcademicTermName = (id) => {
    const t = academicTerms.find((x) => x._id === id);
    return t?.name || id;
  };

  const getSubjectProgramId = (subject) => {
    for (const p of programs) {
      if (!p.subjects) continue;
      const ids = p.subjects.map((s) => (typeof s === "object" ? s._id : s));
      if (ids.includes(subject._id)) return p._id;
    }
    return null;
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      programId: programs.length === 1 ? programs[0]._id : "",
      name: "",
      description: "",
      academicTerm: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const termId =
      typeof item.academicTerm === "object"
        ? item.academicTerm?._id
        : item.academicTerm;
    setFormData({
      programId: getSubjectProgramId(item) || "",
      name: item.name || "",
      description: item.description || "",
      academicTerm: termId || "",
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
        description: formData.description.trim(),
        academicTerm: formData.academicTerm || undefined,
      };
      if (editingId) {
        await academicService.updateSubject(editingId, payload);
      } else {
        if (!formData.programId) {
          setError(t("admin.selectProgram"));
          setSubmitting(false);
          return;
        }
        await academicService.createSubject(formData.programId, payload);
      }
      setFormOpen(false);
      fetchSubjects();
      fetchPrograms();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteSubject"))) return;
    try {
      await academicService.deleteSubject(id);
      fetchSubjects();
      fetchPrograms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lms-primary">{t("admin.subjects")}</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("admin.addSubject")}
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
            {editingId ? t("admin.editSubject") : t("admin.newSubject")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.program")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.programId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      programId: e.target.value,
                    }))
                  }
                  required={!editingId}
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">{t("admin.selectProgramOption")}</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {editingId && formData.programId && (
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
                  {t("admin.program")}
                </label>
                <p className="text-lms-primary/90 py-1">
                  {getProgramName(formData.programId)}
                </p>
              </div>
            )}
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
                placeholder={t("admin.subjectNamePlaceholder")}
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
                placeholder={t("admin.subjectDescription")}
                required
                rows={3}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
                {t("admin.academicTermLabel")}
              </label>
              <select
                value={formData.academicTerm}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    academicTerm: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="">{t("admin.selectTerm")}</option>
                {academicTerms.map((term) => (
                  <option key={term._id} value={term._id}>
                    {term.name}
                  </option>
                ))}
              </select>
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
          <div className="p-8 text-center text-lms-primary/80">{t("common.loading")}</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noSubjects")}
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
                  {t("admin.academicTermLabel")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream">
              {subjects.map((item) => (
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
                    {getProgramName(getSubjectProgramId(item)) || "—"}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getAcademicTermName(
                      typeof item.academicTerm === "object"
                        ? item.academicTerm?._id
                        : item.academicTerm,
                    ) || "—"}
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

export default SubjectsPage;
