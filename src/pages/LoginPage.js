import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Login</h1>
        <p className="text-slate-600 mb-8">
          Sign in to access the Learning Management System
        </p>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@school.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-shadow"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="text-slate-700 hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
