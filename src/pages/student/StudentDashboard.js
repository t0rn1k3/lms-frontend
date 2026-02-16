import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentService, examResultService, getErrorMessage } from "../../api";
import { PageLoader, ErrorMessage } from "../../components";

function StudentDashboard() {
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
    return <PageLoader message="Loading dashboard..." />;
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
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Welcome, {studentProfile.name || "Student"}
      </h1>
      <p className="text-slate-600 mb-8">
        Take exams, view your results, and manage your profile from the sidebar.
      </p>

      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500 mb-1">
            Available Exams
          </h2>
          <p className="text-2xl font-bold text-slate-800">{availableCount}</p>
          <Link
            to="/student/exams"
            className="mt-2 text-sm text-slate-600 hover:text-slate-800"
          >
            Take exam →
          </Link>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500 mb-1">
            Exams Taken
          </h2>
          <p className="text-2xl font-bold text-slate-800">{results.length}</p>
          <Link
            to="/student/results"
            className="mt-2 text-sm text-slate-600 hover:text-slate-800"
          >
            View results →
          </Link>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500 mb-1">Passed</h2>
          <p className="text-2xl font-bold text-green-700">{passed}</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500 mb-1">
            Latest Result
          </h2>
          {latestResult ? (
            <>
              <p className="text-lg font-semibold text-slate-800">
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
                  className="mt-2 text-sm text-slate-600 hover:text-slate-800 inline-block"
                >
                  View details →
                </Link>
              )}
            </>
          ) : (
            <p className="text-slate-500">No exams taken yet</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/student/exams"
          className="px-5 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium"
        >
          My Exams
        </Link>
        <Link
          to="/student/profile"
          className="px-5 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
        >
          Profile
        </Link>
      </div>
    </div>
  );
}

export default StudentDashboard;
