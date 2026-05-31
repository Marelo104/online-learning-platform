import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCourseStore } from "../store/courseStore.js";
import { Search, BookOpen, Star, Users, X } from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Web Dev", value: "web-dev" },
  { label: "Mobile Dev", value: "mobile-dev" },
  { label: "Data Science", value: "data-science" },
  { label: "Design", value: "design" },
  { label: "Business", value: "business" },
  { label: "Other", value: "other" },
];

const LEVELS = [
  { label: "All Levels", value: "" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const PRICES = [
  { label: "All", value: "" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

const bgColors = [
  "from-emerald-900/50 to-emerald-950",
  "from-blue-900/50 to-blue-950",
  "from-purple-900/50 to-purple-950",
  "from-orange-900/50 to-orange-950",
  "from-red-900/50 to-red-950",
];

const Courses = () => {
  const { courses, fetchCourses, loading } = useCourseStore();

  // useSearchParams reads query params from the URL
  // e.g /courses?category=web-dev&search=react
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [activeLevel, setActiveLevel] = useState("");
  const [activePrice, setActivePrice] = useState("");

  // fetch courses whenever filters change
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (activeCategory) params.category = activeCategory;
    if (activeLevel) params.level = activeLevel;
    if (activePrice === "free") params.maxPrice = 0;
    if (activePrice === "paid") params.minPrice = 1;

    fetchCourses(params);
  }, [activeCategory, activeLevel, activePrice, fetchCourses, search]);

  // search on Enter key
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      fetchCourses({ search, category: activeCategory, level: activeLevel });
    }
  };

  // clear all filters
  const clearFilters = () => {
    setSearch("");
    setActiveCategory("");
    setActiveLevel("");
    setActivePrice("");
    fetchCourses();
  };

  const hasFilters = search || activeCategory || activeLevel || activePrice;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">All Courses</h1>
          <p className="text-gray-400 text-sm">
            {loading ? "Loading..." : `${courses.length} courses available`}
          </p>
        </div>

        {/* search bar */}
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 mb-6 focus-within:border-emerald-500 transition-all max-w-xl">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search courses, instructors..."
            className="bg-transparent outline-none text-white text-sm placeholder-gray-600 w-full"
          />
          {search && (
            <button onClick={() => { setSearch(""); fetchCourses(); }}>
              <X className="w-4 h-4 text-gray-500 hover:text-white" />
            </button>
          )}
        </div>

        {/* filter row */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">

          {/* category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === cat.value
                    ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                    : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* divider */}
          <div className="h-6 w-px bg-gray-800 hidden md:block" />

          {/* level filter */}
          <select
            value={activeLevel}
            onChange={(e) => setActiveLevel(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-400 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value} className="bg-gray-900">
                {l.label}
              </option>
            ))}
          </select>

          {/* price filter */}
          <select
            value={activePrice}
            onChange={(e) => setActivePrice(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-400 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all"
          >
            {PRICES.map((p) => (
              <option key={p.value} value={p.value} className="bg-gray-900">
                {p.label}
              </option>
            ))}
          </select>

          {/* clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-red-400 text-sm hover:text-red-300 transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* empty state */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white font-bold text-xl mb-2">No courses found</h3>
            <p className="text-gray-500 text-sm mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* courses grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, i) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:-translate-y-1 transition-all group"
              >
                {/* thumbnail */}
                <div className={`w-full h-40 bg-linear-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center relative overflow-hidden`}>
                  {course.thumbnail
                    ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                    : <BookOpen className="w-10 h-10 text-white/20" />
                  }

                  {/* free badge */}
                  {course.price === 0 && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                      FREE
                    </span>
                  )}

                  {/* level badge */}
                  <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg capitalize">
                    {course.level}
                  </span>
                </div>

                <div className="p-4">
                  {/* category */}
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    {course.category?.replace("-", " ")}
                  </span>

                  {/* title */}
                  <h3 className="text-white font-semibold text-sm mt-1 mb-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  {/* instructor */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {course.instructor?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-500 text-xs truncate">
                      {course.instructor?.name}
                    </span>
                  </div>

                  {/* stats row */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.enrolledStudents?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.lessons?.length || 0} lessons
                    </span>
                  </div>

                  {/* price + rating */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                    <span className={`font-bold ${course.price === 0 ? "text-emerald-500" : "text-white"}`}>
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-400">{course.rating || "New"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;