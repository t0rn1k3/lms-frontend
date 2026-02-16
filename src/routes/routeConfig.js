/**
 * Route configuration: public vs protected per role.
 *
 * Public: /, /login, /login/:role
 *
 * Protected (require login + role-specific token):
 *   - admin:   /admin/*  → POST /admins/login → isLogin + isAdmin
 *   - teacher: /teacher/* → POST /teachers/login → isTeacherLogin
 *   - student: /student/* → POST /students/login → isStudentLogin
 */
export const PUBLIC_ROUTES = ["/", "/login"];

export const LOGIN_ROUTES = [
  "/login",
  "/login/admin",
  "/login/teacher",
  "/login/student",
];

/** Protected route prefixes per role - user must have matching role to access */
export const PROTECTED_ROUTES_BY_ROLE = {
  admin: ["/admin"],
  teacher: ["/teacher"],
  student: ["/student"],
};

/** Check if path requires a specific role */
export const getRequiredRoleForPath = (pathname) => {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/student")) return "student";
  return null;
};
