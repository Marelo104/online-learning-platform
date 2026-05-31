import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useState } from "react";
import { LogOut, Menu, X, GraduationCap, Search } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/courses?search=${search}`);
      setSearch("");
    }
  };

  // highlight active link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Learn<span className="text-emerald-500">ify</span>
            </span>
          </Link>

          {/* center — nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive("/")
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
            >
              Home
            </Link>
            <Link
              to="/courses"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive("/courses")
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
            >
              Courses
            </Link>

            {/* student dashboard */}
            {user && user.role === "student" && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive("/dashboard")
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
              >
                My Learning
              </Link>
            )}

            {/* instructor dashboard */}
            {user && (user.role === "instructor" || user.role === "admin") && (
              <Link
                to="/instructor"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive("/instructor")
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
              >
                Instructor
              </Link>
            )}

            {/* admin dashboard */}
            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive("/admin")
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* right side */}
          <div className="hidden md:flex items-center gap-3">

            {/* search bar */}
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 focus-within:border-emerald-500 transition-all">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search courses..."
                className="bg-transparent outline-none text-white text-sm placeholder-gray-500 w-40"
              />
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {/* role badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${user.role === "admin"
                    ? "bg-purple-500/15 border border-purple-500/30 text-purple-400"
                    : user.role === "instructor"
                    ? "bg-blue-500/15 border border-blue-500/30 text-blue-400"
                    : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {user.role}
                </span>

                {/* avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} className="w-full h-full object-cover" />
                    : <span className="text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>

                {/* logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border border-gray-700 text-gray-400 px-3 py-1.5 rounded-full text-sm hover:border-red-500 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 flex flex-col gap-2">
            <Link to="/" onClick={() => setMenuOpen(false)}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
              Home
            </Link>
            <Link to="/courses" onClick={() => setMenuOpen(false)}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
              Courses
            </Link>

            {user && user.role === "student" && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
                My Learning
              </Link>
            )}

            {user && (user.role === "instructor" || user.role === "admin") && (
              <Link to="/instructor" onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
                Instructor Dashboard
              </Link>
            )}

            {user && user.role === "admin" && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
                Admin Dashboard
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="text-left text-red-400 px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2 px-4 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="text-center border border-gray-700 text-gray-400 py-2 rounded-lg text-sm">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="text-center bg-emerald-500 text-white py-2 rounded-lg text-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;