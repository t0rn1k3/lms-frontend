import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="text-center py-12 ">
      <h1 className="text-4xl font-bold text-red-800 mb-4 tracking-tight">
        LMS - School System
      </h1>
      <p className="text-lg text-slate-600 max-w-xl mx-auto">
        Welcome to the Learning Management System. Manage students, teachers,
        exams, and academic records in one place.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
