import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  examService,
  academicService,
  getErrorMessage,
} from "../../api";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    program: "",
    academicTerm: "",
    academicYear: "",
    classLevel: "",
    duration: "30 minutes",
    examDate: "",
    examTime: "",
    examType: "Quiz",
  });
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
      const [p, s, t, y, c] = await Promise.all([
        academicService.getPrograms(),
        academicService.getSubjects(),
        academicService.getAcademicTerms(),
        academicService.getAcademicYears(),
        academicService.getClassLevels(),
      ]);
      setPrograms(p.data?.data || []);
      setSubjects(s.data?.data || []);
      setAcademicTerms(t.data?.data || []);
      setAcademicYears(y.data?.data || []);
      setClassLevels(c.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch lookups:", err);
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
    setFormData({
      name: "",
      description: "",
      subject: "",
      program: "",
      academicTerm: "",
      academicYear: "",
      classLevel: "",
      duration: "30 minutes",
      examDate: new Date().toISOString().slice(0, 10),
      examTime: "09:00",
      examType: "Quiz",
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      subject: getRefId(item.subject) || "",
      program: getRefId(item.program) || "",
      academicTerm: getRefId(item.academicTerm) || "",
      academicYear: getRefId(item.academicYear) || "",
      classLevel: getRefId(item.classLevel) || "",
      duration: item.duration || "30 minutes",
      examDate: item.examDate
        ? new Date(item.examDate).toISOString().slice(0, 10)
        : "",
      examTime: item.examTime || "09:00",
      examType: item.examType || "Quiz",
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
        subject: formData.subject,
        program: formData.program,
        academicTerm: formData.academicTerm,
        academicYear: formData.academicYear,
        classLevel: formData.classLevel,
        duration: formData.duration,
        examDate: formData.examDate,
        examTime: formData.examTime,
        examType: formData.examType,
      };
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
        <h1 className="text-2xl font-bold text-slate-800">Exams</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Add Exam
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
            {editingId ? "Edit Exam" : "New Exam"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                required
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program *</label>
                <select
                  value={formData.program}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, program: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Term *</label>
                <select
                  value={formData.academicTerm}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, academicTerm: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {academicTerms.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year *</label>
                <select
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, academicYear: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {academicYears.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.name || `${new Date(y.fromYear).getFullYear()}-${new Date(y.toYear).getFullYear()}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class Level *</label>
              <select
                value={formData.classLevel}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, classLevel: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select</option>
                {classLevels.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date *</label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examDate: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Time *</label>
                <input
                  type="time"
                  value={formData.examTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examTime: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type *</label>
              <select
                value={formData.examType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, examType: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="Quiz">Quiz</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
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
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No exams yet. Click &quot;Add Exam&quot; to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Questions</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/teacher/exams/${item._id}`}
                      className="font-medium text-slate-800 hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getRefName(item.subject)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(item.examDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(item.questions && item.questions.length) || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/teacher/exams/${item._id}`}
                      className="text-slate-600 hover:text-slate-800 mr-3"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      Edit
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
