import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminService, getErrorMessage } from "../../api";

function AdminProfilePage() {
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
      const { data } = await adminService.getProfile();
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

  useEffect(() => {
    fetchProfile();
  }, []);

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
      await adminService.updateProfile(payload);
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
      <div className="p-8 text-center text-slate-500">Loading profile...</div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Profile</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
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
              placeholder={t("common.passwordPlaceholder")}
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
              {submitting ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProfilePage;
