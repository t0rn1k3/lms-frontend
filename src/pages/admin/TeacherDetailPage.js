import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { teacherService, academicService, getErrorMessage } from "../../api";

function TeacherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getRefId = (val) => (typeof val === "object" ? val?._id : val);

  const getProgramName = (id) => {
    if (!id) return "—";
    const p = programs.find((x) => x._id === id);
    return p?.name || id;
  };

  const getClassLevelName = (id) => {
    if (!id) return "—";
    const c = classLevels.find((x) => x._id === id);
    return c?.name || id;
  };

  const getAcademicYearName = (id) => {
    if (!id) return "—";
    const y = academicYears.find((x) => x._id === id);
    if (!y) return id;
    const from = y.fromYear ? new Date(y.fromYear).getFullYear() : "";
    const to = y.toYear ? new Date(y.toYear).getFullYear() : "";
    return y.name || (from && to ? `${from}-${to}` : id);
  };

  const getSubjectName = (id) => {
    if (!id) return "—";
    const s = subjects.find((x) => x._id === id);
    return s?.name || id;
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [tRes, pRes, cRes, aRes, sRes] = await Promise.all([
          teacherService.getOne(id),
          academicService.getPrograms(),
          academicService.getClassLevels(),
          academicService.getAcademicYears(),
          academicService.getSubjects(),
        ]);
        setTeacher(tRes.data?.data ?? tRes.data);
        setPrograms(pRes.data?.data || []);
        setClassLevels(cRes.data?.data || []);
        setAcademicYears(aRes.data?.data || []);
        setSubjects(sRes.data?.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }
  if (!teacher) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/teachers"
          className="text-slate-600 hover:text-slate-800"
        >
          ← Back to Teachers
        </Link>
        <button
          onClick={() => navigate("/admin/teachers", { state: { editId: id } })}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Edit
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">{teacher.name}</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-500">Email</span>
            <p className="font-medium">{teacher.email}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Teacher ID</span>
            <p className="font-medium">{teacher.teacherId || "—"}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Program</span>
            <p className="font-medium">
              {getProgramName(getRefId(teacher.program))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Class Level</span>
            <p className="font-medium">
              {getClassLevelName(getRefId(teacher.classLevel))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Academic Year</span>
            <p className="font-medium">
              {getAcademicYearName(getRefId(teacher.academicYear))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Subject</span>
            <p className="font-medium">
              {getSubjectName(getRefId(teacher.subject))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Status</span>
            <p className="font-medium">
              {teacher.isWithdrawn
                ? "Withdrawn"
                : teacher.isSuspended
                  ? "Suspended"
                  : "Active"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetailPage;
