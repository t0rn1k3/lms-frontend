import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  teacherService,
  moduleService,
  academicService,
  studentService,
  getErrorMessage,
} from "../../api";

function TeacherProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [myModules, setMyModules] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await teacherService.getProfile();
      const p = data.data ?? data;
      setProfile(p);
      setFormData({
        name: p?.name || "",
        email: p?.email || "",
        password: "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyModules = async (teacherId) => {
    if (!teacherId) return;
    setModulesLoading(true);
    try {
      const { data } = await moduleService.list({ teacher: teacherId });
      setMyModules(data?.data ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch my modules:", err);
      setMyModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchYearGroups = async () => {
    try {
      const { data } = await academicService.getYearGroups();
      setYearGroups(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch year groups:", err);
      setYearGroups([]);
    }
  };

  const [studentsByGroupId, setStudentsByGroupId] = useState(null);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    setStudentsByGroupId(null);
    try {
      const res = await teacherService.getMyStudents();
      const data = res?.data;
      const raw = data?.data ?? data ?? data?.students;
      const getRef = (v) => (typeof v === "object" ? (v?._id ?? v?.id) : v);
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        setStudentsByGroupId(raw);
        setStudents(Object.values(raw).flat().filter(Boolean));
      } else if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0];
        if (first && typeof first === "object" && Array.isArray(first.students)) {
          const byId = {};
          raw.forEach((item) => {
            const gid = String(getRef(item.yearGroup ?? item.group) ?? "");
            if (gid) byId[gid] = (byId[gid] || []).concat(item.students || []);
          });
          setStudentsByGroupId(byId);
          setStudents(Object.values(byId).flat().filter(Boolean));
        } else {
          setStudents(raw);
        }
      } else {
        const list = Array.isArray(raw) ? raw : Array.isArray(data?.students) ? data.students : [];
        setStudents(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Failed to fetch students (getMyStudents):", err);
      const getRef = (v) => (typeof v === "object" ? (v?._id ?? v?.id) : v);
      const groupIds = (profile?.yearGroups || profile?.groups || [profile?.yearGroup, profile?.group])
        .filter(Boolean)
        .map((g) => String(getRef(g) ?? ""));
      let combined = [];
      for (const gid of groupIds) {
        if (!gid) continue;
        try {
          const res = await studentService.list({
            params: { yearGroup: gid },
            skip401Redirect: true,
          });
          const data = res?.data;
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          if (Array.isArray(list)) combined = combined.concat(list);
        } catch (_) {
          /* try next group */
        }
      }
      if (combined.length > 0) {
        setStudents(combined);
      } else {
        try {
          const res = await studentService.list({ skip401Redirect: true });
          const data = res?.data;
          const list =
            Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setStudents(Array.isArray(list) ? list : []);
        } catch (fallbackErr) {
          console.error("Fallback studentService.list also failed:", fallbackErr);
          setStudents([]);
        }
      }
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchYearGroups();
  }, []);

  useEffect(() => {
    const hasGroups =
      (profile?.yearGroups?.length > 0) ||
      (profile?.groups?.length > 0) ||
      !!profile?.yearGroup ||
      !!profile?.group;
    if (hasGroups) fetchStudents();
    else setStudents([]);
  }, [profile?._id, profile?.yearGroups, profile?.yearGroup, profile?.groups, profile?.group]);

  useEffect(() => {
    const teacherId = profile?._id;
    if (teacherId) fetchMyModules(teacherId);
    else setMyModules([]);
  }, [profile?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };
      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }
      await teacherService.updateProfile(payload);
      setFormData((prev) => ({ ...prev, password: "" }));
      fetchProfile();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lms-primary/80">{t("teacher.loadingProfile")}</div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  const getRefId = (val) =>
    typeof val === "object" ? (val?._id ?? val?.id) : val;
  const getStudentGroupId = (s) =>
    String(
      getRefId(s.yearGroup) ??
      getRefId(s.group) ??
      getRefId(s.yearGroupId) ??
      getRefId(s.class) ??
      getRefId(s.section) ??
      ""
    );
  const getYearGroupName = (idOrObj) => {
    if (!idOrObj) return "—";
    if (typeof idOrObj === "object" && idOrObj?.name) return idOrObj.name;
    const id = typeof idOrObj === "object" ? getRefId(idOrObj) : idOrObj;
    const g = yearGroups.find((x) => (x._id || x.id) === id);
    return g?.name || id;
  };
  const myGroups = (
    profile?.yearGroups ||
    profile?.groups ||
    [profile?.yearGroup, profile?.group]
  )
    .filter(Boolean)
    .map((g) => ({ id: getRefId(g), name: getYearGroupName(g) }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-6">{t("common.profile")}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-lms-cream p-6 max-w-md">
        <h2 className="text-lg font-semibold text-lms-primary mb-4">
          {t("student.editProfile")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
              className="w-full px-3 py-2 border border-lms-cream rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-primary mb-1">
              {t("common.email")}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-lms-cream rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lms-primary mb-1">
              {t("common.newPassword")}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={t("common.passwordPlaceholder")}
              minLength={6}
              className="w-full px-3 py-2 border border-lms-cream rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark disabled:opacity-50"
            >
              {submitting ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-lms-cream p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-lms-primary mb-4">
          {t("teacher.myModules")}
        </h2>
        {modulesLoading ? (
          <p className="text-sm text-lms-primary/70">{t("common.loading")}</p>
        ) : myModules.length === 0 ? (
          <p className="text-sm text-lms-primary/70">
            {t("teacher.noModulesAssigned")}
          </p>
        ) : (
          <ul className="space-y-2">
            {myModules.map((mod) => (
              <li
                key={mod._id}
                className="flex justify-between items-center py-2 border-b border-lms-cream last:border-0"
              >
                <span className="font-medium text-lms-primary">{mod.name}</span>
                <span className="text-sm text-lms-primary/80">
                  {typeof mod.program === "object"
                    ? mod.program?.name
                    : mod.program}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-lms-cream p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-lms-primary mb-4">
          {t("teacher.myGroups")}
        </h2>
        {myGroups.length === 0 ? (
          <p className="text-sm text-lms-primary/70">
            {t("teacher.noGroupsAssigned")}
          </p>
        ) : studentsLoading ? (
          <p className="text-sm text-lms-primary/70">{t("common.loading")}</p>
        ) : (
          <div className="space-y-6">
            {myGroups.map((g) => {
              const gid = String(g.id || "");
              let groupStudents;
              if (studentsByGroupId) {
                const direct = studentsByGroupId[gid] ?? studentsByGroupId[g.id];
                if (Array.isArray(direct)) {
                  groupStudents = direct.filter(Boolean);
                } else {
                  const key = Object.keys(studentsByGroupId).find(
                    (k) => String(k) === gid || String(getRefId(studentsByGroupId[k]?.[0]?.yearGroup)) === gid
                  );
                  groupStudents = key ? (studentsByGroupId[key] || []).filter(Boolean) : [];
                }
              } else {
                groupStudents = students.filter((s) => getStudentGroupId(s) === gid);
              }
              return (
                <div
                  key={g.id}
                  className="border border-lms-cream rounded-lg p-4"
                >
                  <h3 className="font-medium text-lms-primary mb-2">{g.name}</h3>
                  {groupStudents.length === 0 ? (
                    <p className="text-sm text-lms-primary/70">
                      {t("teacher.noStudentsInGroup")}
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {groupStudents.map((s) => (
                        <li
                          key={s._id}
                          className="flex items-center gap-2 text-sm text-lms-primary/90"
                        >
                          <span>{s.name}</span>
                          {s.studentId && (
                            <span className="text-lms-primary/60 text-xs">
                              ({s.studentId})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherProfilePage;
