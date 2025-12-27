import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { loginAdmin } from "../../core/services/authService";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate(all_routes.index);
    }
  }, [navigate]);

  // Password eye toggle
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const res = await loginAdmin(email, password);
        const data = res.data;
        const token = data.token;
        const role = data.role;
        console.log(token);
        console.log(role);
        

        if (!token) {
          setError("Invalid credentials");
          setLoading(false);
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", role);
        navigate(all_routes.index);
      } catch (e) {
        setError(e?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    })();
  };
  const IMG_BASE = import.meta.env.VITE_IMAGE_BASE_URL;

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* LEFT PANEL - Hidden on mobile/tablet, visible on large screens */}
      <aside className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-[#0078A8] via-[#00467F] to-[#031E40] justify-center items-center p-10 relative text-white">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 max-w-xl text-center border border-white/20 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 leading-tight drop-shadow-md">
            Advancing knowledge <br />
             through impactful 
              publications.
          </h1>

          <div className="my-5">
            <img
              src={`${IMG_BASE}journals-bg.png`}
              alt="people"
              className="w-[110%] object-contain mx-auto"
            />
          </div>

          <p className="mt-2 text-lg font-medium opacity-95">
            Effortlessly manage your research, streamline submissions, and showcase your work globally.
          </p>
        </div>
      </aside>

      {/* RIGHT PANEL - Full width on mobile */}
      <main className="flex-1 flex justify-center items-center p-5 lg:p-10 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="flex flex-col items-center">
              <img src={`${IMG_BASE}image.png`} alt="brand" className="h-12 mb-2" />
              <h1 className="text-xl font-bold text-[#031E40]">SCICURE PUBLICATIONS</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#031E40] mb-1">Sign In</h2>
          <p className="text-gray-500 mb-6 text-sm">Please enter your details to sign in</p>

          <form className="text-left" onSubmit={onSubmit}>
            {/* Email */}
            <label className="block font-semibold mb-1.5 text-sm text-[#031E40]">Email ID</label>
            <div className="relative mb-5">
              <input
                type="email"
                required
                value={email}
                className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:border-[#0078A8] focus:ring-2 focus:ring-[#0078A8]/15 outline-none transition-all text-sm"
                placeholder="Enter your Email ID"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <label className="block font-semibold mb-1.5 text-sm text-[#031E40]">Password</label>
            <div className="relative mb-5">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:border-[#0078A8] focus:ring-2 focus:ring-[#0078A8]/15 outline-none transition-all text-sm"
                placeholder="Enter your Password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00467F] hover:text-[#003366] transition-colors"
                onClick={togglePasswordVisibility}
                aria-label="toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="w-full p-2 mb-3 bg-red-50 text-red-600 text-center rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00467F] text-white rounded-lg font-semibold hover:bg-[#031E40] disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-xs text-gray-400">
            Copyright © 2025 - Richh MindX AI
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
