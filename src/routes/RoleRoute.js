import ProtectedRoute from "../components/ProtectedRoute";

/**
 * Role-specific route wrappers.
 * AdminRoute, TeacherRoute, StudentRoute enforce role-based access.
 */
export function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export function TeacherRoute({ children }) {
  return <ProtectedRoute requiredRole="teacher">{children}</ProtectedRoute>;
}

export function StudentRoute({ children }) {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
}
