import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { studentService, academicService, getErrorMessage } from "../../api";

function StudentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
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

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [sRes, pRes, cRes, aRes] = await Promise.all([
          studentService.getOne(id),
          academicService.getPrograms(),
          academicService.getClassLevels(),
          academicService.getAcademicYears(),
        ]);
        setStudent(sRes.data?.data ?? sRes.data);
        setPrograms(pRes.data?.data || []);
        setClassLevels(cRes.data?.data || []);
        setAcademicYears(aRes.data?.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isActive = !student?.isWithdrawn && !student?.isSuspended && !student?.isGraduated;
  const isSuspended = student?.isSuspended;
  const isWithdrawn = student?.isWithdrawn;

  const handleUpdateStatus = async (payload) => {
    if (!student?._id) return;
    try {
      setUpdating(true);
      await studentService.update(student._id, payload);
      const { data } = await studentService.getOne(student._id);
      setStudent(data?.data ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdrawDelete = async () => {
    if (!student?._id) return;
    try {
      setUpdating(true);
      await studentService.withdraw(student._id);
      navigate("/admin/students");
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
  if (!student) return null;

  const levelIds = (student.classLevels || []).map((l) => getRefId(l));

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link
          to="/admin/students"
          className="text-slate-600 hover:text-slate-800"
        >
          {t("admin.backToStudents")}
        </Link>
        <button
          onClick={() => navigate("/admin/students", { state: { editId: id } })}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          {t("common.edit")}
        </button>
        {isActive && (
          <>
            <button
              onClick={() => {
                if (window.confirm(t("admin.confirmSuspendStudent"))) {
                  handleUpdateStatus({ isSuspended: true, isWithdrawn: false });
                }
              }}
              disabled={updating}
              className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50"
            >
              {t("admin.suspend")}
            </button>
            <button
              onClick={() => {
                if (window.confirm(t("admin.confirmWithdrawStudent"))) {
                  handleWithdrawDelete();
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
                handleUpdateStatus({ isSuspended: false, isWithdrawn: false });
              }
            }}
            disabled={updating}
            className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
          >
            {t("admin.reactivate")}
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">{student.name}</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-500">Email</span>
            <p className="font-medium">{student.email}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Student ID</span>
            <p className="font-medium">{student.studentId || "—"}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Program</span>
            <p className="font-medium">
              {getProgramName(getRefId(student.program))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Current Class Level</span>
            <p className="font-medium">
              {getClassLevelName(getRefId(student.currentClassLevel))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Academic Year</span>
            <p className="font-medium">
              {getAcademicYearName(getRefId(student.academicYear))}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">{t("common.status")}</span>
            <p className="font-medium">
              {student.isWithdrawn
                ? t("admin.withdrawn")
                : student.isSuspended
                  ? t("admin.suspended")
                  : student.isGraduated
                    ? t("admin.graduated")
                    : t("admin.active")}
            </p>
          </div>
          {levelIds.length > 0 && (
            <div className="col-span-2">
              <span className="text-sm text-slate-500">
                Class Levels (history)
              </span>
              <p className="font-medium">
                {levelIds.map((id) => getClassLevelName(id)).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPage;
