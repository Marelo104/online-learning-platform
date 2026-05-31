import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx"; 
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Learn from "./pages/Learn.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";

import Navbar from "./components/Navbar.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

const App = () => {
  const { user, getMe, checkingAuth } = useAuthStore();

  // runs once when app first loads
  // checks if user is already logged in via cookie
  useEffect(() => {
    getMe();
  }, [getMe]);


  // show spinner while checking auth
  // this prevents the login page from flashing before redirect
  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* navbar shows on every page */}
      <Navbar />

      <Routes>
        {/* ── PUBLIC ROUTES ── */}
        {/* anyone can visit these */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        {/* ── AUTH ROUTES ── */}
        {/* if already logged in redirect to home */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />

        {/* ── STUDENT ROUTES ── */}
        {/* must be logged in */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/payment/success"
          element={user ? <PaymentSuccess /> : <Navigate to="/login" />}
        />

        {/* learn page — logged in user who is enrolled */}
        {/* enrollment check happens inside the Learn component itself */}
        <Route
          path="/learn/:courseId"
          element={user ? <Learn /> : <Navigate to="/login" />}
        />

        {/* ── INSTRUCTOR ROUTES ── */}
        {/* must be instructor or admin */}
        <Route
          path="/instructor"
          element={
            user?.role === "instructor" || user?.role === "admin"
              ? <InstructorDashboard />
              : user
              ? <Navigate to="/" />        // logged in but wrong role
              : <Navigate to="/login" />   // not logged in
          }
        />

        {/* ── ADMIN ROUTES ── */}
        {/* must be admin only */}
        <Route
          path="/admin"
          element={
            user?.role === "admin"
              ? <AdminDashboard />
              : user
              ? <Navigate to="/" />        // logged in but not admin
              : <Navigate to="/login" />   // not logged in
          }
        />

        {/* ── CATCH ALL ── */}
        {/* any unknown URL goes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Toaster shows toast notifications from anywhere in the app */}
      <Toaster
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

export default App;