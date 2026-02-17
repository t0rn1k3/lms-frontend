import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { studentService, examResultService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage } from "../../components";

function StudentDashboard() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [profileRes, resultsRes, examsRes] = await Promise.all([
          studentService.getProfile(),
          examResultService.list(),
          studentService.getExams(),
        ]);
        setProfile(profileRes.data?.data ?? profileRes.data);
        setResults(resultsRes.data?.data ?? resultsRes.data ?? []);
        setExams(examsRes.data?.data ?? examsRes.data ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <PageLoader message={t("student.loadingDashboard")} />;
  }

  const studentProfile = profile?.studentProfile ?? profile ?? {};
  const passed = results.filter((r) => r.status === "Passed").length;
  const latestResult = results[0]; // sorted by createdAt -1
  const takenExamIds = results.map((r) =>
    typeof r.exam === "object" ? r.exam?._id : r.exam
  );
  const availableCount = exams.filter(
    (e) => !takenExamIds.includes(e._id)
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-lms-primary mb-2">
        {t("student.welcome")}, {studentProfile.name || t("roles.student")}
      </h1>
      <p className="text-lms-primary/90 mb-8">
        {t("student.intro")}
      </p>

      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="p-6 bg-white rounded-xl border border-lms-cream shadow-sm">
          <h2 className="text-sm font-medium text-lms-primary/80 mb-1">
            {t("student.availableExams")}
          </h2>
          <p className="text-2xl font-bold text-lms-primary">{availableCount}</p>
          <Link
            to="/student/exams"
            className="mt-2 text-sm text-lms-primary/90 hover:text-lms-primary"
          >
            {t("student.takeExam")}
          </Link>
        </div>
        <div className="p-6 bg-white rounded-xl border border-lms-cream shadow-sm">
          <h2 className="text-sm font-medium text-lms-primary/80 mb-1">
            {t("student.examsTaken")}
          </h2>
          <p className="text-2xl font-bold text-lms-primary">{results.length}</p>
          <Link
            to="/student/results"
            className="mt-2 text-sm text-lms-primary/90 hover:text-lms-primary"
          >
            {t("student.viewResults")}
          </Link>
        </div>
        <div className="p-6 bg-white rounded-xl border border-lms-cream shadow-sm">
          <h2 className="text-sm font-medium text-lms-primary/80 mb-1">{t("student.passed")}</h2>
          <p className="text-2xl font-bold text-green-700">{passed}</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-lms-cream shadow-sm">
          <h2 className="text-sm font-medium text-lms-primary/80 mb-1">
            {t("student.latestResult")}
          </h2>
          {latestResult ? (
            <>
              <p className="text-lg font-semibold text-lms-primary">
                {typeof latestResult.exam === "object"
                  ? latestResult.exam?.name
                  : "—"}
              </p>
              <p
                className={`text-sm ${
                  latestResult.status === "Passed"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {latestResult.status} ({latestResult.grade}%)
              </p>
              {latestResult.isPublished && (
                <Link
                  to={`/student/results/${latestResult._id}`}
                  className="mt-2 text-sm text-lms-primary/90 hover:text-lms-primary inline-block"
                >
                  {t("student.viewDetails")}
                </Link>
              )}
            </>
          ) : (
            <p className="text-lms-primary/80">{t("student.noExamsYet")}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/student/exams"
          className="px-5 py-3 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark font-medium"
        >
          {t("student.myExams")}
        </Link>
        <Link
          to="/student/profile"
          className="px-5 py-3 border border-lms-cream rounded-lg hover:bg-lms-cream/30 font-medium"
        >
          {t("common.profile")}
        </Link>
      </div>
    </div>
  );
}

export default StudentDashboard;
