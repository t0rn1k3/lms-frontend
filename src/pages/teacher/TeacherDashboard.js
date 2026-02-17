import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examService, getErrorMessage } from "../../api";

function TeacherDashboard() {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await examService.list();
        setExams(data.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalQuestions = exams.reduce(
    (sum, e) => sum + ((e.questions && e.questions.length) || 0),
    0
  );

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">{t("teacher.overview")}</h1>
        <div className="text-lms-primary/80">{t("common.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">{t("teacher.overview")}</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-2">{t("teacher.overview")}</h1>
      <p className="text-lms-primary/90 mb-8">
        {t("teacher.overviewIntro")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/teacher/exams"
          className="block p-5 rounded-xl border-2 bg-lms-light border-lms-cream text-lms-primary hover:opacity-90 transition-opacity"
        >
          <div className="text-2xl font-bold">{exams.length}</div>
          <div className="text-sm font-medium opacity-90">{t("teacher.exams")}</div>
        </Link>
        <Link
          to="/teacher/exams"
          className="block p-5 rounded-xl border-2 bg-emerald-50 border-emerald-200 text-emerald-800 hover:opacity-90 transition-opacity"
        >
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <div className="text-sm font-medium opacity-90">{t("teacher.totalQuestions")}</div>
        </Link>
      </div>
    </div>
  );
}

export default TeacherDashboard;
