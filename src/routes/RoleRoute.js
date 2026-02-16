import ProtectedRoute from "../components/ProtectedRoute";

/**
 * Role-specific route wrappers.
 * Admin routes → require admin token (from POST /admins/login), backend uses isLogin + isAdmin.
 */
export function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

/** Teacher routes → require teacher token (from POST /teachers/login), backend uses isTeacherLogin */
export function TeacherRoute({ children }) {
  return <ProtectedRoute requiredRole="teacher">{children}</ProtectedRoute>;
}

/** Student routes → require student token (from POST /students/login), backend uses isStudentLogin */
export function StudentRoute({ children }) {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
}
