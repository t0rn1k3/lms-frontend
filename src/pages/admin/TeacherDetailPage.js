import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { teacherService, academicService, getErrorMessage } from "../../api";

function TeacherDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const isActive = !teacher?.isWithdrawn && !teacher?.isSuspended;
  const isSuspended = teacher?.isSuspended;
  const isWithdrawn = teacher?.isWithdrawn;

  const handleUpdateStatus = async (isSuspendedVal, isWithdrawnVal) => {
    if (!teacher?._id) return;
    try {
      setUpdating(true);
      await teacherService.update(teacher._id, {
        isSuspended: isSuspendedVal,
        isWithdrawn: isWithdrawnVal,
      });
      const { data } = await teacherService.getOne(teacher._id);
      setTeacher(data?.data ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">{t("common.loading")}</div>;
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
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link
          to="/admin/teachers"
          className="text-slate-600 hover:text-slate-800"
        >
          {t("admin.backToTeachers")}
        </Link>
        <button
          onClick={() => navigate("/admin/teachers", { state: { editId: id } })}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          {t("common.edit")}
        </button>
        {isActive && (
          <>
            <button
              onClick={() => {
                if (window.confirm(t("admin.confirmSuspendTeacher"))) {
                  handleUpdateStatus(true, false);
                }
              }}
              disabled={updating}
              className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50"
            >
              {t("admin.suspend")}
            </button>
            <button
              onClick={() => {
                if (window.confirm(t("admin.confirmWithdrawTeacher"))) {
                  handleUpdateStatus(false, true);
                }
              }}
              disabled={updating}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {t("admin.withdraw")}
            </button>
          </>
        )}
        {(isSuspended || isWithdrawn) && (
          <button
            onClick={() => {
              if (window.confirm(t("admin.confirmReactivate"))) {
                handleUpdateStatus(false, false);
              }
            }}
            disabled={updating}
            className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
          >
            {t("admin.reactivate")}
          </button>
        )}
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
            <span className="text-sm text-slate-500">{t("common.status")}</span>
            <p className="font-medium">
              {teacher.isWithdrawn
                ? t("admin.withdrawn")
                : teacher.isSuspended
                  ? t("admin.suspended")
                  : t("admin.active")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetailPage;
