import { Outlet, Link, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
      location.pathname === path
        ? "bg-slate-700 text-white"
        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <nav className="bg-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="text-xl font-bold text-white hover:text-slate-200 transition-colors"
            >
              LMS
            </Link>
            <div className="flex gap-2">
              <Link to="/" className={navLinkClass("/")}>
                Home
              </Link>
              <Link to="/login" className={navLinkClass("/login")}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
