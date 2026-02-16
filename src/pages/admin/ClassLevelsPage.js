import { useState, useEffect } from "react";
import { academicService, getErrorMessage } from "../../api";

function ClassLevelsPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "3 months",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const { data } = await academicService.getClassLevels();
      setLevels(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", duration: "3 months" });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      duration: item.duration || "3 months",
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
        duration: formData.duration.trim(),
      };
      if (editingId) {
        await academicService.updateClassLevel(editingId, payload);
      } else {
        await academicService.createClassLevel(payload);
      }
      setFormOpen(false);
      fetchLevels();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class level?")) return;
    try {
      await academicService.deleteClassLevel(id);
      fetchLevels();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Class Levels</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Add Class Level
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
            {editingId ? "Edit Class Level" : "New Class Level"}
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
                placeholder="e.g. Grade 1 or Level 100"
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
                placeholder="Class level description"
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
                placeholder="e.g. 3 months"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
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
        ) : levels.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No class levels yet. Click &quot;Add Class Level&quot; to create
            one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Duration
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.duration}</td>
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

export default ClassLevelsPage;
