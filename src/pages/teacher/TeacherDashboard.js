import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { examService, getErrorMessage } from "../../api";

function TeacherDashboard() {
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
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Overview</h1>
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Overview</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Overview</h1>
      <p className="text-slate-600 mb-8">
        Create exams, add questions, and manage your profile.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/teacher/exams"
          className="block p-5 rounded-xl border-2 bg-slate-100 border-slate-300 text-slate-800 hover:opacity-90 transition-opacity"
        >
          <div className="text-2xl font-bold">{exams.length}</div>
          <div className="text-sm font-medium opacity-90">Exams</div>
        </Link>
        <Link
          to="/teacher/exams"
          className="block p-5 rounded-xl border-2 bg-emerald-50 border-emerald-200 text-emerald-800 hover:opacity-90 transition-opacity"
        >
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <div className="text-sm font-medium opacity-90">Total Questions</div>
        </Link>
      </div>
    </div>
  );
}

export default TeacherDashboard;
