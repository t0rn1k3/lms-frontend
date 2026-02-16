import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const ADMIN_SIDEBAR_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/academic-setup", label: "Academic Setup" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/exam-results", label: "Exam Results" },
  { to: "/admin/questions", label: "Questions" },
  { to: "/admin/profile", label: "Profile" },
];

function AdminLayout() {
  return (
    <DashboardLayout sidebarItems={ADMIN_SIDEBAR_ITEMS} title="Admin">
      <Outlet />
    </DashboardLayout>
  );
}

export default AdminLayout;
