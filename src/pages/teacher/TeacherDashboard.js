import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examService, examResultService, getErrorMessage } from "../../api";

const KPI_ICON_SIZE = "w-8 h-8";
const IconDocument = ({ className = "" }) => (
  <svg
    className={`${KPI_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const IconGraduation = ({ className = "" }) => (
  <svg
    className={`${KPI_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
);
const IconChart = ({ className = "" }) => (
  <svg
    className={`${KPI_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const IconClock = ({ className = "" }) => (
  <svg
    className={`${KPI_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconCheck = ({ className = "" }) => (
  <svg
    className={`${KPI_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconShare = ({ className = "" }) => (
  <svg
    className={`${KPI_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </svg>
);

const FEATURE_ICON_SIZE = "w-12 h-12";
const IconDocumentLarge = ({ className = "" }) => (
  <svg
    className={`${FEATURE_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const IconChartLarge = ({ className = "" }) => (
  <svg
    className={`${FEATURE_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const IconUserLarge = ({ className = "" }) => (
  <svg
    className={`${FEATURE_ICON_SIZE} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

function TeacherDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    myExams: 0,
    totalQuestions: 0,
    examResults: 0,
    pendingGrading: 0,
    gradedResults: 0,
    publishedResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [examsRes, resultsRes] = await Promise.all([
          examService.list(),
          examResultService.teacherList().catch(() => ({ data: { data: [] } })),
        ]);

        const examsData = examsRes.data?.data ?? examsRes.data ?? [];
        const resultsData =
          resultsRes.data?.data ?? resultsRes.data ?? [];

        const exams = Array.isArray(examsData) ? examsData : [];
        const results = Array.isArray(resultsData) ? resultsData : [];

        const totalQuestions = exams.reduce(
          (sum, e) => sum + ((e.questions && e.questions.length) || 0),
          0
        );
        const pendingGrading = results.filter(
          (r) => !r.isFullyGraded || r.status === "Pending"
        ).length;
        const gradedResults = results.filter((r) => r.isFullyGraded).length;
        const publishedResults = results.filter((r) => r.isPublished).length;

        setStats({
          myExams: exams.length,
          totalQuestions,
          examResults: results.length,
          pendingGrading,
          gradedResults,
          publishedResults,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpiCards = [
    {
      key: "myExams",
      labelKey: "teacher.kpiMyExams",
      Icon: IconDocument,
      color: "text-blue-500",
    },
    {
      key: "totalQuestions",
      labelKey: "teacher.totalQuestions",
      Icon: IconGraduation,
      color: "text-violet-500",
    },
    {
      key: "examResults",
      labelKey: "teacher.examResults",
      Icon: IconChart,
      color: "text-amber-500",
    },
    {
      key: "pendingGrading",
      labelKey: "teacher.kpiPendingGrading",
      Icon: IconClock,
      color: "text-orange-500",
    },
    {
      key: "gradedResults",
      labelKey: "teacher.kpiGradedResults",
      Icon: IconCheck,
      color: "text-green-500",
    },
    {
      key: "publishedResults",
      labelKey: "teacher.kpiPublishedResults",
      Icon: IconShare,
      color: "text-sky-500",
    },
  ];

  const featureCards = [
    {
      to: "/teacher/exams",
      titleKey: "teacher.featureManageExams",
      descKey: "teacher.featureManageExamsDesc",
      Icon: IconDocumentLarge,
      color: "text-blue-500",
    },
    {
      to: "/teacher/exam-results",
      titleKey: "teacher.examResults",
      descKey: "teacher.featureGradeResultsDesc",
      Icon: IconChartLarge,
      color: "text-violet-500",
    },
    {
      to: "/teacher/profile",
      titleKey: "common.profile",
      descKey: "teacher.featureProfileDesc",
      Icon: IconUserLarge,
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">
          {t("teacher.overview")}
        </h1>
        <div className="text-lms-primary/80">{t("admin.loadingStats")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">
          {t("teacher.overview")}
        </h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-2">
        {t("teacher.overview")}
      </h1>
      <p className="text-lms-primary/90 mb-8">{t("teacher.overviewIntro")}</p>

      {/* Top section: KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpiCards.map(({ key, labelKey, Icon, color, suffix = "" }) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-lms-cream shadow-sm p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-lms-primary/80 mb-1">
                {t(labelKey)}
              </p>
              <p className="text-2xl font-bold text-lms-primary">
                {stats[key] ?? 0}
                {suffix}
              </p>
            </div>
            <Icon className={`${color} flex-shrink-0`} />
          </div>
        ))}
      </div>

      {/* Bottom section: Feature cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {featureCards.map(({ to, titleKey, descKey, Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="block bg-white rounded-xl border border-lms-cream shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <Icon className={`${color} mb-4`} />
            <h2 className="text-lg font-bold text-lms-primary mb-2">
              {t(titleKey)}
            </h2>
            <p className="text-sm text-lms-primary/80 leading-relaxed">
              {t(descKey)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TeacherDashboard;
