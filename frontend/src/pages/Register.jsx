import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { GraduationCap, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(name, email, password, role);
    const { user } = useAuthStore.getState();
    if (user) navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      {/* background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-2xl">
            Learn<span className="text-emerald-500">ify</span>
          </span>
        </div>

        {/* card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-7">Start your learning journey today</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-all">
                <User className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="bg-transparent outline-none text-white text-sm placeholder-gray-600 w-full"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-all">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-transparent outline-none text-white text-sm placeholder-gray-600 w-full"
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-all">
                <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="bg-transparent outline-none text-white text-sm placeholder-gray-600 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* role selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                    ${role === "student"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                >
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-sm font-medium">Learn</span>
                  <span className="text-xs opacity-70">I'm a student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                    ${role === "instructor"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Teach</span>
                  <span className="text-xs opacity-70">I'm an instructor</span>
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-bold rounded-xl py-3 mt-2 hover:bg-emerald-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          By signing up you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Register;