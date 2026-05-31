import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useEnrollmentStore } from "../store/enrollmentStore.js";
import { useProgressStore } from "../store/progressStore.js";
import { usePaymentStore } from "../store/paymentStore.js";
import {
  BookOpen, Award, TrendingUp,
  Play, CheckCircle, CreditCard, ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

import ProgressBar from "../components/ProgressBar.jsx";
const Dashboard = () => {
  const { user, updateProfile } = useAuthStore();
  const { enrollments, getMyEnrollments, unenrollFromCourse } = useEnrollmentStore();
  const { progress, allProgress, getAllProgress } = useProgressStore();
  const { payments, getMyPayments } = usePaymentStore();
  const navigate = useNavigate();


  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editAvatar, setEditAvatar] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    getMyEnrollments();
    getAllProgress();
    getMyPayments();
  }, [getAllProgress, getMyEnrollments, getMyPayments]);


const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setProfileLoading(true);
  try {
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("bio", editBio);
    if (editAvatar) formData.append("avatar", editAvatar);
    await updateProfile(formData);
    setShowEditProfile(false);
  } finally {
    setProfileLoading(false);
  }
};


const handleUnenroll = async (courseId, amountPaid) => {
  if (amountPaid > 0) {
    toast.error("Cannot unenroll from a paid course. Contact support for refunds.");
    return;
  }
  if (!window.confirm("Are you sure you want to unenroll from this course?")) return;
  await unenrollFromCourse(courseId);
  getMyEnrollments(); // refresh list
};

  // match progress data to enrollment
  const getProgressForCourse = (courseId) => {
    return allProgress.find(
      (p) => p.course?._id === courseId || p.course === courseId
    );
  };

  // stats
  const totalEnrolled = enrollments.length;
  const completedCourses = allProgress.filter((p) => p.isCompleted).length;
  const inProgress = totalEnrolled - completedCourses;
  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm">
            Track your learning progress and continue where you left off
          </p>
        </div>

      {/* profile card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0">
            {user?.avatar
              ? <img src={user.avatar} className="w-full h-full object-cover" />
              : user?.name?.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.bio && (
              <p className="text-gray-400 text-xs mt-1">{user.bio}</p>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block
              ${user?.role === "admin" ? "bg-purple-500/15 text-purple-400"
                : user?.role === "instructor" ? "bg-blue-500/15 text-blue-400"
                : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowEditProfile(true)}
          className="flex items-center gap-2 border border-gray-700 text-gray-400 px-4 py-2 rounded-xl text-sm hover:border-emerald-500 hover:text-emerald-400 transition-all"
        >
          Edit Profile
        </button>
      </div>

        {/* edit profile modal */}
        {showEditProfile && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEditProfile(false); }}
          >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-white font-bold text-xl mb-6">Edit Profile</h2>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">

                {/* avatar upload */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0">
                    {editAvatar
                      ? <img src={URL.createObjectURL(editAvatar)} className="w-full h-full object-cover" />
                      : user?.avatar
                      ? <img src={user.avatar} className="w-full h-full object-cover" />
                      : user?.name?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => document.getElementById("avatar-input").click()}
                      className="text-emerald-400 text-sm border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-all"
                    >
                      Change Photo
                    </button>
                    <p className="text-gray-600 text-xs mt-1">JPG, PNG — max 5MB</p>
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/*"
                      onChange={(e) => setEditAvatar(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* bio */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white py-3 rounded-xl text-sm hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-60"
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Enrolled Courses",
              value: totalEnrolled,
              icon: BookOpen,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              label: "In Progress",
              value: inProgress,
              icon: TrendingUp,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Completed",
              value: completedCourses,
              icon: CheckCircle,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              label: "Total Spent",
              value: `$${totalSpent.toFixed(2)}`,
              icon: CreditCard,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* my courses */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">My Courses</h2>
              <Link
                to="/courses"
                className="text-emerald-500 text-sm font-semibold flex items-center gap-1 hover:text-emerald-400"
              >
                Browse more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-white font-bold mb-2">No courses yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Start learning by enrolling in a course
                </p>
                <Link
                  to="/courses"
                  className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all inline-block"
                >
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course;
                  const progress = getProgressForCourse(course?._id);

                  return (
                    <div
                      key={enrollment._id}
                      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex gap-4">
                        {/* thumbnail */}
                        <div className="w-20 h-20 rounded-xl bg-linear-to-br from-emerald-900/50 to-emerald-950 flex items-center justify-center shrink-0 overflow-hidden">
                          {course?.thumbnail
                            ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                            : <BookOpen className="w-8 h-8 text-white/20" />
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                            {course?.title}
                          </h3>
                          <p className="text-gray-500 text-xs mb-3">
                            {course?.instructor?.name}
                          </p>

                          {/* progress bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{progress?.completedLessons || 0} / {progress?.totalLessons || 0} lessons</span>
                              <span>{progress?.progress || 0}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress?.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          {/* status + button */}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold
                              ${progress?.isCompleted
                                ? "text-purple-400"
                                : progress?.progress > 0
                                ? "text-blue-400"
                                : "text-gray-500"
                              }`}
                            >
                              {progress?.isCompleted
                                ? "✓ Completed"
                                : progress?.progress > 0
                                ? "In progress"
                                : "Not started"
                              }
                            </span>

                            <button
                              onClick={() => navigate(`/learn/${course?._id}`)}
                              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all"
                            >
                              <Play className="w-3 h-3" />
                              {progress?.progress > 0 ? "Continue" : "Start"}
                            </button>
         
                            {enrollment.amountPaid === 0 && (
                              <button
                                onClick={() => handleUnenroll(course?._id, enrollment.amountPaid)}
                                className="text-red-400 hover:text-red-300 text-xs border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                              >
                                Unenroll
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* right sidebar */}
          <div className="flex flex-col gap-6">

            {/* certificates */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Certificates
              </h3>
              {completedCourses === 0 ? (
                <p className="text-gray-500 text-sm">
                  Complete a course to earn your first certificate
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {allProgress
                    .filter((p) => p.isCompleted)
                    .map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl"
                      >
                        <Award className="w-5 h-5 text-yellow-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold line-clamp-1">
                            {p.course?.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Completed {new Date(p.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* payment history */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Payment History
              </h3>

              {payments.length === 0 ? (
                <p className="text-gray-500 text-sm">No payments yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {payments.slice(0, 4).map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs font-medium line-clamp-1">
                          {payment.course?.title}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-emerald-500 text-xs font-bold ml-3 shrink-0">
                        ${payment.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <ProgressBar progress={progress?.progress || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;