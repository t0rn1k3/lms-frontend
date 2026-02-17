import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  authService,
  studentService,
  academicService,
  getErrorMessage,
} from "../../api";

function StudentsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    program: "",
    classLevels: [],
    currentClassLevel: "",
    academicYear: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await studentService.list();
      setStudents(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [pRes, cRes, aRes] = await Promise.all([
        academicService.getPrograms(),
        academicService.getClassLevels(),
        academicService.getAcademicYears(),
      ]);
      setPrograms(pRes.data?.data || []);
      setClassLevels(cRes.data?.data || []);
      setAcademicYears(aRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch lookups:", err);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    const editId = location.state?.editId;
    if (!editId) return;
    const openEdit = async () => {
      try {
        const { data } = await studentService.getOne(editId);
        const s = data.data ?? data;
        if (s) openEditForm(s);
        navigate("/admin/students", { replace: true, state: {} });
      } catch {
        navigate("/admin/students", { replace: true, state: {} });
      }
    };
    openEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.editId]);

  const getProgramName = (id) => {
    if (!id) return "—";
    const p = programs.find((x) => x._id === id);
    return p?.name || id;
  };

  const getClassLevelName = (id) => {
    if (!id) return "—";
    const c = classLevels.find((x) => x._id === id);
    return c?.name || id;
  };

  const getAcademicYearName = (id) => {
    if (!id) return "—";
    const y = academicYears.find((x) => x._id === id);
    if (!y) return id;
    const from = y.fromYear ? new Date(y.fromYear).getFullYear() : "";
    const to = y.toYear ? new Date(y.toYear).getFullYear() : "";
    return y.name || (from && to ? `${from}-${to}` : id);
  };

  const getRefId = (val) => (typeof val === "object" ? val?._id : val);

  const getStudentStatus = (item) => {
    if (item.isWithdrawn) return "withdrawn";
    if (item.isSuspended) return "suspended";
    if (item.isGraduated) return "graduated";
    return "active";
  };

  const handleUpdateStatus = async (id, payload) => {
    try {
      await studentService.update(id, payload);
      fetchStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleClassLevel = (id) => {
    setFormData((prev) =>
      prev.classLevels.includes(id)
        ? { ...prev, classLevels: prev.classLevels.filter((x) => x !== id) }
        : { ...prev, classLevels: [...prev.classLevels, id] },
    );
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      program: "",
      classLevels: [],
      currentClassLevel: "",
      academicYear: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const levelIds = (item.classLevels || []).map((l) =>
      typeof l === "object" ? l._id : l,
    );
    const currentId = getRefId(item.currentClassLevel);
    setFormData({
      name: item.name || "",
      email: item.email || "",
      password: "",
      program: getRefId(item.program) || "",
      classLevels: levelIds,
      currentClassLevel: currentId || "",
      academicYear: getRefId(item.academicYear) || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          program: formData.program || undefined,
          classLevels: formData.classLevels,
          currentClassLevel: formData.currentClassLevel || undefined,
          academicYear: formData.academicYear || undefined,
        };
        await studentService.update(editingId, payload);
      } else {
        if (!formData.password || formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setSubmitting(false);
          return;
        }
        await authService.studentRegister(
          formData.name.trim(),
          formData.email.trim().toLowerCase(),
          formData.password,
        );
      }
      setFormOpen(false);
      fetchStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          {t("admin.addStudent")}
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
            {editingId ? t("admin.editStudent") : t("admin.newStudent")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("common.fullName")}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@school.com"
                required
                disabled={!!editingId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
              />
              {editingId && (
                <p className="text-xs text-slate-500 mt-1">
                  {t("common.emailCannotChange")}
                </p>
              )}
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder={t("common.minChars")}
                  required={!editingId}
                  minLength={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            )}
            {editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Program
                  </label>
                  <select
                    value={formData.program}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        program: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">— {t("common.none")} —</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Class Level
                  </label>
                  <select
                    value={formData.currentClassLevel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentClassLevel: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">— {t("common.none")} —</option>
                    {classLevels.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Class Levels (history)
                  </label>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                    {classLevels.map((c) => (
                      <label
                        key={c._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.classLevels.includes(c._id)}
                          onChange={() => toggleClassLevel(c._id)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-700">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        academicYear: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">— {t("common.none")} —</option>
                    {academicYears.map((y) => (
                      <option key={y._id} value={y._id}>
                        {getAcademicYearName(y._id)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">{t("common.loading")}</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {t("admin.noStudents")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Student ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Program
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Current Level
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Academic Year
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  {t("common.status")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/students/${item._id}`}
                      className="font-medium text-slate-800 hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.email}</td>
                  <td className="px-4 py-3 text-slate-500 text-sm">
                    {item.studentId || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getProgramName(getRefId(item.program))}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getClassLevelName(getRefId(item.currentClassLevel))}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getAcademicYearName(getRefId(item.academicYear))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                        getStudentStatus(item) === "active"
                          ? "bg-green-100 text-green-800"
                          : getStudentStatus(item) === "suspended"
                            ? "bg-amber-100 text-amber-800"
                            : getStudentStatus(item) === "graduated"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t(`admin.${getStudentStatus(item)}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap min-w-[240px]">
                    <Link
                      to={`/admin/students/${item._id}`}
                      className="text-slate-600 hover:text-slate-800 mr-3"
                    >
                      {t("common.view")}
                    </Link>
                    <button
                      onClick={() => openEditForm(item)}
                      className="text-slate-600 hover:text-slate-800 mr-3"
                    >
                      {t("common.edit")}
                    </button>
                    {getStudentStatus(item) === "active" && (
                      <>
                        <button
                          onClick={() => {
                            if (window.confirm(t("admin.confirmSuspendStudent"))) {
                              handleUpdateStatus(item._id, { isSuspended: true, isWithdrawn: false });
                            }
                          }}
                          className="text-amber-600 hover:text-amber-800 mr-3"
                        >
                          {t("admin.suspend")}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("admin.confirmWithdrawStudent"))) {
                              handleUpdateStatus(item._id, { isSuspended: false, isWithdrawn: true });
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          {t("admin.withdraw")}
                        </button>
                      </>
                    )}
                    {(getStudentStatus(item) === "suspended" ||
                      getStudentStatus(item) === "withdrawn") && (
                      <button
                        onClick={() => {
                          if (window.confirm(t("admin.confirmReactivate"))) {
                            handleUpdateStatus(item._id, { isSuspended: false, isWithdrawn: false });
                          }
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        {t("admin.reactivate")}
                      </button>
                    )}
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

export default StudentsPage;
