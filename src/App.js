import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Layout from "./components/Layout";
import { AdminRoute, TeacherRoute, StudentRoute, GuestRoute } from "./routes";
import { AdminLayout, TeacherLayout, StudentLayout } from "./layouts";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AcademicYearsPage from "./pages/admin/AcademicYearsPage";
import AcademicTermsPage from "./pages/admin/AcademicTermsPage";
import ClassLevelsPage from "./pages/admin/ClassLevelsPage";
import ProgramsPage from "./pages/admin/ProgramsPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import YearGroupsPage from "./pages/admin/YearGroupsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import StudentsPage from "./pages/admin/StudentsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AcademicSetupPage from "./pages/admin/AcademicSetupPage";
import TeacherDetailPage from "./pages/admin/TeacherDetailPage";
import StudentDetailPage from "./pages/admin/StudentDetailPage";
import ExamResultsPage from "./pages/admin/ExamResultsPage";
import QuestionsPage from "./pages/admin/QuestionsPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherExamsPage from "./pages/teacher/ExamsPage";
import TeacherProfilePage from "./pages/teacher/ProfilePage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentExamsPage from "./pages/student/ExamsPage";
import StudentResultsPage from "./pages/student/ResultsPage";
import StudentProfilePage from "./pages/student/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route
            path="login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="login/:role"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* Protected: Admin routes */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="academic-setup" element={<AcademicSetupPage />} />
            <Route path="academic-years" element={<AcademicYearsPage />} />
            <Route path="academic-terms" element={<AcademicTermsPage />} />
            <Route path="class-levels" element={<ClassLevelsPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="year-groups" element={<YearGroupsPage />} />
            <Route path="teachers/:id" element={<TeacherDetailPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="exam-results" element={<ExamResultsPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>

          {/* Protected: Teacher routes */}
          <Route
            path="teacher"
            element={
              <TeacherRoute>
                <TeacherLayout />
              </TeacherRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="exams" element={<TeacherExamsPage />} />
            <Route path="profile" element={<TeacherProfilePage />} />
          </Route>

          {/* Protected: Student routes */}
          <Route
            path="student"
            element={
              <StudentRoute>
                <StudentLayout />
              </StudentRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="exams" element={<StudentExamsPage />} />
            <Route path="results" element={<StudentResultsPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
