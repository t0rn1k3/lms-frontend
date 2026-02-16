import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const STUDENT_SIDEBAR_ITEMS = [
  { to: "/student", label: "Overview" },
  { to: "/student/exams", label: "My Exams" },
  { to: "/student/results", label: "My Results" },
  { to: "/student/profile", label: "Profile" },
];

function StudentLayout() {
  return (
    <DashboardLayout sidebarItems={STUDENT_SIDEBAR_ITEMS} title="Student">
      <Outlet />
    </DashboardLayout>
  );
}

export default StudentLayout;
