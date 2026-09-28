import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", height_cm: "", age: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(form.username.trim(), form.password);
      } else {
        await register({
          username: form.username.trim(),
          password: form.password,
          height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
          age: form.age ? parseInt(form.age, 10) : undefined,
        });
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="eyebrow">VITALS</div>
        <h1 className="page-title">
          {mode === "login" ? "Welcome back" : "Create account"}
          <span className="cursor-blink" />
        </h1>

        <div className="tile" style={{ marginTop: 20 }}>
          {error ? <div className="form-error">{error}</div> : null}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" value={form.username} onChange={handleChange} required autoComplete="username" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" value={form.password}
                onChange={handleChange} required minLength={mode === "register" ? 8 : undefined}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "register" ? (
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="height_cm">Height (cm)</label>
                  <input id="height_cm" name="height_cm" type="number" step="0.1" value={form.height_cm} onChange={handleChange} placeholder="optional" />
                </div>
                <div className="field">
                  <label htmlFor="age">Age</label>
                  <input id="age" name="age" type="number" value={form.age} onChange={handleChange} placeholder="optional" />
                </div>
              </div>
            ) : null}

            <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
            </button>
          </form>
        </div>

        <div className="auth-switch">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Create an account" : "Log in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
