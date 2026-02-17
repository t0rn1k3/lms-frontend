import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { studentService, getErrorMessage } from "../../api";
import { validateProfileForm } from "../../utils/validation";
import { ErrorMessage, PageLoader, PageError } from "../../components";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
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
      const { data } = await studentService.getProfile();
      const payload = data?.data ?? data;
      const p = payload?.studentProfile ?? payload;
      setProfile(payload);
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formErrors = validateProfileForm(formData);
    if (formErrors) {
      setError(Object.values(formErrors).join(". "));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };
      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }
      await studentService.updateProfile(payload);
      setFormData((prev) => ({ ...prev, password: "" }));
      fetchProfile();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader message={t("student.loadingProfile")} />;
  }

  if (error && !profile) {
    return <PageError message={error} backTo="/student" backLabel={t("student.backToOverview")} />;
  }

  const studentProfile = profile?.studentProfile ?? profile ?? {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-6">{t("student.profileTitle")}</h1>

      {error && (
        <ErrorMessage
          message={error}
          dismissible
          onDismiss={() => setError("")}
          className="mb-4"
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-lms-cream p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-lms-primary mb-4">
            {t("student.profileInfo")}
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-lms-primary/80">{t("common.name")}</dt>
              <dd className="font-medium text-lms-primary">
                {studentProfile.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-lms-primary/80">{t("common.email")}</dt>
              <dd className="font-medium text-lms-primary">
                {studentProfile.email ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-lms-primary/80">{t("student.studentId")}</dt>
              <dd className="font-medium text-lms-primary">
                {studentProfile.studentId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-lms-primary/80">{t("student.program")}</dt>
              <dd className="font-medium text-lms-primary">
                {typeof studentProfile.program === "object"
                  ? studentProfile.program?.name
                  : (studentProfile.program ?? "—")}
              </dd>
            </div>
            <div>
              <dt className="text-lms-primary/80">{t("student.classLevel")}</dt>
              <dd className="font-medium text-lms-primary">
                {typeof studentProfile.currentClassLevel === "object"
                  ? studentProfile.currentClassLevel?.name
                  : (studentProfile.currentClassLevel ?? "—")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-lms-cream p-6 shadow-sm">
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
      </div>
    </div>
  );
}
