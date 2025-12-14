import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { loginAdmin } from "../../core/services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password eye toggle
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
  });
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
    
    <div className="login-root">
      {/* LEFT PANEL */}
      <aside className="left-panel">
        <div className="left-card">
          <h1 className="left-title">
            Advancing knowledge <br />
             through impactful 
              publications.
          </h1>

          <div className="left-image-wrap">
            <img
              src={`${IMG_BASE}journals-bg.png`}
              alt="people"
              className="left-image"
            />
          </div>

          <p className="left-sub">
            Effortlessly manage your research, streamline submissions, and showcase your work globally.
          </p>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="right-panel">
        <div className="form-wrap">
          <div className="">
            <div className="login-brand">
        <img src={`${IMG_BASE}image.png`} alt="brand" />
        <h1>SCICURE PUBLICATIONS</h1>
      </div>
          </div>

          <h2 className="signin-title mt-5">Sign In</h2>
          <p className="signin-sub">Please enter your details to sign in</p>

          <form className="login-form" onSubmit={onSubmit}>
            {/* Email */}
            <label className="form-label">Email ID</label>
            <div className="input-with-icon">
              <input
                type="email"
                required
                value={email}
                className="login-input"
                placeholder="Enter your Email ID"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <input
                type={passwordVisibility.password ? "text" : "password"}
                required
                value={password}
                className="login-input"
                placeholder="Enter your Password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => togglePasswordVisibility("password")}
                aria-label="toggle password visibility"
              >
              </button>
            </div>

            {error && <div className="error-text">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="copyright">
            Copyright © 2025 - Richh MindX AI
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
