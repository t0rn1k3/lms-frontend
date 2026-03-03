import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "./DashboardLayout";

function AdminLayout() {
  const { t } = useTranslation();
  const sidebarItems = [
    { to: "/admin", label: t("admin.overview") },
    { to: "/admin/academic-setup", label: t("admin.academicSetup") },
    { to: "/admin/teachers", label: t("admin.teachers") },
    { to: "/admin/students", label: t("admin.students") },
    { to: "/admin/exam-results", label: t("admin.examResults") },
    { to: "/admin/questions", label: t("admin.questions") },
    { to: "/admin/profile", label: t("common.profile") },
  ];
  return (
    <DashboardLayout sidebarItems={sidebarItems} title={t("admin.title")}>
      <Outlet />
    </DashboardLayout>
  );
}

export default AdminLayout;
