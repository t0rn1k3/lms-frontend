import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12 ">
      <h1 className="text-4xl font-bold text-red-800 mb-4 tracking-tight">
        {t("home.title")}
      </h1>
      <p className="text-lg text-slate-600 max-w-xl mx-auto">
        {t("home.subtitle")}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {t("home.getStarted")}
        </Link>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 border-2 border-slate-800 text-slate-800 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200 shadow-md"
        >
          {t("auth.registerButton")}
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
