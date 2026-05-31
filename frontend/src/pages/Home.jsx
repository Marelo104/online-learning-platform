import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCourseStore } from "../store/courseStore.js";
import { useAuthStore } from "../store/authStore.js";
import { GraduationCap, Users, BookOpen, Star, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "Web Dev", icon: "💻", value: "web-dev" },
  { name: "Mobile Dev", icon: "📱", value: "mobile-dev" },
  { name: "Data Science", icon: "📊", value: "data-science" },
  { name: "Design", icon: "🎨", value: "design" },
  { name: "Business", icon: "💼", value: "business" },
  { name: "Other", icon: "🔮", value: "other" },
];

const bgColors = [
  "from-emerald-900 to-emerald-950",
  "from-blue-900 to-blue-950",
  "from-purple-900 to-purple-950",
  "from-orange-900 to-orange-950",
  "from-pink-900 to-pink-950",
  "from-cyan-900 to-cyan-950",
];

const Home = () => {
  const { courses, fetchCourses, loading } = useCourseStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden px-4 py-16 sm:py-24 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-150 h-72 sm:h-150 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-xs text-emerald-500 font-semibold mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            #1 Online Learning Platform
          </div>

          {/* responsive heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Learn Without<br />
            <span className="text-emerald-500">Limits</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Access thousands of courses taught by expert instructors.
            Build real skills for your career.
          </p>

          {/* stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold rounded-xl px-6 py-3 hover:bg-emerald-600 transition-all hover:scale-105"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4" />
            </button>
            {(!user || user.role === "student") && (
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/6 border border-white/10 text-white font-semibold rounded-xl px-6 py-3 hover:bg-white/10 transition-all"
              >
                Start Teaching
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="border-y border-gray-800 mx-4 sm:mx-8">
        <div className="max-w-4xl mx-auto py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <BookOpen className="w-5 h-5" />, num: "10K+", label: "Courses" },
            { icon: <Users className="w-5 h-5" />, num: "50K+", label: "Students" },
            { icon: <GraduationCap className="w-5 h-5" />, num: "500+", label: "Instructors" },
            { icon: <Star className="w-5 h-5" />, num: "4.8★", label: "Avg Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex items-center justify-center gap-2 text-emerald-500 mb-1">
                {stat.icon}
                <span className="text-xl sm:text-2xl font-extrabold">{stat.num}</span>
              </div>
              <div className="text-gray-500 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-5">Browse Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => navigate(`/courses?category=${cat.value}`)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 text-center hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{cat.icon}</div>
              <div className="text-xs font-semibold text-gray-300 group-hover:text-emerald-500 transition-colors">
                {cat.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── FEATURED COURSES ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl sm:text-2xl font-bold">Featured Courses</h2>
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-1 text-emerald-500 text-sm font-semibold hover:text-emerald-400 transition-colors"
          >
            See all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500">No courses available yet</p>
          </div>
        )}

        {/* responsive grid — 1 col mobile, 2 tablet, 3 laptop, 4 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {courses.slice(0, 8).map((course, i) => (
            <div
              key={course._id}
              onClick={() => navigate(`/courses/${course._id}`)}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-500/30 hover:-translate-y-1 transition-all"
            >
              <div className={`w-full h-32 sm:h-36 bg-linear-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center text-4xl relative overflow-hidden`}>
                {course.thumbnail
                  ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                  : "📚"
                }
                {course.price === 0 && (
                  <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
                  {course.category?.replace("-", " ")}
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                    {course.instructor?.avatar
                      ? <img src={course.instructor.avatar} className="w-full h-full object-cover" />
                      : course.instructor?.name?.charAt(0)
                    }
                  </div>
                  <span className="text-xs text-gray-500 truncate">{course.instructor?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-emerald-500">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full capitalize">
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    {/* ── CTA BANNER ── */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-linear-to-r from-emerald-900/50 to-emerald-950 border border-emerald-500/20 rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4 relative">
              Ready to start learning?
            </h2>
            <p className="text-gray-400 mb-8 relative">
              Join thousands of students already learning on Learnify
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all relative"
            >
              Get Started — It's Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;