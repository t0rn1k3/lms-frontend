import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  academicService,
  teacherService,
  studentService,
  getErrorMessage,
} from "../../api";

function getStatCards(t) {
  return [
  {
    key: "academicYears",
    label: t("admin.academicYears"),
    to: "/admin/academic-setup",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  {
    key: "academicTerms",
    label: t("admin.academicTerms"),
    to: "/admin/academic-setup",
    color: "bg-amber-50 border-amber-200 text-amber-800",
  },
  {
    key: "classLevels",
    label: t("admin.classLevels"),
    to: "/admin/academic-setup",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  {
    key: "programs",
    label: t("admin.programs"),
    to: "/admin/academic-setup",
    color: "bg-violet-50 border-violet-200 text-violet-800",
  },
  {
    key: "subjects",
    label: t("admin.subjects"),
    to: "/admin/academic-setup",
    color: "bg-rose-50 border-rose-200 text-rose-800",
  },
  {
    key: "yearGroups",
    label: t("admin.yearGroups"),
    to: "/admin/academic-setup",
    color: "bg-cyan-50 border-cyan-200 text-cyan-800",
  },
  {
    key: "teachers",
    label: t("admin.teachers"),
    to: "/admin/teachers",
    color: "bg-slate-100 border-slate-300 text-slate-800",
  },
  {
    key: "students",
    label: t("admin.students"),
    to: "/admin/students",
    color: "bg-slate-100 border-slate-300 text-slate-800",
  },
];
}

function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [
          years,
          terms,
          levels,
          programs,
          subjects,
          yearGroups,
          teachers,
          students,
        ] = await Promise.all([
          academicService.getAcademicYears(),
          academicService.getAcademicTerms(),
          academicService.getClassLevels(),
          academicService.getPrograms(),
          academicService.getSubjects(),
          academicService.getYearGroups(),
          teacherService.list({ limit: 1 }),
          studentService.list(),
        ]);
        setStats({
          academicYears: years.data?.data?.length ?? 0,
          academicTerms: terms.data?.data?.length ?? 0,
          classLevels: levels.data?.data?.length ?? 0,
          programs: programs.data?.data?.length ?? 0,
          subjects: subjects.data?.data?.length ?? 0,
          yearGroups: yearGroups.data?.data?.length ?? 0,
          teachers:
            teachers.data?.totalTeachers ?? teachers.data?.data?.length ?? 0,
          students: students.data?.data?.length ?? 0,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">{t("admin.overview")}</h1>
        <div className="text-slate-500">{t("admin.loadingStats")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">{t("admin.overview")}</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{t("admin.overview")}</h1>
      <p className="text-slate-600 mb-8">
        {t("admin.overviewIntro")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getStatCards(t).map(({ key, label, to, color }) => (
          <Link
            key={key}
            to={to}
            className={`block p-5 rounded-xl border-2 ${color} hover:opacity-90 transition-opacity`}
          >
            <div className="text-2xl font-bold">{stats[key] ?? 0}</div>
            <div className="text-sm font-medium opacity-90">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
