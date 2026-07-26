import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  loginWithGoogle,
  loginUser,
  registerUser,
} from "../services/authApi.js";

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === "register";

  const changeMode = (newMode) => {
    setMode(newMode);
    setError("");

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const finishAuthentication = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/admin");
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setError("");

    try {
      setIsSubmitting(true);
      finishAuthentication(await loginWithGoogle(credential));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isRegistering && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (isRegistering && form.password.length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = isRegistering
        ? await registerUser({
            name: form.name,
            email: form.email,
            password: form.password,
          })
        : await loginUser({
            email: form.email,
            password: form.password,
          });

      finishAuthentication(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-label">Restaurant administration</p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Login
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={mode === "register" ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Register
          </button>
        </div>

        <h1>{isRegistering ? "Create account" : "Welcome back"}</h1>

        <p className="auth-description">
          {isRegistering
            ? "Create a restaurant staff account."
            : "Log in to manage your restaurant."}
        </p>

        <div className="google-auth">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in was cancelled or failed")}
            shape="rectangular"
            size="large"
            text={isRegistering ? "signup_with" : "signin_with"}
            width="350"
          />
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {error && (
          <p className="form-message form-error" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete={
                isRegistering ? "new-password" : "current-password"
              }
              minLength={isRegistering ? 8 : undefined}
              required
            />
          </label>

          {isRegistering && (
            <label>
              Confirm password
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength="8"
                required
              />
            </label>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
