import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "./DashboardLayout";

function StudentLayout() {
  const { t } = useTranslation();
  const sidebarItems = [
    { to: "/student", label: t("student.overview") },
    { to: "/student/exams", label: t("student.myExams") },
    { to: "/student/results", label: t("student.myResults") },
    { to: "/student/profile", label: t("common.profile") },
  ];
  return (
    <DashboardLayout sidebarItems={sidebarItems} title={t("student.title")}>
      <Outlet />
    </DashboardLayout>
  );
}

export default StudentLayout;
