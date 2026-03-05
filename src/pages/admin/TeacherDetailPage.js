import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { teacherService, academicService, moduleService, getErrorMessage } from "../../api";

function TeacherDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const getRefId = (val) =>
    typeof val === "object" ? (val?._id ?? val?.id) : val;

  const getProgramName = (idOrObj) => {
    if (!idOrObj) return "—";
    if (typeof idOrObj === "object" && idOrObj?.name) return idOrObj.name;
    const id = typeof idOrObj === "object" ? getRefId(idOrObj) : idOrObj;
    const p = programs.find((x) => (x._id || x.id) === id);
    return p?.name || id;
  };

  const getYearGroupName = (idOrObj) => {
    if (!idOrObj) return "—";
    if (typeof idOrObj === "object" && idOrObj?.name) return idOrObj.name;
    const id = typeof idOrObj === "object" ? getRefId(idOrObj) : idOrObj;
    const g = yearGroups.find((x) => (x._id || x.id) === id);
    return g?.name || id;
  };

  const getAcademicYearName = (id) => {
    if (!id) return "—";
    const y = academicYears.find((x) => x._id === id);
    if (!y) return id;
    const from = y.fromYear ? new Date(y.fromYear).getFullYear() : "";
    const to = y.toYear ? new Date(y.toYear).getFullYear() : "";
    return y.name || (from && to ? `${from}-${to}` : id);
  };

  const getModuleName = (id) => {
    if (!id) return "—";
    const m = modules.find((x) => x._id === id);
    return m?.name || id;
  };

  const formatProgramsDisplay = (item) => {
    const ids = (item.programs || [item.program]).filter(Boolean).map((p) => getRefId(p));
    if (ids.length === 0) return "—";
    return ids.map(getProgramName).join(", ");
  };

  const formatModulesDisplay = (item) => {
    const ids = (item.modules || [item.subject]).filter(Boolean).map((m) => getRefId(m));
    if (ids.length === 0) return "—";
    return ids.map(getModuleName).join(", ");
  };

  const formatYearGroupsDisplay = (item) => {
    const items = (item.yearGroups || [item.yearGroup]).filter(Boolean);
    if (items.length === 0) return "—";
    return items.map(getYearGroupName).join(", ");
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [tRes, pRes, gRes, aRes, mRes] = await Promise.all([
          teacherService.getOne(id),
          academicService.getPrograms(),
          academicService.getYearGroups(),
          academicService.getAcademicYears(),
          moduleService.list(),
        ]);
        setTeacher(tRes.data?.data ?? tRes.data);
        setPrograms(pRes.data?.data || []);
        setYearGroups(gRes.data?.data || []);
        setAcademicYears(aRes.data?.data || []);
        setModules(mRes.data?.data ?? mRes.data ?? []);
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

  const handleSuspend = async () => {
    if (!teacher?._id) return;
    try {
      setUpdating(true);
      await teacherService.suspend(teacher._id);
      const { data } = await teacherService.getOne(teacher._id);
      setTeacher(data?.data ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!teacher?._id) return;
    try {
      setUpdating(true);
      await teacherService.unsuspend(teacher._id);
      const { data } = await teacherService.getOne(teacher._id);
      setTeacher(data?.data ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdrawDelete = async () => {
    if (!teacher?._id) return;
    try {
      setUpdating(true);
      await teacherService.withdraw(teacher._id);
      navigate("/admin/teachers");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-lms-primary/80">{t("common.loading")}</div>;
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
          className="text-lms-primary/90 hover:text-lms-primary"
        >
          {t("admin.backToTeachers")}
        </Link>
        <button
          onClick={() => navigate("/admin/teachers", { state: { editId: id } })}
          className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary-dark"
        >
          {t("common.edit")}
        </button>
        {isActive && (
          <>
            <button
              onClick={() => {
                if (window.confirm(t("admin.confirmSuspendTeacher"))) {
                  handleSuspend();
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
                  handleUnsuspend();
                }
            }}
            disabled={updating}
            className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
          >
            {t("admin.reactivate")}
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold text-lms-primary mb-6">{teacher.name}</h1>

      <div className="bg-white rounded-xl border border-lms-cream p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-lms-primary/80">Email</span>
            <p className="font-medium">{teacher.email}</p>
          </div>
          <div>
            <span className="text-sm text-lms-primary/80">Teacher ID</span>
            <p className="font-medium">{teacher.teacherId || "—"}</p>
          </div>
          <div>
            <span className="text-sm text-lms-primary/80">{t("admin.programs")}</span>
            <p className="font-medium">{formatProgramsDisplay(teacher)}</p>
          </div>
          <div>
            <span className="text-sm text-lms-primary/80">{t("admin.yearGroups")}</span>
            <p className="font-medium">{formatYearGroupsDisplay(teacher)}</p>
          </div>
          <div>
            <span className="text-sm text-lms-primary/80">{t("admin.academicYearLabel")}</span>
            <p className="font-medium">
              {getAcademicYearName(getRefId(teacher.academicYear))}
            </p>
          </div>
          <div>
            <span className="text-sm text-lms-primary/80">{t("admin.modules")}</span>
            <p className="font-medium">{formatModulesDisplay(teacher)}</p>
          </div>
          <div>
            <span className="text-sm text-lms-primary/80">{t("common.status")}</span>
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
