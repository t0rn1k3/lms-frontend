import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * For public routes (e.g. login) - redirects to role dashboard if already logged in.
 */
function GuestRoute({ children }) {
  const { isLoggedIn, role } = useAuth();

  if (isLoggedIn) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
}

export default GuestRoute;
