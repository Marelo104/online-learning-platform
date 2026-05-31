import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Trash2, Shield, ShieldOff, Search, X,
  BarChart3, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import api from "../services/api.js";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);



useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, coursesRes, paymentsRes] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/users"),
                api.get("/admin/courses"),
                api.get("/admin/payments"),
            ]);
            setStats(statsRes.data.stats);
            setUsers(usersRes.data.users);
            setCourses(coursesRes.data.courses);
            setPayments(paymentsRes.data.payments);
        } catch (error) {
            toast.error("Failed to load dashboard data");
            console.log("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
  }, []);

  const fetchUserDetail = async (userId) => {
    setUserDetailLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setUserDetail(response.data);
      setSelectedUser(userId);
    } catch (error) {
      toast.error("Failed to load user details", error);
    } finally {
      setUserDetailLoading(false);
    }
};

const handleToggleRole = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/role`);

    // ✅ update the specific user in the array with full updated user
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? response.data.user : u
      )
    );

    toast.success(response.data.message);
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to change role");
  }
};

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Course deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  // filter users by search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });   

  // format monthly revenue for chart
  const chartData = stats?.monthlyRevenue?.map((item) => ({
    month: new Date(2024, item._id.month - 1).toLocaleString("default", { month: "short" }),
    revenue: item.revenue,
    enrollments: item.count,
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Platform overview and management
          </p>
        </div>

        {/* tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit mb-8">
          {["overview", "users", "courses", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${activeTab === tab
                  ? "bg-emerald-500 text-white font-bold"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            {/* stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                {
                  label: "Total Users",
                  value: stats?.totalUsers || 0,
                  icon: Users,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Total Courses",
                  value: stats?.totalCourses || 0,
                  icon: BookOpen,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Enrollments",
                  value: stats?.totalEnrollments || 0,
                  icon: TrendingUp,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                },
                {
                  label: "Instructors",
                  value: stats?.totalInstructors || 0,
                  icon: Shield,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                },
                {
                  label: "Revenue",
                  value: `$${stats?.totalRevenue?.toFixed(0) || 0}`,
                  icon: DollarSign,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                >
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
                  <div className="text-gray-500 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* charts */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* revenue chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Monthly Revenue
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#111827",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* enrollments chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Monthly Enrollments
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#111827",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="enrollments"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ fill: "#60a5fa", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* recent users + recent enrollments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* recent users */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Recent Users</h3>
                <div className="flex flex-col gap-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{u.name}</p>
                        <p className="text-gray-500 text-xs truncate">{u.email}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${u.role === "admin" ? "bg-purple-500/15 text-purple-400"
                          : u.role === "instructor" ? "bg-blue-500/15 text-blue-400"
                          : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* top courses */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Top Courses</h3>
                <div className="flex flex-col gap-3">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-900 to-emerald-950 flex items-center justify-center shrink-0 overflow-hidden">
                        {course.thumbnail
                          ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                          : <BookOpen className="w-4 h-4 text-white/30" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{course.title}</p>
                        <p className="text-gray-500 text-xs">
                          {course.enrolledStudents?.length || 0} students
                        </p>
                      </div>
                      <span className="text-emerald-500 text-sm font-bold shrink-0">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            {/* search + filter */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 flex-1 max-w-sm focus-within:border-emerald-500 transition-all">
                <Search className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="bg-transparent outline-none text-white text-sm placeholder-gray-600 w-full"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-gray-400 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 transition-all"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>

              <span className="text-gray-500 text-sm self-center">
                {filteredUsers.length} users
              </span>
            </div>

            {/* users table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">User</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Role</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Joined</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u._id || u.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-all"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                              {u.avatar
                                ? <img src={u.avatar} className="w-full h-full object-cover" />
                                : u.name?.charAt(0).toUpperCase()
                              }
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{u.name}</p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full
                            ${u.role === "admin" ? "bg-purple-500/15 text-purple-400"
                              : u.role === "instructor" ? "bg-blue-500/15 text-blue-400"
                              : "bg-emerald-500/15 text-emerald-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-xs">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A" }
                          </span> 
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* view button — new */}
                            <button
                              onClick={() => fetchUserDetail(u._id)}
                              className="flex items-center gap-1 text-xs border border-gray-700 text-gray-400 px-2.5 py-1.5 rounded-lg hover:border-emerald-500 hover:text-emerald-400 transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>

                            {/* existing toggle role button */}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleToggleRole(u._id, u.role)}
                                className="flex items-center gap-1 text-xs border border-gray-700 text-gray-400 px-2.5 py-1.5 rounded-lg hover:border-blue-500 hover:text-blue-400 transition-all"
                              >
                                {u.role === "student"
                                  ? <><Shield className="w-3 h-3" /> Make Instructor</>
                                  : <><ShieldOff className="w-3 h-3" /> Make Student</>
                                }
                              </button>
                            )}

                            {/* existing delete button */}
                            {u.role !== "admin" && u._id !== user?._id && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="flex items-center gap-1 text-xs border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* ── USER DETAIL MODAL ── */}
            {selectedUser && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedUser(null);
                    setUserDetail(null);
                  }
                }}
              >
                <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

                  {/* header */}
                  <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-white font-bold text-xl">User Details</h2>
                    <button
                      onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {userDetailLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : userDetail && (
                    <div className="p-6">

                      {/* user profile */}
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-3xl shrink-0 overflow-hidden">
                          {userDetail.user.avatar
                            ? <img src={userDetail.user.avatar} className="w-full h-full object-cover" />
                            : userDetail.user.name?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-white font-bold text-xl">{userDetail.user.name}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full
                              ${userDetail.user.role === "admin" ? "bg-purple-500/15 text-purple-400"
                                : userDetail.user.role === "instructor" ? "bg-blue-500/15 text-blue-400"
                                : "bg-emerald-500/15 text-emerald-400"
                              }`}
                            >
                              {userDetail.user.role}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{userDetail.user.email}</p>
                          {userDetail.user.bio && (
                            <p className="text-gray-500 text-sm mt-1">{userDetail.user.bio}</p>
                          )}
                          <p className="text-gray-600 text-xs mt-1">
                            Joined {new Date(userDetail.user.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric"
                            })}
                          </p>
                        </div>
                      </div>

                      {/* stats */}
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        {[
                          {
                            label: "Enrollments",
                            value: userDetail.stats.totalEnrollments,
                            color: "text-emerald-500",
                            bg: "bg-emerald-500/10",
                          },
                          {
                            label: "Completed",
                            value: userDetail.stats.completedCourses,
                            color: "text-purple-400",
                            bg: "bg-purple-500/10",
                          },
                          {
                            label: "Total Spent",
                            value: `$${userDetail.stats.totalSpent.toFixed(2)}`,
                            color: "text-yellow-400",
                            bg: "bg-yellow-500/10",
                          },
                          {
                            label: "Courses Created",
                            value: userDetail.stats.totalCoursesCreated,
                            color: "text-blue-400",
                            bg: "bg-blue-500/10",
                          },
                        ].map(({ label, value, color, bg }) => (
                          <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
                            <div className="text-gray-500 text-xs">{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* enrolled courses */}
                      {userDetail.enrollments?.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            Enrolled Courses ({userDetail.enrollments.length})
                          </h4>
                          <div className="flex flex-col gap-3">
                            {userDetail.enrollments.map((enrollment) => (
                              <div
                                key={enrollment._id}
                                className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                              >
                                {/* thumbnail */}
                                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-emerald-900 to-emerald-950 flex items-center justify-center shrink-0 overflow-hidden">
                                  {enrollment.course?.thumbnail
                                    ? <img src={enrollment.course.thumbnail} className="w-full h-full object-cover" />
                                    : <BookOpen className="w-5 h-5 text-white/20" />
                                  }
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {enrollment.course?.title}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>

                                {/* progress bar */}
                                <div className="w-32">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{enrollment.progress || 0}%</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full transition-all"
                                      style={{ width: `${enrollment.progress || 0}%` }}
                                    />
                                  </div>
                                </div>

                                {/* status */}
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0
                                  ${enrollment.isCompleted
                                    ? "bg-purple-500/15 text-purple-400"
                                    : enrollment.progress > 0
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-gray-700 text-gray-400"
                                  }`}
                                >
                                  {enrollment.isCompleted ? "Completed"
                                    : enrollment.progress > 0 ? "In Progress"
                                    : "Not Started"
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* created courses — for instructors */}
                      {userDetail.user.createdCourses?.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            Created Courses ({userDetail.user.createdCourses.length})
                          </h4>
                          <div className="flex flex-col gap-3">
                            {userDetail.user.createdCourses.map((course) => (
                              <div
                                key={course._id}
                                className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                              >
                                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-900 to-blue-950 flex items-center justify-center shrink-0 overflow-hidden">
                                  {course.thumbnail
                                    ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                                    : <BookOpen className="w-5 h-5 text-white/20" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{course.title}</p>
                                  <p className="text-gray-500 text-xs">
                                    {course.enrolledStudents?.length || 0} students enrolled
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
                                    ${course.isPublished
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : "bg-gray-700 text-gray-400"
                                    }`}
                                  >
                                    {course.isPublished ? "Published" : "Draft"}
                                  </span>
                                  <span className="text-white font-bold text-sm">
                                    {course.price === 0 ? "Free" : `$${course.price}`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* payment history */}
                      {userDetail.payments?.length > 0 && (
                        <div>
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            Payment History ({userDetail.payments.length})
                          </h4>
                          <div className="flex flex-col gap-2">
                            {userDetail.payments.map((payment) => (
                              <div
                                key={payment._id}
                                className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                              >
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    {payment.course?.title}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric", month: "long", day: "numeric"
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
                                    ${payment.status === "completed"
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : payment.status === "pending"
                                      ? "bg-yellow-500/15 text-yellow-400"
                                      : "bg-red-500/15 text-red-400"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                  <span className="text-white font-bold">${payment.amount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* empty state */}
                      {userDetail.enrollments?.length === 0 &&
                      userDetail.payments?.length === 0 &&
                      userDetail.user.createdCourses?.length === 0 && (
                        <div className="text-center py-10">
                          <div className="text-4xl mb-3">📭</div>
                          <p className="text-gray-500 text-sm">No activity yet for this user</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 text-sm">{courses.length} total courses</span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Course</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Instructor</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Students</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Price</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr
                        key={course._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-all"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-900 to-emerald-950 flex items-center justify-center shrink-0 overflow-hidden">
                              {course.thumbnail
                                ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                                : <BookOpen className="w-5 h-5 text-white/20" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium line-clamp-1">
                                {course.title}
                              </p>
                              <p className="text-gray-500 text-xs capitalize">
                                {course.category?.replace(/-/g, " ")} · {course.level}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">
                            {course.instructor?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">
                            {course.enrolledStudents?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${course.price === 0 ? "text-emerald-500" : "text-white"}`}>
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full
                            ${course.isPublished
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="flex items-center gap-1 text-xs border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === "payments" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 text-sm">{payments.length} total payments</span>
              <span className="text-emerald-500 font-bold">
                Total: ${payments
                  .filter((p) => p.status === "completed")
                  .reduce((acc, p) => acc + p.amount, 0)
                  .toFixed(2)
                }
              </span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Student</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Course</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Amount</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-all"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {payment.student?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm truncate">{payment.student?.name}</p>
                              <p className="text-gray-500 text-xs truncate">{payment.student?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400 text-sm line-clamp-1">
                            {payment.course?.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold text-sm">
                            ${payment.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full
                            ${payment.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : payment.status === "pending"
                              ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-xs">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;