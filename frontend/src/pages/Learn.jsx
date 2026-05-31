import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore.js";
import { useEnrollmentStore } from "../store/enrollmentStore.js";
import { useProgressStore } from "../store/progressStore.js";
import { useQuizStore } from "../store/quizStore.js";
import { useAuthStore } from "../store/authStore.js";
import {
    CheckCircle, Circle, ChevronLeft, ChevronRight,
    Award, BookOpen, FileText, Play
} from "lucide-react";
import toast from "react-hot-toast";

import QuizModal from "../components/QuizModal.jsx";
// import ProgressBar from "../components/ProgressBar.jsx";

const Learn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { currentCourse, fetchCourseById } = useCourseStore();
  const { enrollmentStatus, getEnrollmentStatus } = useEnrollmentStore();
  const { progress, getCourseProgress, markLessonComplete, markLessonIncomplete } = useProgressStore();
  const { quiz, getQuiz } = useQuizStore();
  const { user } = useAuthStore();

  const [currentLesson, setCurrentLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCourseById(courseId);
    getEnrollmentStatus(courseId);
    getCourseProgress(courseId);
    getQuiz(courseId);
  }, [courseId, fetchCourseById, getEnrollmentStatus, getCourseProgress, getQuiz]);

  useEffect(() => {
    const currentCourse = ()=>{
        if (currentCourse?.lessons?.length > 0 && !currentLesson) {
            setCurrentLesson(currentCourse.lessons[0]);
        }
    }
    currentCourse();
   }, [currentCourse, currentLesson]);

//   useEffect(() => {
//     if (currentLesson) {
//       console.log("Current lesson:", currentLesson);
//       console.log("Video URL:", currentLesson.videoUrl);
//     }
//  }, [currentLesson]);

const isInstructor = currentCourse?.instructor?._id === user?._id ||
                     currentCourse?.instructor === user?._id;
const isAdmin = user?.role === "admin";

const handleLessonComplete = async () => {
  if (!currentLesson) return;
  
  // instructors and admins don't need to track progress
  if (isInstructor || isAdmin) {
    toast.success("Lesson ended");
    return;
  }
  
  await markLessonComplete(courseId, currentLesson._id);
};

