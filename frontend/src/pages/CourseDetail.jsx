import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore.js";
import { useEnrollmentStore } from "../store/enrollmentStore.js";
import { useAuthStore } from "../store/authStore.js";
import { usePaymentStore } from "../store/paymentStore.js";
import {
  BookOpen, Clock, Users, Star, Play, Lock,
  CheckCircle, Award, ChevronDown, ChevronUp, X, ArrowRight
} from "lucide-react";
import { useState } from "react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentCourse, fetchCourseById, loading } = useCourseStore();
  const { enrollmentStatus, getEnrollmentStatus, enrollInCourse } = useEnrollmentStore();
  const { createCheckoutSession } = usePaymentStore();
  const { user } = useAuthStore();

  const [expandedLesson, setExpandedLesson] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);

  useEffect(() => {
    fetchCourseById(id);
    if (user) getEnrollmentStatus(id);
  }, [id, fetchCourseById, getEnrollmentStatus, user]);

  const isEnrolled = enrollmentStatus?.isEnrolled;
  const isInstructor = 
    currentCourse?.instructor?._id === user?._id ||
    currentCourse?.instructor?._id?.toString() === user?._id?.toString() ||
    currentCourse?.instructor === user?._id ||
    currentCourse?.instructor?._id === user?.id;

  const isAdmin = user?.role === "admin";

  const handleEnroll = async () => {
    if (!user) { 
      navigate("/login");
      return;
    }

    if (currentCourse.price === 0) {
      await enrollInCourse(id);
      navigate(`/learn/${id}`);
    } else {
      await createCheckoutSession(id);
      // redirects to Stripe automatically
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0 min";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO BANNER ── */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* left — course info */}
            <div className="lg:col-span-2">
              {/* category + level */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  {currentCourse.category?.replace(/-/g, " ")}
                </span>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-500 capitalize">{currentCourse.level}</span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                {currentCourse.title}
              </h1>

              <p className="text-gray-400 text-base leading-relaxed mb-6">
                {currentCourse.description}
              </p>

              {/* instructor */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                  {currentCourse.instructor?.avatar
                    ? <img src={currentCourse.instructor.avatar} className="w-full h-full object-cover" />
                    : currentCourse.instructor?.name?.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    {currentCourse.instructor?.name}
                  </p>
                  <p className="text-gray-500 text-xs">Instructor</p>
                </div>
              </div>

              {/* stats row */}
              <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {currentCourse.rating || "New"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {currentCourse.enrolledStudents?.length || 0} students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  {currentCourse.lessons?.length || 0} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  {formatDuration(currentCourse.duration * 60)}
                </span>
              </div>
            </div>

            {/* right — enrollment card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden sticky top-20">
                {/* thumbnail */}
                <div className="w-full h-44 bg-linear-to-br from-emerald-900/50 to-emerald-950 flex items-center justify-center overflow-hidden">
                  {currentCourse.thumbnail
                    ? <img src={currentCourse.thumbnail} className="w-full h-full object-cover" />
                    : <BookOpen className="w-12 h-12 text-white/20" />
                  }
                </div>

                <div className="p-6">
                  {/* price */}
                  <div className="mb-5">
                    {currentCourse.price === 0 ? (
                      <span className="text-3xl font-bold text-emerald-500">Free</span>
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        ${currentCourse.price}
                      </span>
                    )}
                  </div>

                  {/* enroll button */}
                  {isEnrolled || isInstructor || isAdmin ? (
                    <button
                      id="enroll-btn"
                      onClick={() => navigate(`/learn/${id}`)}
                      className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {isInstructor || isAdmin ? "Manage Course" : "Continue Learning"}
                    </button>
                  ) : (
                    <button
                      id="enroll-btn"
                      onClick={handleEnroll}
                      className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all"
                    >
                      {!user
                        ? "Login to Enroll"
                        : currentCourse.price === 0
                        ? "Enroll for Free"
                        : `Buy for $${currentCourse.price}`
                      }
                    </button>
                  )}

                  {/* what you get */}
                  <div className="mt-6 flex flex-col gap-3">
                    {[
                      `${currentCourse.lessons?.length || 0} video lessons`,
                      `${formatDuration(currentCourse.duration * 60)} of content`,
                      "Certificate of completion",
                      "Full lifetime access",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COURSE CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">

            {/* what you will learn */}
            {currentCourse.whatYouWillLearn?.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  What you will learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentCourse.whatYouWillLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* requirements */}
            {currentCourse.requirements?.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-5">Requirements</h2>
                <ul className="flex flex-col gap-2">
                  {currentCourse.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-emerald-500 mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* lessons list */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Course Content
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                {currentCourse.lessons?.length || 0} lessons
              </p>

              {currentCourse.lessons?.length === 0 && (
                <p className="text-gray-600 text-sm">No lessons added yet</p>
              )}

              <div className="flex flex-col gap-2">
                {currentCourse.lessons?.map((lesson, i) => (
                  <div key={lesson._id} className="border border-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => {
                        if (lesson.isFree) {
                          setPreviewLesson(lesson); // ✅ open preview
                        } else {
                          setExpandedLesson(
                            expandedLesson === lesson._id ? null : lesson._id
                          );
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-800">
                        {lesson.isFree || isEnrolled || isInstructor || isAdmin
                          ? <Play className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                          : <Lock className="w-3.5 h-3.5 text-gray-600" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {i + 1}. {lesson.title}
                        </p>
                        {lesson.isFree && !isInstructor && !isAdmin && (
                          <span className="text-xs text-emerald-500 font-semibold">
                            Free preview — click to watch
                          </span> 
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-500">
                          {lesson.duration ? `${lesson.duration} min` : "0 min"}
                        </span>
                        {!lesson.isFree && (
                          expandedLesson === lesson._id
                            ? <ChevronUp className="w-4 h-4 text-gray-500" />
                            : <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {/* expanded description for locked lessons */}
                    {expandedLesson === lesson._id && lesson.description && !lesson.isFree && (
                      <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gray-800 pt-3">
                        {lesson.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right sidebar — instructor bio */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-20">
              <h3 className="text-lg font-bold text-white mb-4">Your Instructor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
                  {currentCourse.instructor?.avatar
                    ? <img src={currentCourse.instructor.avatar} className="w-full h-full object-cover" />
                    : currentCourse.instructor?.name?.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {currentCourse.instructor?.name}
                  </p>
                  <p className="text-gray-500 text-xs">Instructor</p>
                </div>
              </div>
              {currentCourse.instructor?.bio && (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {currentCourse.instructor.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ── FREE PREVIEW MODAL ── */}
      {previewLesson && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewLesson(null);
          }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden">

            {/* header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Free Preview
                </span>
                <h3 className="text-white font-semibold mt-0.5">
                  {previewLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* video */}
            <div className="bg-black" style={{ height: "400px" }}>
              {previewLesson.videoUrl ? (
                <video
                  key={previewLesson._id}
                  src={previewLesson.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  style={{ objectFit: "contain" }}
                  controlsList="nodownload"
                  disablePictureInPicture
                >
                  <source src={previewLesson.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No video available</p>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="p-4 flex items-center justify-between border-t border-gray-800">
              {previewLesson.description && (
                <p className="text-gray-400 text-sm">{previewLesson.description}</p>
              )}
              
              <button
                onClick={() => {
                  setPreviewLesson(null);
                  // scroll to enroll button
                  setTimeout(() => {
                    document.getElementById("enroll-btn")?.scrollIntoView({ 
                      behavior: "smooth",
                      block: "center"
                    });
                  }, 300);
                }}
                className="flex items-center gap-2 bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-600 transition-all ml-auto"
              >
                {currentCourse?.price === 0 ? "Enroll for Free" : `Buy for $${currentCourse?.price}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;