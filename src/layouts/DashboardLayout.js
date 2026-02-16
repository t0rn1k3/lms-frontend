import { Outlet, Link, useLocation } from "react-router-dom";

/**
 * Reusable dashboard layout with sidebar.
 * @param {object} props
 * @param {Array<{ to: string, label: string, icon?: string }>} props.sidebarItems
 * @param {string} props.title - Dashboard title
 */
function DashboardLayout({ sidebarItems, title }) {
  const location = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      location.pathname === path || location.pathname.startsWith(path + "/")
        ? "bg-slate-700 text-white"
        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
    }`;

  return (
    <div className="flex gap-8">
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="px-4 py-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </h2>
          <nav className="mt-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={linkClass(item.to)}
              >
                {item.icon && (
                  <span className="text-slate-400">{item.icon}</span>
                )}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