// check if user is allowed to access this course
useEffect(() => {
  if (!enrollmentStatus) return;
  if (!currentCourse) return;

  // instructor of this course can always access
  if (isInstructor || isAdmin) return;

  // redirect non-enrolled students
  if (!enrollmentStatus?.isEnrolled) {
    navigate(`/courses/${courseId}`);
  }
}, [enrollmentStatus, currentCourse, navigate, isInstructor, isAdmin, courseId]);

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some(
      (l) => (l._id || l) === lessonId
    );
  };

  const handleNextLesson = () => {
    const lessons = currentCourse?.lessons || [];
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    const lessons = currentCourse?.lessons || [];
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };

  const currentIndex = currentCourse?.lessons?.findIndex(
    (l) => l._id === currentLesson?._id
  ) ?? 0;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === (currentCourse?.lessons?.length || 1) - 1;

  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-sm line-clamp-1">
              {currentCourse.title}
            </h1>
            <p className="text-gray-500 text-xs">
              {currentIndex + 1} / {currentCourse.lessons?.length || 0} lessons
            </p>
          </div>
        </div>

        {/* progress bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs mx-6">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress?.progress || 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {progress?.progress || 0}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* certificate button when completed */}
          {progress?.isCompleted && (
            <button className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <Award className="w-3.5 h-3.5" />
              Certificate
            </button>
          )}

          {/* toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs px-3 py-1.5 border border-gray-800 rounded-lg transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {sidebarOpen ? "Hide" : "Show"} Content
          </button>
        </div>
      </div>


{/* ── MAIN CONTENT ── */}
<div className="flex flex-1 overflow-hidden">

  {/* left — video + controls */}
  <div className="flex-1 flex flex-col overflow-y-auto">

    {/* video player */}
    <div className="bg-black w-full flex items-center justify-center"
      style={{ height: "420px" }}
    >
      {currentLesson?.videoUrl ? (
        <video
          key={currentLesson._id}
          src={currentLesson.videoUrl}
          controls
          className="h-full w-full"
          style={{ objectFit: "contain", maxHeight: "420px" }}
          onEnded={handleLessonComplete}
          onError={(e) => console.log("Video error:", e.target.error)}
          controlsList="nodownload"
          disablePictureInPicture
        >
          <source src={currentLesson.videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="text-center">
          <Play className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">
            {currentLesson ? "No video for this lesson" : "Select a lesson to start"}
          </p>
        </div>
      )}
    </div>

    {/* lesson info + controls */}
    <div className="p-6 border-b border-gray-800">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl mb-1">
            {currentLesson?.title || "Select a lesson"}
          </h2>
          {currentLesson?.description && (
            <p className="text-gray-400 text-sm leading-relaxed">
              {currentLesson.description}
            </p>
          )}
        </div>

        {/* mark complete button */}
        {!isInstructor && !isAdmin && currentLesson && (
          <button
            onClick={() => {
              if (isLessonCompleted(currentLesson?._id)) {
                markLessonIncomplete(courseId, currentLesson._id);
              } else {
                handleLessonComplete();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0
              ${isLessonCompleted(currentLesson?._id)
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                : "bg-gray-800 border border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-emerald-400"
              }`}
          >
            {isLessonCompleted(currentLesson?._id)
              ? <><CheckCircle className="w-4 h-4" /> Completed</>
              : <><Circle className="w-4 h-4" /> Mark Complete</>
            }
          </button>
        )}
      </div>

      {/* prev / next / quiz buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handlePrevLesson}
          disabled={isFirst}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm hover:border-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleNextLesson}
          disabled={isLast}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next Lesson
          <ChevronRight className="w-4 h-4" />
        </button>

        {isLast && quiz && (
          <button
            onClick={() => setShowQuiz(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-500/25 transition-all ml-auto"
          >
            <FileText className="w-4 h-4" />
            Take Quiz
          </button>
        )}
      </div>
    </div>

    {/* resources */}
    {currentLesson?.resources?.length > 0 && (
      <div className="p-6">
        <h3 className="text-white font-semibold mb-3">Resources</h3>
        <div className="flex flex-col gap-2">
          {currentLesson.resources.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-emerald-500 text-sm hover:text-emerald-400 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Resource {i + 1}
            </a>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* right — sidebar */}
  {sidebarOpen && (
    <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold text-sm">Course Content</h3>
              <p className="text-gray-500 text-xs mt-1">
                {progress?.completedLessons?.length || 0} of{" "}
                {currentCourse.lessons?.length || 0} completed
              </p>
              {/* mini progress bar */}
              <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress?.progress || 0}%` }}
                />
              </div>
         </div>

        {/* lessons */}
        <div className="flex flex-col">
          {currentCourse.lessons?.map((lesson, i) => {

            if (!lesson || typeof lesson === "string") return null;

            const isActive = lesson._id === currentLesson?._id;
            const isCompleted = isLessonCompleted(lesson._id);

            return (
              <button
                key={lesson._id}
                onClick={() => setCurrentLesson(lesson)}
                className={`flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-800/50 transition-all
                  ${isActive
                    ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                    : "hover:bg-gray-800/50"
                  }`}
              >
                {/* completion icon */}
                <div className="shrink-0">
                  {isCompleted
                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : <Circle className="w-4 h-4 text-gray-600" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium line-clamp-2 leading-snug
                    ${isActive ? "text-emerald-400" : "text-gray-300"}`}>
                    {i + 1}. {lesson.title}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {lesson.duration ? `${lesson.duration} min` : ""}
                  </p>
                </div>

                {/* free tag */}
                {lesson.isFree && (
                  <span className="text-xs text-emerald-500 font-semibold shrink-0">
                    Free
                  </span>
                )}
              </button>
            );
          })}

          {/* quiz entry in sidebar */}
          {quiz && (
            <button
              onClick={() => setShowQuiz(true)}
              className="flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-800/50 transition-all border-b border-gray-800/50"
            >
              <FileText className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-purple-400">
                  Final Quiz
                </p>
                <p className="text-gray-600 text-xs">
                  {quiz.questions?.length} questions
                </p>
              </div>
            </button>
          )}
        </div>
    </div>
  )}
</div>

      {/* ── QUIZ MODAL ── */}
      {showQuiz && (
        <QuizModal
          quiz={quiz}
          onClose={() => setShowQuiz(false)}
          courseId={courseId}
        />
      )}
    </div>
  );
};

export default Learn;