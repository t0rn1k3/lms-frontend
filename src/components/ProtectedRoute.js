import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Protects routes: requires login (token) and optionally a specific role.
 * Backend mapping: isLogin + isAdmin → admin token, isTeacherLogin → teacher token, etc.
 * Token is obtained from role-specific login (POST /admins/login, etc.) and sent via apiClient.
 */
function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
