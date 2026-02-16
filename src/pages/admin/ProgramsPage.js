import { useState, useEffect } from "react";
import { academicService, getErrorMessage } from "../../api";

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "4 years",
    classLevels: [],
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

  const fetchClassLevels = async () => {
    try {
      const { data } = await academicService.getClassLevels();
      setClassLevels(data.data || []);
    } catch (err) {
      console.error("Failed to fetch class levels:", err);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchClassLevels();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      duration: "4 years",
      classLevels: [],
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const levelIds = (item.classLevels || []).map((l) =>
      typeof l === "object" ? l._id : l,
    );
    setFormData({
      name: item.name || "",
      description: item.description || "",
      duration: item.duration || "4 years",
      classLevels: levelIds,
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
        classLevels: formData.classLevels,
      };
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
    if (!window.confirm("Delete this program?")) return;
    try {
      await academicService.deleteProgram(id);
      fetchPrograms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getClassLevelName = (id) => {
    const level = classLevels.find((l) => l._id === id);
    return level?.name || id;
  };

  const formatClassLevels = (item) => {
    const levelIds = (item.classLevels || []).map((l) =>
      typeof l === "object" ? l._id : l,
    );
    if (levelIds.length === 0) return "—";
    return levelIds.map(getClassLevelName).join(", ");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Programs</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Add Program
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
            {editingId ? "Edit Program" : "New Program"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
                placeholder="e.g. Computer Science"
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
                placeholder="Program description"
                required
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                placeholder="e.g. 4 years"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Class Levels (order matters)
              </label>
              <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {classLevels.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No class levels yet. Create class levels first.
                  </p>
                ) : (
                  classLevels.map((level) => (
                    <label
                      key={level._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.classLevels.includes(level._id)}
                        onChange={() => toggleClassLevel(level._id)}
                        className="rounded border-slate-300"
                      />
                      <span className="text-slate-700">{level.name}</span>
                    </label>
                  ))
                )}
              </div>
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
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No programs yet. Click &quot;Add Program&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Class Levels
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programs.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">
                      {item.name}
                    </span>
                    {item.code && (
                      <span className="ml-2 text-xs text-slate-500">
                        ({item.code})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.duration}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {formatClassLevels(item)}
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

export default ProgramsPage;
