import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { studentService, examResultService, getErrorMessage } from "../../api";

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
const IconX = ({ className = "" }) => (
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
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
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

function StudentDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    availableExams: 0,
    examsTaken: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
    publishedResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [profileRes, resultsRes, examsRes] = await Promise.all([
          studentService.getProfile(),
          examResultService.list().catch(() => ({ data: { data: [] } })),
          studentService.getExams().catch(() => ({ data: { data: [] } })),
        ]);

        const profile = profileRes.data?.data ?? profileRes.data ?? {};
        const results = resultsRes.data?.data ?? resultsRes.data ?? [];
        const exams = examsRes.data?.data ?? examsRes.data ?? [];

        const resultsArray = Array.isArray(results) ? results : [];
        const examsArray = Array.isArray(exams) ? exams : [];
        const takenExamIds = resultsArray.map((r) =>
          typeof r.exam === "object" ? r.exam?._id : r.exam
        );
        const availableCount = examsArray.filter(
          (e) => !takenExamIds.includes(e._id)
        ).length;

        const passed = resultsArray.filter((r) => r.status === "Passed").length;
        const failed = resultsArray.length - passed;
        const passRate =
          resultsArray.length > 0
            ? Math.round((passed / resultsArray.length) * 100)
            : 0;
        const publishedResults = resultsArray.filter((r) => r.isPublished).length;

        setStats({
          availableExams: availableCount,
          examsTaken: resultsArray.length,
          passed,
          failed,
          passRate,
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
      key: "availableExams",
      labelKey: "student.availableExams",
      Icon: IconDocument,
      color: "text-blue-500",
    },
    {
      key: "examsTaken",
      labelKey: "student.examsTaken",
      Icon: IconChart,
      color: "text-violet-500",
    },
    {
      key: "passed",
      labelKey: "student.passed",
      Icon: IconCheck,
      color: "text-green-500",
    },
    {
      key: "failed",
      labelKey: "student.failed",
      Icon: IconX,
      color: "text-red-500",
    },
    {
      key: "passRate",
      labelKey: "student.passRate",
      Icon: IconChart,
      color: "text-amber-500",
      suffix: "%",
    },
    {
      key: "publishedResults",
      labelKey: "student.publishedResults",
      Icon: IconShare,
      color: "text-sky-500",
    },
  ];

  const featureCards = [
    {
      to: "/student/exams",
      titleKey: "student.featureTakeExams",
      descKey: "student.featureTakeExamsDesc",
      Icon: IconDocumentLarge,
      color: "text-blue-500",
    },
    {
      to: "/student/results",
      titleKey: "student.myResults",
      descKey: "student.featureMyResultsDesc",
      Icon: IconChartLarge,
      color: "text-violet-500",
    },
    {
      to: "/student/profile",
      titleKey: "common.profile",
      descKey: "student.featureProfileDesc",
      Icon: IconUserLarge,
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">
          {t("student.overview")}
        </h1>
        <div className="text-lms-primary/80">{t("admin.loadingStats")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">
          {t("student.overview")}
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
        {t("student.overview")}
      </h1>
      <p className="text-lms-primary/90 mb-8">{t("student.intro")}</p>

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

export default StudentDashboard;
