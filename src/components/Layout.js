import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout, isLoggedIn } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
      location.pathname === path
        ? "bg-slate-700 text-white"
        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
    }`;

  const displayName = user?.name || user?.email || role?.charAt(0).toUpperCase() + role?.slice(1) || "User";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="text-xl font-bold text-white hover:text-slate-200 transition-colors"
              >
                LMS
              </Link>
              <nav className="flex gap-2 items-center">
                <Link to="/" className={navLinkClass("/")}>
                  Home
                </Link>
                {isLoggedIn && (
                  <Link
                    to={`/${role}`}
                    className={navLinkClass(`/${role}`)}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-lg shadow-lg border border-slate-200">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {user?.email || "—"}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {role}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          navigate("/");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
