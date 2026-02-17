import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService, getErrorMessage } from "../api";
import { validateRegisterForm } from "../utils/validation";

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formErrors = validateRegisterForm(formData);
    if (formErrors) {
      setError(Object.values(formErrors).join(". "));
      return;
    }
    setLoading(true);
    try {
      await authService.adminRegister(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password
      );
      setSuccess(true);
      setTimeout(() => navigate("/login/admin"), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-lms-cream text-center">
          <p className="text-green-600 font-medium mb-4">
            {t("auth.registerSuccess")}
          </p>
          <p className="text-lms-primary/90 text-sm mb-4">
            {t("auth.registerRedirect")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-lms-cream">
        <h1 className="text-2xl font-bold text-lms-primary mb-2">
          {t("auth.register")}
        </h1>
        <p className="text-lms-primary/90 mb-6">
          {t("auth.registerSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-lms-primary mb-2"
            >
              {t("common.name")}
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              autoComplete="name"
              className="w-full px-4 py-2 border border-lms-cream rounded-lg focus:ring-2 focus:ring-lms-primary focus:border-lms-primary outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-lms-primary mb-2"
            >
              {t("common.email")}
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-lms-cream rounded-lg focus:ring-2 focus:ring-lms-primary focus:border-lms-primary outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-lms-primary mb-2"
            >
              {t("common.password")}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-lms-cream rounded-lg focus:ring-2 focus:ring-lms-primary focus:border-lms-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lms-primary text-white font-medium rounded-lg hover:bg-lms-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.registering") : t("auth.createAccount")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-lms-primary/80">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login/admin" className="text-lms-primary font-medium hover:underline">
            {t("auth.login")}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-lms-primary/80">
          <Link to="/" className="text-lms-primary hover:underline">
            ← {t("auth.backToHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
