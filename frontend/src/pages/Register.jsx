import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ================================
  // NORMAL REGISTRATION
  // ================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      const { token, ...user } = response.data;

      login(user, token);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // GOOGLE REGISTRATION
  // ================================

  const handleGoogleRegister = async (
    credentialResponse
  ) => {
    setError("");
    setLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error(
          "Google credential was not received."
        );
      }

      const response = await API.post(
        "/auth/google",
        {
          credential:
            credentialResponse.credential,
        }
      );

      const { token, ...user } = response.data;

      login(user, token);

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Google registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Google sign-up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "Google sign-up was cancelled or failed. Please try again."
    );
  };

  return (
    <div className="auth-page">

      {/* Background decoration */}

      <div className="auth-background-circle auth-circle-one"></div>

      <div className="auth-background-circle auth-circle-two"></div>

      <div className="auth-container">

        {/* Brand */}

        <div className="auth-brand">

          <div className="auth-logo">
            ✓
          </div>

          <div>
            <h1>
              TaskFlow
            </h1>

            <p>
              Productivity workspace
            </p>
          </div>

        </div>

        {/* Register Card */}

        <div className="auth-card">

          <div className="auth-header">

            <span className="auth-eyebrow">
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Start organizing your work with TaskFlow.
            </p>

          </div>

          {/* Registration Form */}

          <form onSubmit={handleRegister}>

            {/* Name */}

            <div className="auth-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  👤
                </span>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />

              </div>

            </div>

            {/* Email */}

            <div className="auth-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  @
                </span>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* Password */}

            <div className="auth-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ●
                </span>

                <input
                  id="register-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
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
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            <p className="password-hint">
              Password must be at least 6 characters.
            </p>

            {/* Confirm Password */}

            <div className="auth-field">

              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ●
                </span>

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
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

            {/* Create Account */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>

                  Creating account...
                </>
              ) : (
                "Create account"
              )}

            </button>

          </form>

          {/* Divider */}

          <div className="auth-divider">

            <span></span>

            <p>
              OR
            </p>

            <span></span>

          </div>

          {/* Google Sign Up */}

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Login Link */}

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
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

export default Register;