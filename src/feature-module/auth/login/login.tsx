import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { loginAdmin } from "../../../core/services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
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

    if (!identifier || !password) {
      setError("Please enter identifier and password");
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const token = await loginAdmin(identifier, password);

        if (!token) {
          setError("Invalid credentials");
          setLoading(false);
          return;
        }

        localStorage.setItem("authToken", token);
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
            Empowering people <br />
            through seamless HR <br />
            management.
          </h1>

          <div className="left-image-wrap">
            <img
              src={`${IMG_BASE}login.png`}
              alt="people"
              className="left-image"
            />
          </div>

          <p className="left-sub">
            Efficiently manage your workforce, streamline operations
            effortlessly.
          </p>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="right-panel">
        <div className="form-wrap">
          <div className="brand-top text-center mb-2">
            <img
              src={`${IMG_BASE}logo.png`}
              alt="logo"
              style={{ width: 200, height: 70 }}
            />
          </div>

          <h2 className="signin-title mt-5">Sign In</h2>
          <p className="signin-sub">Please enter your details to sign in</p>

          <form className="login-form" onSubmit={onSubmit}>
            {/* IDENTIFIER */}
            <label className="form-label">User ID</label>
            <div className="input-with-icon">
              <input
                type="text"
                required
                value={identifier}
                className="login-input"
                placeholder="Enter your User ID"
                onChange={(e) => setIdentifier(e.target.value)}
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
