import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  authService,
  teacherService,
  academicService,
  moduleService,
  getErrorMessage,
} from "../../api";

function TeachersPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    programs: [],
    yearGroup: "",
    modules: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchName, setSearchName] = useState("");
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [pagination, setPagination] = useState({});

  const fetchTeachers = useCallback(
    async (opts = {}) => {
      try {
        setLoading(true);
        const params = {
          page: opts.page ?? page,
          limit: opts.limit ?? limit,
        };
        if (searchName.trim()) params.name = searchName.trim();
        const { data } = await teacherService.list(params);
        setTeachers(data.data || []);
        setTotalTeachers(data.totalTeachers ?? 0);
        setPagination(data.pagination || {});
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [page, limit, searchName],
  );

  const fetchLookups = useCallback(async () => {
    try {
      const [pRes, gRes, mRes] = await Promise.all([
        academicService.getPrograms(),
        academicService.getYearGroups(),
        moduleService.list(),
      ]);
      setPrograms(pRes.data?.data || []);
      setYearGroups(gRes.data?.data || []);
      setModules(mRes.data?.data ?? mRes.data ?? []);
    } catch (err) {
      console.error("Failed to fetch lookups:", err);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    const editId = location.state?.editId;
    if (!editId) return;
    const openEdit = async () => {
      try {
        const { data } = await teacherService.getOne(editId);
        const t = data.data ?? data;
        if (t) openEditForm(t);
        navigate("/admin/teachers", { replace: true, state: {} });
      } catch {
        navigate("/admin/teachers", { replace: true, state: {} });
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

  const getYearGroupName = (id) => {
    if (!id) return "—";
    const g = yearGroups.find((x) => x._id === id);
    return g?.name || id;
  };

  const getModuleName = (id) => {
    if (!id) return "—";
    const m = modules.find((x) => x._id === id);
    return m?.name || id;
  };

  const getRefId = (val) => (typeof val === "object" ? val?._id : val);

  const toggleProgram = (programId) => {
    setFormData((prev) =>
      prev.programs.includes(programId)
        ? { ...prev, programs: prev.programs.filter((id) => id !== programId) }
        : { ...prev, programs: [...prev.programs, programId] }
    );
  };

  const toggleModule = (moduleId) => {
    setFormData((prev) =>
      prev.modules.includes(moduleId)
        ? { ...prev, modules: prev.modules.filter((id) => id !== moduleId) }
        : { ...prev, modules: [...prev.modules, moduleId] }
    );
  };

  const getTeacherStatus = (item) => {
    if (item.isWithdrawn) return "withdrawn";
    if (item.isSuspended) return "suspended";
    return "active";
  };

  const handleSuspend = async (id) => {
    try {
      await teacherService.suspend(id);
      fetchTeachers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUnsuspend = async (id) => {
    try {
      await teacherService.unsuspend(id);
      fetchTeachers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleWithdrawDelete = async (id) => {
    try {
      await teacherService.withdraw(id);
      fetchTeachers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      programs: [],
      yearGroup: "",
      modules: [],
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    const programIds = (item.programs || [item.program]).filter(Boolean).map((p) => getRefId(p));
    const moduleIds = (item.modules || [item.subject]).filter(Boolean).map((m) => getRefId(m));
    setFormData({
      name: item.name || "",
      email: item.email || "",
      password: "",
      programs: programIds,
      yearGroup: getRefId(item.yearGroup) || "",
      modules: moduleIds,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        const programs = formData.programs || [];
        const modules = formData.modules || [];
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          programs,
          modules,
        };
        if (formData.yearGroup) {
          payload.yearGroup = formData.yearGroup;
        }
        const { data } = await teacherService.update(editingId, payload);
        const updatedTeacher = data?.data ?? data;
        if (updatedTeacher) {
          setTeachers((prev) =>
            prev.map((t) => (t._id === editingId ? updatedTeacher : t))
          );
        } else {
          fetchTeachers();
        }
      } else {
        if (!formData.password || formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setSubmitting(false);
          return;
        }
        await authService.teacherRegister(
          formData.name.trim(),
          formData.email.trim().toLowerCase(),
          formData.password,
        );
      }
      setFormOpen(false);
      if (!editingId) fetchTeachers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lms-primary">Teachers</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark text-sm"
        >
          {t("admin.addTeacher")}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder={t("admin.searchByName")}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchTeachers()}
          className="px-3 py-2 border border-lms-cream rounded-lg w-64 text-sm"
        />
        <button
          onClick={() => {
            setPage(1);
            fetchTeachers({ page: 1 });
          }}
          className="px-4 py-2 border border-lms-cream rounded-lg hover:bg-lms-cream/30 text-sm"
        >
          {t("common.search")}
        </button>
      </div>

      {formOpen && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-lms-cream">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {editingId ? t("admin.editTeacher") : t("admin.newTeacher")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
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
                className="w-full px-3 py-2 border border-lms-cream rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lms-primary mb-1">
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
                className="w-full px-3 py-2 border border-lms-cream rounded-lg disabled:bg-lms-light disabled:text-lms-primary/80"
              />
              {editingId && (
                <p className="text-xs text-lms-primary/80 mt-1">
                  {t("common.emailCannotChange")}
                </p>
              )}
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-lms-primary mb-1">
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
                  className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                />
              </div>
            )}
            {editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-2">
                    {t("admin.programs")}
                  </label>
                  <div className="border border-lms-cream rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {programs.length === 0 ? (
                      <p className="text-sm text-lms-primary/70">
                        {t("admin.noPrograms")}
                      </p>
                    ) : (
                      programs.map((p) => (
                        <label
                          key={p._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.programs.includes(p._id)}
                            onChange={() => toggleProgram(p._id)}
                            className="rounded border-lms-cream"
                          />
                          <span className="text-lms-primary">{p.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-1">
                    {t("admin.yearGroups")}
                  </label>
                  <select
                    value={formData.yearGroup}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        yearGroup: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-lms-cream rounded-lg"
                  >
                    <option value="">— {t("common.none")} —</option>
                    {yearGroups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {getYearGroupName(g._id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lms-primary mb-2">
                    {t("admin.modules")}
                  </label>
                  <div className="border border-lms-cream rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {modules.length === 0 ? (
                      <p className="text-sm text-lms-primary/70">
                        {t("admin.noModules")}
                      </p>
                    ) : (
                      modules.map((m) => (
                        <label
                          key={m._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.modules.includes(m._id)}
                            onChange={() => toggleModule(m._id)}
                            className="rounded border-lms-cream"
                          />
                          <span className="text-lms-primary">{m.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-lms-primary/70 mt-1">
                    {t("admin.modulesAssignedToTeacherHint")}
                  </p>
                </div>
              </>
            )}
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

      <div className="bg-white rounded-xl border border-lms-cream overflow-hidden overflow-x-auto ">
        {loading ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("common.loading")}
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8 text-center text-lms-primary/80">
            {t("admin.noTeachers")}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-lms-cream/30 border-b border-lms-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary ">
                    {t("common.name")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                    {t("common.email")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                    {t("common.teacherId")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                    {t("admin.programs")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                    {t("admin.modules")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-lms-primary">
                    {t("common.status")}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-lms-primary">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lms-cream text-xs">
                {teachers.map((item) => (
                  <tr key={item._id} className="hover:bg-lms-cream/30/50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/teachers/${item._id}`}
                        className="font-medium text-lms-primary hover:underline text-sm"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-lms-primary/90">
                      {item.email}
                    </td>
                    <td className="px-4 py-3 text-lms-primary/80 ">
                      {item.teacherId || "—"}
                    </td>
                    <td className="px-4 py-3 text-lms-primary/90 max-w-[180px]">
                      {((item.programs || [item.program]).filter(Boolean).map((p) => getProgramName(getRefId(p))).join(", ") || "—")}
                    </td>
                    <td className="px-4 py-3 text-lms-primary/90 max-w-[180px]">
                      {((item.modules || [item.subject]).filter(Boolean).map((m) => getModuleName(getRefId(m))).join(", ") || "—")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          getTeacherStatus(item) === "active"
                            ? "bg-green-100 text-green-800"
                            : getTeacherStatus(item) === "suspended"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-lms-light text-lms-primary"
                        }`}
                      >
                        {t(`admin.${getTeacherStatus(item)}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap min-w-[240px]">
                      <Link
                        to={`/admin/teachers/${item._id}`}
                        className="text-lms-primary/90 hover:text-lms-primary mr-3"
                      >
                        {t("common.view")}
                      </Link>
                      <button
                        onClick={() => openEditForm(item)}
                        className="text-lms-primary/90 hover:text-lms-primary mr-3"
                      >
                        {t("common.edit")}
                      </button>
                      {getTeacherStatus(item) === "active" && (
                        <>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(t("admin.confirmSuspendTeacher"))
                              ) {
                                handleSuspend(item._id);
                              }
                            }}
                            className="text-amber-600 hover:text-amber-800 mr-3"
                          >
                            {t("admin.suspend")}
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  t("admin.confirmWithdrawTeacher"),
                                )
                              ) {
                                handleWithdrawDelete(item._id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            {t("admin.withdraw")}
                          </button>
                        </>
                      )}
                      {(getTeacherStatus(item) === "suspended" ||
                        getTeacherStatus(item) === "withdrawn") && (
                        <button
                          onClick={() => {
                            if (window.confirm(t("admin.confirmReactivate"))) {
                              handleUnsuspend(item._id);
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
            {(pagination.next || pagination.previous) && (
              <div className="px-4 py-3 border-t border-lms-cream flex items-center justify-between text-sm text-lms-primary/90">
                <span>
                  Showing page {page} of {Math.ceil(totalTeachers / limit) || 1}{" "}
                  ({totalTeachers} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.previous}
                    className="px-3 py-1 border border-lms-cream rounded hover:bg-lms-cream/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.previous")}
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.next}
                    className="px-3 py-1 border border-lms-cream rounded hover:bg-lms-cream/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.next")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TeachersPage;
