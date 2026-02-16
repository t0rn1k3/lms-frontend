import { useState, useEffect } from "react";
import { academicService, getErrorMessage } from "../../api";

function SubjectsPage() {
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
          setError("Please select a program.");
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
    if (!window.confirm("Delete this subject?")) return;
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
        <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Add Subject
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
            {editingId ? "Edit Subject" : "New Subject"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Program <span className="text-red-500">*</span>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select program</option>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Program
                </label>
                <p className="text-slate-600 py-1">
                  {getProgramName(formData.programId)}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Mathematics"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Subject description"
                required
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Academic Term
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select term</option>
                {academicTerms.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
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
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No subjects yet. Click &quot;Add Subject&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Program
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Academic Term
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getProgramName(getSubjectProgramId(item)) || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getAcademicTermName(
                      typeof item.academicTerm === "object"
                        ? item.academicTerm?._id
                        : item.academicTerm,
                    ) || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-slate-600 hover:text-slate-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
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
