import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear login fields whenever the Login page is opened/refreshed
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  }, []);

  // ======================================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ======================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, ...user } = response.data;

      login(user, token);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GOOGLE LOGIN
  // ======================================================

  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error(
          "Google credential was not received."
        );
      }

      const response = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const { token, ...user } = response.data;

      login(user, token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        err.response?.data?.message ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "Google sign-in was cancelled or failed. Please try again."
    );
  };

  return (
    <div className="auth-page">

      {/* Background decoration */}

      <div className="auth-background-circle auth-circle-one"></div>

      <div className="auth-background-circle auth-circle-two"></div>

      <div className="auth-container">

        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="auth-brand">

          <div className="auth-logo">
            ✓
          </div>

          <div>
            <h1>TaskFlow</h1>

            <p>
              Productivity workspace
            </p>
          </div>

        </div>

        {/* ==================================================
            LOGIN CARD
        ================================================== */}

        <div className="auth-card">

          <div className="auth-header">

            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>
              Sign in to TaskFlow
            </h2>

            <p>
              Stay organized and keep your work moving forward.
            </p>

          </div>

          {/* ==================================================
              EMAIL / PASSWORD FORM
          ================================================== */}

          <form
            onSubmit={handleLogin}
            autoComplete="off"
          >

            {/* Email */}

            <div className="auth-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                name="login-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                required
              />

            </div>

            {/* Password */}

            <div className="auth-field">

              <div className="auth-label-row">

                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    navigate("/forgot-password")
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="password-wrapper">

                <input
                  id="login-password"
                  name="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="auth-error">

                <span>
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* Login button */}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>

                  Signing in...
                </>
              ) : (
                "Sign in"
              )}

            </button>

          </form>

          {/* ==================================================
              DIVIDER
          ================================================== */}

          <div className="auth-divider">

            <span></span>

            <p>
              OR
            </p>

            <span></span>

          </div>

          {/* ==================================================
              GOOGLE LOGIN
          ================================================== */}

          <div className="google-login-button">

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />

          </div>

          {/* ==================================================
              REGISTER
          ================================================== */}

          <div className="auth-register">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create an account
            </button>

          </div>

        </div>

        {/* Footer */}

        <p className="auth-footer">
          © 2026 TaskFlow · Stay focused. Get things done.
        </p>

      </div>

    </div>
  );
}

export default Login;