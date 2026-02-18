import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12 flex flex-col items-center justify-between">
      <div className="flex items-center justify-center bg-white p-4 rounded-lg">
        <img src="/logo.svg" alt="EduManage" className="h-20 w-20" />
      </div>
      <h1 className="text-4xl font-bold text-lms-primary mb-4 tracking-tight mt-4">
        {t("home.title")}
      </h1>
      <p className="text-lg text-lms-primary/90 max-w-xl mx-auto">
        {t("home.subtitle")}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 bg-lms-primary text-white font-medium rounded-lg hover:bg-lms-primary-dark transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {t("home.getStarted")}
        </Link>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 border-2 border-lms-primary text-lms-primary font-medium rounded-lg hover:bg-lms-primary hover:text-white transition-colors duration-200 shadow-md"
        >
          {t("auth.registerButton")}
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
