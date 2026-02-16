import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const ADMIN_SIDEBAR_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/academic-years", label: "Academic Years" },
  { to: "/admin/academic-terms", label: "Academic Terms" },
  { to: "/admin/class-levels", label: "Class Levels" },
  { to: "/admin/programs", label: "Programs" },
  { to: "/admin/subjects", label: "Subjects" },
  { to: "/admin/year-groups", label: "Year Groups" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/students", label: "Students" },
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
