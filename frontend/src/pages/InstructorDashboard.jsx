import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore.js";
// import { useAuthStore } from "../store/authStore.js";
import {
  BookOpen, Users, Eye, EyeOff, Trash2,
  Plus, Edit, DollarSign,
  Upload, X, ChevronDown, ChevronUp, Play, FileText 
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";

const CATEGORIES = ["web-dev", "mobile-dev", "data-science", "design", "business", "other"];
const LEVELS = ["beginner", "intermediate", "advanced"];

const InstructorDashboard = () => {
  const navigate = useNavigate();
// const { user } = useAuthStore();
  const {
    instructorCourses,
    fetchInstructorCourses,
    createCourse,
    deleteCourse,
    publishCourse,
    loading,
  } = useCourseStore();

  // modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("web-dev");
  const [level, setLevel] = useState("beginner");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [requirements, setRequirements] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");

  // lesson modal state
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // lesson form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [lessonVideo, setLessonVideo] = useState(null);
  const [lessonVideoName, setLessonVideoName] = useState("");
  const [lessonUploading, setLessonUploading] = useState(false);

  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [quizCourseId, setQuizCourseId] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState([
     { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [courseQuizzes, setCourseQuizzes] = useState({});

  useEffect(() => {
    fetchInstructorCourses();
  }, [fetchInstructorCourses]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    // preview before upload
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price || 0);
  formData.append("category", category);
  formData.append("level", level);
  if (thumbnail) formData.append("thumbnail", thumbnail);

// convert comma separated strings to arrays
  if (requirements) {
    requirements.split(",").forEach((r) => {
    formData.append("requirements", r.trim());
    });
  }
  if (whatYouWillLearn) {
    whatYouWillLearn.split(",").forEach((w) => {
    formData.append("whatYouWillLearn", w.trim());
    });
  }

   await createCourse(formData);
   setShowCreateModal(false);
   resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("web-dev");
    setLevel("beginner");
    setThumbnail(null);
    setThumbnailPreview("");
    setRequirements("");
    setWhatYouWillLearn("");
  };

const handleAddLesson = async (e) => {
  e.preventDefault();

  if (!lessonTitle) {
    toast.error("Title is required");
    return;
  }

  setLessonUploading(true);

  try {
    const formData = new FormData();
    formData.append("title", lessonTitle);
    formData.append("description", lessonDescription || "");
    formData.append("order", lessonOrder || "0");
    formData.append("duration", lessonDuration || "0");
    formData.append("isFree", lessonIsFree ? "true" : "false");
    if (lessonVideo) formData.append("video", lessonVideo);

    await api.post(
      `/courses/${selectedCourseId}/lessons`,
      formData,
      {
        // track upload progress
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percent}%`);
        },
      }
    );

    toast.success("Lesson added successfully");
    setShowAddLesson(false);
    resetLessonForm(); 
    fetchInstructorCourses();
  } catch (error) {
    console.log("Add lesson error:", error);
    toast.error(error.response?.data?.message || "Failed to add lesson");
  } finally {
    setLessonUploading(false);
  }
};

const resetLessonForm = () => {
  setLessonTitle("");
  setLessonDescription("");
  setLessonOrder("");
  setLessonDuration("");
  setLessonIsFree(false);
  setLessonVideo(null);
  setLessonVideoName("");
};

const handleDeleteLesson = async (lessonId, courseId) => {
  if (!window.confirm("Are you sure you want to delete this lesson?")) return;
  try {
    await api.delete(`/courses/lessons/${lessonId}`);
    console.log(courseId);
    toast.success("Lesson deleted");
    fetchInstructorCourses(); // refresh to update lesson list
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete lesson");
  }
};

const addQuestion = () => {
  setQuizQuestions([
    ...quizQuestions,
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);
};

const removeQuestion = (index) => {
  setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
};

const updateQuestion = (index, field, value) => {
  const updated = [...quizQuestions];
  updated[index][field] = value;
  setQuizQuestions(updated);
};

const updateOption = (qIndex, oIndex, value) => {
  const updated = [...quizQuestions];
  updated[qIndex].options[oIndex] = value;
  setQuizQuestions(updated);
};

const handleCreateQuiz = async (e) => {
  e.preventDefault();
  if (!quizTitle) {
    toast.error("Quiz title is required");
    return;
  }
  if (quizQuestions.some(q => !q.questionText || q.options.some(o => !o))) {
    toast.error("Please fill in all questions and options");
    return;
  }

  setQuizLoading(true);
  try {
    const response = await api.post(`/courses/${quizCourseId}/quiz`, {
        title: quizTitle,
        passingScore: quizPassingScore,
        questions: quizQuestions,
    });
    
    // ✅ save quiz to courseQuizzes state
    setCourseQuizzes((prev) => ({ 
        ...prev, 
        [quizCourseId]: response.data.quiz 
    }));
    
    toast.success("Quiz created successfully");
    setShowAddQuiz(false);
    resetQuizForm();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create quiz");
  } finally {
    setQuizLoading(false);
  }
};

const resetQuizForm = () => {
  setQuizTitle("");
  setQuizPassingScore(70);
  setQuizQuestions([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);
};

// fetch quiz for each course when expanded
const handleExpandCourse = async (courseId) => {
  setExpandedCourse(expandedCourse === courseId ? null : courseId);
  if (!courseQuizzes[courseId]) {
    try {
      const response = await api.get(`/courses/${courseId}/quiz`);
      setCourseQuizzes((prev) => ({ ...prev, [courseId]: response.data.quiz }));
    } catch {
      setCourseQuizzes((prev) => ({ ...prev, [courseId]: null }));
    }
  }
};

const handleDeleteQuiz = async (quizId, courseId) => {
  if (!window.confirm("Delete this quiz?")) return;
  try {
    await api.delete(`/courses/quiz/${quizId}`);
    setCourseQuizzes((prev) => ({ ...prev, [courseId]: null }));
    toast.success("Quiz deleted");
  } catch (error) {
    toast.error("Failed to delete quiz", error.response?.data?.message);
  }
};

const handleVideoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setLessonVideo(file);
  setLessonVideoName(file.name);

  // auto read duration using HTML5 Audio API
  const video = document.createElement("video");
  const url = URL.createObjectURL(file);
  video.src = url;
  video.addEventListener("loadedmetadata", () => {
    setLessonDuration(Math.floor(video.duration / 60).toString()); // convert to minutes
    URL.revokeObjectURL(url);
  });
};

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    await deleteCourse(courseId);
  };

  const handlePublish = async (courseId) => {
    await publishCourse(courseId);
  };

  // stats
  const totalStudents = instructorCourses.reduce(
    (acc, c) => acc + (c.enrolledStudents?.length || 0), 0
  );
  const totalRevenue = instructorCourses.reduce(
    (acc, c) => acc + (c.price * (c.enrolledStudents?.length || 0)), 0
  );
  const publishedCourses = instructorCourses.filter((c) => c.isPublished).length;

  return (
<div className="min-h-screen bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 py-10">

    {/* header */}
    <div className="flex justify-between items-start mb-10">
        <div>
        <h1 className="text-3xl font-bold text-white mb-1">
            Instructor Dashboard
        </h1>
        <p className="text-gray-400 text-sm">
            Manage your courses and track performance
        </p>
        </div>
        <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-2 bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all"
        >
        <Plus className="w-4 h-4" />
        New Course
        </button>
    </div>

    {/* stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
        {
            label: "Total Courses",
            value: instructorCourses.length,
            icon: BookOpen,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Published",
            value: publishedCourses,
            icon: Eye,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Total Students",
            value: totalStudents,
            icon: Users,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            label: "Est. Revenue",
            value: `$${totalRevenue.toFixed(0)}`,
            icon: DollarSign,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
        },
        ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-gray-500 text-xs">{label}</div>
        </div>
        ))}
    </div>

    {/* courses list */}
    <h2 className="text-xl font-bold text-white mb-5">My Courses</h2>

    {instructorCourses.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-white font-bold mb-2">No courses yet</h3>
        <p className="text-gray-500 text-sm mb-6">
            Create your first course and start teaching
        </p>
        <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all"
        >
            Create Course
        </button>
        </div>
    ) : (
        <div className="flex flex-col gap-4">
        {instructorCourses.map((course) => (
            <div
            key={course._id}
            className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
            >
            {/* course row */}
            <div className="p-5 flex items-center gap-4">
                {/* thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-emerald-900/50 to-emerald-950 flex items-center justify-center shrink-0 overflow-hidden">
                {course.thumbnail
                    ? <img src={course.thumbnail} className="w-full h-full object-cover" />
                    : <BookOpen className="w-7 h-7 text-white/20" />
                }
                </div>

                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm truncate">
                    {course.title}
                    </h3>
                    {/* published badge */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0
                    ${course.isPublished
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                    >
                    {course.isPublished ? "Published" : "Draft"}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.enrolledStudents?.length || 0} students
                    </span>
                    <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course.lessons?.length || 0} lessons
                    </span>
                    <span className="capitalize">{course.level}</span>
                    <span className="text-emerald-500 font-semibold">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>
                </div>
                </div>

                {/* action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                {/* manage lessons */}
                <button
                    onClick={() => navigate(`/learn/${course._id}`)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-emerald-500 hover:text-emerald-400 transition-all"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Manage
                </button>

                {/* publish toggle */}
                <button
                    onClick={() => handlePublish(course._id)}
                    className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-all
                    ${course.isPublished
                        ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                >
                    {course.isPublished
                    ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
                    : <><Eye className="w-3.5 h-3.5" /> Publish</>
                    }
                </button>

                {/* delete */}
                <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                </button>

                {/* expand */}
                <button
                    onClick={() => handleExpandCourse(course._id)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                    >
                    {expandedCourse === course._id
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    }
                </button>
                </div>
            </div>

            {/* expanded — lessons list */}
            {expandedCourse === course._id && (
                <div className="border-t border-gray-800 p-5">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-semibold text-sm">Lessons</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                            setSelectedCourseId(course._id);
                            setShowAddLesson(true);
                            }}
                            className="flex items-center gap-1.5 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Lesson
                        </button>

                        <button
                            onClick={() => {
                            setQuizCourseId(course._id);
                            setShowAddQuiz(true);
                            }}
                            className="flex items-center gap-1.5 text-xs bg-purple-500 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-all"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Add Quiz
                        </button>

                        {/* quiz status */}
                        <div className=" border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <span className="text-white text-sm font-medium">Quiz</span>
                            </div>

                            {courseQuizzes[course._id] ? (
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                ✓ {courseQuizzes[course._id]?.questions?.length} questions
                                </span>
                                <button
                                onClick={() => handleDeleteQuiz(courseQuizzes[course._id]._id, course._id)}
                                className="text-red-400 hover:text-red-300 text-xs border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all flex items-center gap-1"
                                >
                                <Trash2 className="w-3 h-3" />
                                Delete Quiz
                                </button>
                            </div>
                            ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-xs">No quiz yet</span>
                                <button
                                onClick={() => {
                                    setQuizCourseId(course._id);
                                    setShowAddQuiz(true);
                                }}
                                className="text-purple-400 text-xs border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-all flex items-center gap-1"
                                >
                                <Plus className="w-3 h-3" />
                                Add Quiz
                                </button>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                </div>

                {course.lessons?.length === 0 ? (
                    <p className="text-gray-600 text-sm">
                    No lessons yet — add your first lesson
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {course.lessons?.map((lesson, i) => (
                        <div
                            key={lesson._id}
                            className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                        >
                            <span className="text-gray-600 text-xs w-5 text-center">
                            {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">
                                {lesson.title}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {lesson.duration ? `${lesson.duration} min` : ""}
                                {lesson.isFree && (
                                <span className="ml-2 text-emerald-500">Free preview</span>
                                )}
                            </p>
                            </div>

                            {/* delete lesson button */}
                            <button
                            onClick={() => handleDeleteLesson(lesson._id, course._id)}
                            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                            >
                            <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        ))}
                    </div>
                )}
                </div>
            )}
            </div>
        ))}
        </div>
    )}
    </div>

    {/* ── CREATE COURSE MODAL ── */}
    {showCreateModal && (
    <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
    >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* modal header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-bold text-xl">Create New Course</h2>
            <button
            onClick={() => { setShowCreateModal(false); resetForm(); }}
            className="text-gray-500 hover:text-white transition-colors"
            >
            <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleCreateCourse} className="p-6 flex flex-col gap-4">

            {/* thumbnail upload */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Thumbnail
            </label>
            <div
                onClick={() => document.getElementById("thumbnail-input").click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${thumbnailPreview
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-gray-700 hover:border-emerald-500"
                }`}
            >
                {thumbnailPreview ? (
                <img
                    src={thumbnailPreview}
                    className="w-full h-32 object-cover rounded-lg"
                />
                ) : (
                <div>
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Click to upload thumbnail</p>
                    <p className="text-gray-700 text-xs mt-1">JPG, PNG, WEBP</p>
                </div>
                )}
            </div>
            <input
                type="file"
                id="thumbnail-input"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
            />
            </div>

            {/* title */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Course Title *
            </label>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete React Developer Course"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
            />
            </div>

            {/* description */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Description *
            </label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this course?"
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all resize-none"
            />
            </div>

            {/* category + level */}
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Category
                </label>
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-all"
                >
                {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-gray-800">{c}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Level
                </label>
                <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-all"
                >
                {LEVELS.map((l) => (
                    <option key={l} value={l} className="bg-gray-800">{l}</option>
                ))}
                </select>
            </div>
            </div>

            {/* price */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Price (USD) — leave 0 for free
            </label>
            <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
            />
            </div>

            {/* requirements */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Requirements (comma separated)
            </label>
            <input
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Basic HTML, CSS knowledge, A computer"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
            />
            </div>

            {/* what you will learn */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                What Students Will Learn (comma separated)
            </label>
            <input
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
                placeholder="Build React apps, Use hooks, Deploy apps"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
            />
            </div>

            {/* submit */}
            <div className="flex gap-3 mt-2">
            <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="flex-1 bg-gray-800 border border-gray-700 text-white py-3 rounded-xl text-sm hover:bg-gray-700 transition-all"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-60"
            >
                {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                </div>
                ) : "Create Course"}
            </button>
            </div>
        </form>
        </div>
    </div>
    )}

    {/* ── ADD LESSON MODAL ── */}
    {showAddLesson && (
    <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
        if (e.target === e.currentTarget) {
            setShowAddLesson(false);
            resetLessonForm();
        }
        }}
    >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* modal header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
            <h2 className="text-white font-bold text-xl">Add Lesson</h2>
            <p className="text-gray-500 text-xs mt-1">
                Upload a video lesson to your course
            </p>
            </div>
            <button
            onClick={() => { setShowAddLesson(false); resetLessonForm(); }}
            className="text-gray-500 hover:text-white transition-colors"
            >
            <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleAddLesson} className="p-6 flex flex-col gap-4">

            {/* video upload */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Video File *
            </label>
            <div
                onClick={() => document.getElementById("lesson-video-input").click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${lessonVideo
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-gray-700 hover:border-emerald-500"
                }`}
            >
                {lessonVideo ? (
                <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-left">
                    <p className="text-emerald-400 text-sm font-medium truncate max-w-xs">
                        {lessonVideoName}
                    </p>
                    {lessonDuration && (
                        <p className="text-gray-500 text-xs">
                        Duration: ~{lessonDuration} min
                        </p>
                    )}
                    </div>
                </div>
                ) : (
                <div>
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Click to upload video</p>
                    <p className="text-gray-700 text-xs mt-1">MP4, MOV, AVI, WebM</p>
                </div>
                )}
            </div>
            <input
                type="file"
                id="lesson-video-input"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
            />
            </div>

            {/* title */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Lesson Title *
            </label>
            <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Introduction to React Hooks"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
            />
            </div>

            {/* description */}
            <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Description
            </label>
            <textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="What will students learn in this lesson?"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all resize-none"
            />
            </div>

            {/* order + duration */}
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Lesson Order
                </label>
                <input
                type="number"
                value={lessonOrder}
                onChange={(e) => setLessonOrder(e.target.value)}
                placeholder="1"
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Duration (minutes)
                </label>
                <input
                type="number"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
                placeholder="Auto detected"
                min="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
                />
            </div>
            </div>

            {/* free preview toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div>
                <p className="text-white text-sm font-medium">Free Preview</p>
                <p className="text-gray-500 text-xs">
                Allow non-enrolled students to watch this lesson
                </p>
            </div>
            <button
                type="button"
                onClick={() => setLessonIsFree(!lessonIsFree)}
                className={`w-12 h-6 rounded-full transition-all relative shrink-0
                ${lessonIsFree ? "bg-emerald-500" : "bg-gray-600"}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all
                ${lessonIsFree ? "left-6" : "left-0.5"}`}
                />
            </button>
            </div>

            {/* submit */}
            <div className="flex gap-3 mt-2">
            <button
                type="button"
                onClick={() => { setShowAddLesson(false); resetLessonForm(); }}
                className="flex-1 bg-gray-800 border border-gray-700 text-white py-3 rounded-xl text-sm hover:bg-gray-700 transition-all"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={lessonUploading}
                className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-60"
            >
                {lessonUploading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                </div>
                ) : "Add Lesson"}
            </button>
            </div>

            {/* upload warning */}
            {lessonUploading && (
            <p className="text-center text-yellow-400 text-xs">
                ⚠️ Please do not close this window while uploading
            </p>
            )}
        </form>
        </div>
    </div>
    )}

    {/* ── ADD QUIZ MODAL ── */}
    {showAddQuiz && (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowAddQuiz(false); resetQuizForm(); }}}
        >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                <h2 className="text-white font-bold text-xl">Create Quiz</h2>
                <p className="text-gray-500 text-xs mt-1">Add a quiz for students to test their knowledge</p>
                </div>
                <button onClick={() => { setShowAddQuiz(false); resetQuizForm(); }}>
                <X className="w-5 h-5 text-gray-500 hover:text-white" />
                </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="p-6 flex flex-col gap-5">

                {/* quiz title + passing score */}
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Quiz Title *
                    </label>
                    <input
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Final Assessment"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Passing Score (%)
                    </label>
                    <input
                    type="number"
                    value={quizPassingScore}
                    onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                </div>
                </div>

                {/* questions */}
                <div className="flex flex-col gap-5">
                {quizQuestions.map((question, qIndex) => (
                    <div
                    key={qIndex}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
                    >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-white text-sm font-semibold">
                        Question {qIndex + 1}
                        </span>
                        {quizQuestions.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-400 text-xs hover:text-red-300"
                        >
                            Remove
                        </button>
                        )}
                    </div>

                    {/* question text */}
                    <input
                        value={question.questionText}
                        onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                        placeholder="Enter your question"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all mb-3"
                    />

                    {/* options */}
                    <div className="flex flex-col gap-2 mb-3">
                        {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                            {/* correct answer radio */}
                            <button
                            type="button"
                            onClick={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                            className={`w-5 h-5 rounded-full border-2 shrink-0 transition-all
                                ${question.correctAnswer === oIndex
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-gray-600"
                                }`}
                            />
                            <input
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            className={`flex-1 bg-gray-800 border rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 outline-none transition-all
                                ${question.correctAnswer === oIndex
                                ? "border-emerald-500/50"
                                : "border-gray-700 focus:border-emerald-500"
                                }`}
                            />
                            {question.correctAnswer === oIndex && (
                            <span className="text-emerald-500 text-xs font-semibold shrink-0">
                                Correct
                            </span>
                            )}
                        </div>
                        ))}
                    </div>

                    {/* explanation */}
                    <input
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                        placeholder="Explanation (shown after quiz submission)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 transition-all"
                    />
                    </div>
                ))}
                </div>

                {/* add question button */}
                <button
                type="button"
                onClick={addQuestion}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-700 text-gray-400 py-3 rounded-xl text-sm hover:border-emerald-500 hover:text-emerald-400 transition-all"
                >
                <Plus className="w-4 h-4" />
                Add Question
                </button>

                {/* submit */}
                <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => { setShowAddQuiz(false); resetQuizForm(); }}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white py-3 rounded-xl text-sm hover:bg-gray-700 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={quizLoading}
                    className="flex-1 bg-purple-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-purple-600 transition-all disabled:opacity-60"
                >
                    {quizLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                    </div>
                    ) : "Create Quiz"}
                </button>
                </div>
            </form>
            </div>
        </div>
    )}
</div>
  );
};

export default InstructorDashboard;