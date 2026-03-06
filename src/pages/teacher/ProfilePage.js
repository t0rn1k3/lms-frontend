import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  teacherService,
  moduleService,
  academicService,
  getErrorMessage,
} from "../../api";

function TeacherProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [myModules, setMyModules] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
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

  useEffect(() => {
    fetchProfile();
    fetchYearGroups();
  }, []);

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
  const getYearGroupName = (idOrObj) => {
    if (!idOrObj) return "—";
    if (typeof idOrObj === "object" && idOrObj?.name) return idOrObj.name;
    const id = typeof idOrObj === "object" ? getRefId(idOrObj) : idOrObj;
    const g = yearGroups.find((x) => (x._id || x.id) === id);
    return g?.name || id;
  };
  const myGroups = (profile?.yearGroups || [profile?.yearGroup])
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
        ) : (
          <ul className="space-y-2">
            {myGroups.map((g) => (
              <li
                key={g.id}
                className="flex justify-between items-center py-2 border-b border-lms-cream last:border-0"
              >
                <span className="font-medium text-lms-primary">{g.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TeacherProfilePage;
