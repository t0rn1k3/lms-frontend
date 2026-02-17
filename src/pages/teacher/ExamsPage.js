import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  examService,
  academicService,
  getErrorMessage,
} from "../../api";

function ExamsPage() {
  const { t } = useTranslation();
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
        <h1 className="text-2xl font-bold text-lms-primary">{t("teacher.exams")}</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("teacher.addExam")}
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
            {editingId ? t("teacher.editExam") : t("teacher.newExam")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">{t("common.name")} *</label>
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
              <label className="block text-sm font-medium text-lms-primary mb-1">{t("common.description")} *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                required
                rows={2}
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("admin.subject")} *</label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">{t("teacher.select")}</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("admin.program")} *</label>
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
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("admin.academicTermLabel")} *</label>
                <select
                  value={formData.academicTerm}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, academicTerm: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">{t("teacher.select")}</option>
                  {academicTerms.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("admin.academicYearLabel")} *</label>
                <select
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, academicYear: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                >
                  <option value="">{t("teacher.select")}</option>
                  {academicYears.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.name || `${new Date(y.fromYear).getFullYear()}-${new Date(y.toYear).getFullYear()}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">{t("admin.classLevel")} *</label>
              <select
                value={formData.classLevel}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, classLevel: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="">{t("teacher.select")}</option>
                {classLevels.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("common.duration")} *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("teacher.examDate")} *</label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examDate: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">{t("teacher.examTime")} *</label>
                <input
                  type="time"
                  value={formData.examTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examTime: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">{t("teacher.examType")} *</label>
              <select
                value={formData.examType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, examType: e.target.value }))
                }
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              >
                <option value="Quiz">{t("teacher.examTypeQuiz")}</option>
                <option value="Midterm">{t("teacher.examTypeMidterm")}</option>
                <option value="Final">{t("teacher.examTypeFinal")}</option>
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
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("teacher.noExams")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-lms-cream/30 border-b border-lms-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">{t("common.name")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">{t("admin.subject")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">{t("student.date")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">{t("student.questions")}</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-cream">
              {exams.map((item) => (
                <tr key={item._id} className="hover:bg-lms-cream/30/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/teacher/exams/${item._id}`}
                      className="font-medium text-lms-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {getRefName(item.subject)}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {formatDate(item.examDate)}
                  </td>
                  <td className="px-4 py-3 text-lms-primary/90">
                    {(item.questions && item.questions.length) || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/teacher/exams/${item._id}`}
                      className="text-lms-primary/90 hover:text-lms-primary mr-3"
                    >
                      {t("common.view")}
                    </Link>
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-lms-primary/90 hover:text-lms-primary"
                    >
                      {t("common.edit")}
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
