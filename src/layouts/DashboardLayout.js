import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

/**
 * Reusable dashboard layout with responsive sidebar.
 * On mobile: collapsible sidebar with overlay.
 * @param {object} props
 * @param {Array<{ to: string, label: string, icon?: string }>} props.sidebarItems
 * @param {string} props.title - Dashboard title
 */
function DashboardLayout({ sidebarItems, title }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      location.pathname === path || location.pathname.startsWith(path + "/")
        ? "bg-lms-primary text-white"
        : "text-lms-primary hover:bg-lms-cream/70 hover:text-lms-primary"
    }`;

  const SidebarContent = () => (
    <>
      <h2 className="px-4 py-2 text-sm font-semibold text-lms-primary/80 uppercase tracking-wider">
        {title}
      </h2>
      <nav className="mt-2 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={linkClass(item.to)}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon && (
              <span className="text-lms-primary/70">{item.icon}</span>
            )}
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Mobile: hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-lms-primary text-white shadow-lg flex items-center justify-center"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar: hidden on mobile unless open, below header (top-16) */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static top-16 lg:top-auto bottom-0 lg:inset-y-0 left-0 z-40 lg:z-auto w-72 lg:w-64 max-w-[85vw] lg:max-w-none flex-shrink-0 bg-white lg:bg-transparent border-r border-lms-cream lg:border-r-0 shadow-xl lg:shadow-none transition-transform duration-200 ease-out`}
      >
        <div className="lg:sticky lg:top-20 bg-white rounded-xl border border-lms-cream shadow-sm p-4 m-4 lg:m-0">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
