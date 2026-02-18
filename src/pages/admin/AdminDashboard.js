import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  academicService,
  teacherService,
  studentService,
  adminService,
  questionService,
  getErrorMessage,
} from "../../api";

// Base size is merged so parent's className (color etc.) doesn't override it.
// Change "w-8 h-8" here to control KPI icon size.
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
const IconPeople = ({ className = "" }) => (
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
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
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
const IconCalendar = ({ className = "" }) => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
const IconBook = ({ className = "" }) => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);
const FEATURE_ICON_SIZE = "w-12 h-12";
const IconPeopleLarge = ({ className = "" }) => (
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
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
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

function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    availableExams: 0,
    totalStudents: 0,
    totalTeachers: 0,
    academicYears: 0,
    totalQuestions: 0,
    examResults: 0,
    passRate: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [
          years,
          teachers,
          students,
          exams,
          examResultsRes,
          questionsRes,
          programs,
        ] = await Promise.all([
          academicService.getAcademicYears(),
          teacherService.list({ limit: 9999 }),
          studentService.list(),
          adminService.getExams().catch(() => ({ data: { data: [] } })),
          adminService.getExamResults().catch(() => ({ data: { data: [] } })),
          questionService.list().catch(() => ({ data: { data: [] } })),
          academicService.getPrograms(),
        ]);

        const yearsData = years.data?.data ?? [];
        const teachersData = teachers.data?.data ?? [];
        const teachersTotal =
          teachers.data?.totalTeachers ?? teachersData?.length ?? 0;
        const studentsData = students.data?.data ?? [];
        const examsData = exams.data?.data ?? exams.data ?? [];
        const resultsData =
          examResultsRes.data?.data ?? examResultsRes.data ?? [];
        const questionsData =
          questionsRes.data?.data ?? questionsRes.data ?? [];
        const programsData = programs.data?.data ?? [];

        const passed = resultsData.filter((r) => r.status === "Passed").length;
        const passRate =
          resultsData.length > 0
            ? Math.round((passed / resultsData.length) * 100)
            : 0;

        setStats({
          availableExams: Array.isArray(examsData) ? examsData.length : 0,
          totalStudents: Array.isArray(studentsData) ? studentsData.length : 0,
          totalTeachers: teachersTotal,
          academicYears: yearsData.length,
          totalQuestions: Array.isArray(questionsData)
            ? questionsData.length
            : 0,
          examResults: Array.isArray(resultsData) ? resultsData.length : 0,
          passRate,
          activeCourses: programsData.length,
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
      labelKey: "admin.availableExams",
      Icon: IconDocument,
      color: "text-blue-500",
    },
    {
      key: "totalStudents",
      labelKey: "admin.totalStudents",
      Icon: IconPeople,
      color: "text-green-500",
    },
    {
      key: "totalTeachers",
      labelKey: "admin.totalTeachers",
      Icon: IconGraduation,
      color: "text-violet-500",
    },
    {
      key: "academicYears",
      labelKey: "admin.academicYears",
      Icon: IconCalendar,
      color: "text-amber-500",
    },
    {
      key: "totalQuestions",
      labelKey: "admin.totalQuestions",
      Icon: IconDocument,
      color: "text-sky-400",
    },
    {
      key: "examResults",
      labelKey: "admin.examResults",
      Icon: IconChart,
      color: "text-red-500",
    },
    {
      key: "passRate",
      labelKey: "admin.passRate",
      Icon: IconCheck,
      color: "text-green-500",
      suffix: "%",
    },
    {
      key: "activeCourses",
      labelKey: "admin.activeCourses",
      Icon: IconBook,
      color: "text-blue-500",
    },
  ];

  const featureCards = [
    {
      to: "/admin/students",
      titleKey: "admin.studentManagement",
      descKey: "admin.studentManagementDesc",
      Icon: IconPeopleLarge,
      color: "text-blue-500",
    },
    {
      to: "/admin/questions",
      titleKey: "admin.examCreation",
      descKey: "admin.examCreationDesc",
      Icon: IconDocumentLarge,
      color: "text-violet-500",
    },
    {
      to: "/admin/exam-results",
      titleKey: "admin.resultsAnalytics",
      descKey: "admin.resultsAnalyticsDesc",
      Icon: IconChartLarge,
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">
          {t("admin.overview")}
        </h1>
        <div className="text-lms-primary/80">{t("admin.loadingStats")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-lms-primary mb-6">
          {t("admin.overview")}
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
        {t("admin.overview")}
      </h1>
      <p className="text-lms-primary/90 mb-8">{t("admin.overviewIntro")}</p>

      {/* Top section: 8 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      {/* Bottom section: 3 feature cards */}
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

export default AdminDashboard;
