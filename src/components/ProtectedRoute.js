import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Protects routes from unauthenticated users.
 * @param {object} props
 * @param {React.ReactNode} props.children - Content to render when allowed
 * @param {string} [props.requiredRole] - If set, user must have this role (admin|teacher|student)
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
