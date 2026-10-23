import { useState } from "react";
import Icon from "./Icon.jsx";

export default function LoginPage({ onBack, onRegister, onForgot, onSubmit, initialEmail = "" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const fields = event.currentTarget.elements;
    try {
      await onSubmit(fields.email.value, fields.password.value);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onBack}>← Back to FindIt</button>
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"><Icon name="search" /></span>
          <span>find<span className="brand-accent">it</span><small>STUDENT COMMUNITY</small></span>
        </div>
        <div className="auth-kicker">Welcome back</div>
        <h1>Sign in to FindIt</h1>
        <p className="auth-description">Sign in with your college email to browse and post campus listings.</p>
        <form onSubmit={handleSubmit}>
          <label>
            College email
            <input name="email" type="email" autoComplete="email" placeholder="name@yourcollege.edu" defaultValue={initialEmail} required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" minLength="8" required />
          </label>
          <button className="auth-forgot" type="button" onClick={() => onForgot(initialEmail)}>Forgot password?</button>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"} <Icon name="arrow" size={17} />
          </button>
        </form>
        <p className="auth-switch">First time here? <button onClick={onRegister}>Create a student account</button></p>
        <p className="auth-footnote"><Icon name="shield" size={15} /> College email formats vary by school.</p>
      </section>
    </main>
  );
}
