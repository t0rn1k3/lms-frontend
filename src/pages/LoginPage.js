import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { validateLoginForm } from "../utils/validation";

const LOGIN_ROLES = [
  { value: "admin", labelKey: "roles.admin" },
  { value: "teacher", labelKey: "roles.teacher" },
  { value: "student", labelKey: "roles.student" },
];

const VALID_ROLES = LOGIN_ROLES.map((r) => r.value);

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: roleParam } = useParams();
  const { login } = useAuth();
  const from = location.state?.from?.pathname;

  const [role, setRole] = useState(() => {
    const r = roleParam?.toLowerCase();
    return VALID_ROLES.includes(r) ? r : "admin";
  });

  useEffect(() => {
    const r = roleParam?.toLowerCase();
    if (r && VALID_ROLES.includes(r)) setRole(r);
  }, [roleParam]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formErrors = validateLoginForm({ email, password });
    if (formErrors) {
      setError(formErrors.email || formErrors.password);
      return;
    }
    setLoading(true);

    try {
      await login(email, password, role);
      const isAllowedRedirect = from && from === `/${role}`;
      navigate(isAllowedRedirect ? from : `/${role}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-lms-cream">
        <h1 className="text-2xl font-bold text-lms-primary mb-2">
          {t("auth.login")}
        </h1>
        <p className="text-lms-primary/90 mb-6">{t("auth.subtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-lms-primary mb-2">
              {t("auth.loginAs")}
            </label>
            <div className="flex gap-3">
              {LOGIN_ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setRole(r.value);
                    navigate(`/login/${r.value}`, { replace: true });
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    role === r.value
                      ? "bg-lms-primary text-white"
                      : "bg-lms-light text-lms-primary hover:bg-lms-cream/70"
                  }`}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${role}@school.com`}
              autoComplete="email"
              className="w-full px-4 py-2 border border-lms-cream rounded-lg focus:ring-2 focus:ring-lms-primary focus:border-lms-primary outline-none transition-shadow invalid:border-red-400"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={6}
              className="w-full px-4 py-2 border border-lms-cream rounded-lg focus:ring-2 focus:ring-lms-primary focus:border-lms-primary outline-none transition-shadow"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lms-primary text-white font-medium rounded-lg hover:bg-lms-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-lms-primary/80">
          {role === "admin" && (
            <>
              {t("auth.noAccount")}{" "}
              <Link
                to="/register"
                className="text-lms-primary font-medium hover:underline"
              >
                {t("auth.register")}
              </Link>
              <br />
            </>
          )}
          <Link to="/" className="text-lms-primary hover:underline">
            {t("auth.backToHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
