import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../api/axios";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

      console.log(
        "Password reset response:",
        response.data
      );

      setSuccess(true);
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Password reset failed. Please request a new reset link."
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

        {/* Reset Password Card */}

        <div className="auth-card">

          {!success ? (
            <>
              <div className="auth-header">

                <span className="auth-eyebrow">
                  NEW PASSWORD
                </span>

                <h2>
                  Create a new password
                </h2>

                <p>
                  Enter a new password for your
                  TaskFlow account.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                {/* New password */}

                <div className="auth-field">

                  <label htmlFor="new-password">
                    New password
                  </label>

                  <div className="password-wrapper">

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Create a new password"
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

                {/* Confirm password */}

                <div className="auth-field">

                  <label htmlFor="confirm-password">
                    Confirm new password
                  </label>

                  <div className="password-wrapper">

                    <input
                      id="confirm-password"
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
                      placeholder="Confirm your new password"
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

                    <span>!</span>

                    <p>
                      {error}
                    </p>

                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  className="auth-primary-button"
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span className="auth-spinner"></span>
                      Updating password...
                    </>
                  ) : (
                    "Create new password"
                  )}

                </button>

              </form>
            </>
          ) : (
            <div className="auth-header">

              <span className="auth-eyebrow">
                PASSWORD UPDATED
              </span>

              <h2>
                Password reset successful
              </h2>

              <p>
                Your password has been changed
                successfully. You can now sign in
                with your new password.
              </p>

              <button
                type="button"
                className="auth-primary-button"
                onClick={() =>
                  navigate("/login")
                }
                style={{
                  marginTop: "24px",
                }}
              >
                Sign in
              </button>

            </div>
          )}

        </div>

        {/* Footer */}

        <p className="auth-footer">
          © 2026 TaskFlow · Stay focused. Get things done.
        </p>

      </div>

    </div>
  );
}

export default ResetPassword;