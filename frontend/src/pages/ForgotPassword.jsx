import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setMessage(
        response.data.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            <h1>TaskFlow</h1>

            <p>
              Productivity workspace
            </p>
          </div>

        </div>

        {/* Forgot Password Card */}

        <div className="auth-card">

          <div className="auth-header">

            <span className="auth-eyebrow">
              PASSWORD RECOVERY
            </span>

            <h2>
              Forgot your password?
            </h2>

            <p>
              Enter your email address and we'll
              send you a secure password reset link.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="auth-field">

              <label htmlFor="forgot-email">
                Email address
              </label>

              <input
                id="forgot-email"
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

            {/* Error */}

            {error && (
              <div className="auth-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* Success */}

            {message && (
              <div className="auth-success">

                <span>✓</span>

                <p>
                  {message}
                </p>

              </div>
            )}

            {/* Send reset link */}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>

                  Sending...
                </>
              ) : (
                "Send reset link"
              )}

            </button>

          </form>

          {/* Back to login */}

          <div className="auth-switch">

            <span>
              Remember your password?
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

export default ForgotPassword;