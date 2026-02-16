export { AdminRoute, TeacherRoute, StudentRoute } from "./RoleRoute";
export { default as GuestRoute } from "./GuestRoute";
export {
  PUBLIC_ROUTES,
  LOGIN_ROUTES,
  PROTECTED_ROUTES_BY_ROLE,
  getRequiredRoleForPath,
} from "./routeConfig";
