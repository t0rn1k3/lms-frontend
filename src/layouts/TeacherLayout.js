import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const TEACHER_SIDEBAR_ITEMS = [
  { to: "/teacher", label: "Overview" },
  { to: "/teacher/exams", label: "Exams" },
  { to: "/teacher/profile", label: "Profile" },
];

function TeacherLayout() {
  return (
    <DashboardLayout sidebarItems={TEACHER_SIDEBAR_ITEMS} title="Teacher">
      <Outlet />
    </DashboardLayout>
  );
}

export default TeacherLayout;
