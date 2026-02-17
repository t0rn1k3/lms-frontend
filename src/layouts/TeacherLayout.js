import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "./DashboardLayout";

function TeacherLayout() {
  const { t } = useTranslation();
  const sidebarItems = [
    { to: "/teacher", label: t("teacher.overview") },
    { to: "/teacher/exams", label: t("teacher.exams") },
    { to: "/teacher/exam-results", label: t("teacher.examResults") },
    { to: "/teacher/profile", label: t("common.profile") },
  ];
  return (
    <DashboardLayout sidebarItems={sidebarItems} title={t("teacher.title")}>
      <Outlet />
    </DashboardLayout>
  );
}

export default TeacherLayout;
