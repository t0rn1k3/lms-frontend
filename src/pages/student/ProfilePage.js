import { useState, useEffect } from "react";
import { studentService, getErrorMessage } from "../../api";
import { validateProfileForm } from "../../utils/validation";
import { ErrorMessage, PageLoader, PageError } from "../../components";

export default function ProfilePage() {
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
    return <PageLoader message="Loading profile..." />;
  }

  if (error && !profile) {
    return <PageError message={error} backTo="/student" backLabel="Back to Overview" />;
  }

  const studentProfile = profile?.studentProfile ?? profile ?? {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>

      {error && (
        <ErrorMessage
          message={error}
          dismissible
          onDismiss={() => setError("")}
          className="mb-4"
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Profile Info
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-800">
                {studentProfile.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-800">
                {studentProfile.email ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Student ID</dt>
              <dd className="font-medium text-slate-800">
                {studentProfile.studentId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Program</dt>
              <dd className="font-medium text-slate-800">
                {typeof studentProfile.program === "object"
                  ? studentProfile.program?.name
                  : (studentProfile.program ?? "—")}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Class Level</dt>
              <dd className="font-medium text-slate-800">
                {typeof studentProfile.currentClassLevel === "object"
                  ? studentProfile.currentClassLevel?.name
                  : (studentProfile.currentClassLevel ?? "—")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Edit Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Leave blank to keep current"
                minLength={6}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
