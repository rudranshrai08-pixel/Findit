import { useState } from "react";
import Icon from "./Icon.jsx";
import authApi from "../api/auth.js";

export default function ResetPasswordPage({ onBack, onComplete, token, email }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const fields = event.currentTarget.elements;
    if (fields.password.value !== fields.confirmPassword.value) {
      setError("The passwords do not match. Check them and try again.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, email, fields.password.value);
      onComplete();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onBack}>← Back to sign in</button>
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark"><Icon name="search" /></span><span>find<span className="brand-accent">it</span><small>STUDENT COMMUNITY</small></span></div>
        <div className="auth-kicker">Account help</div>
        <h1>Choose a new password</h1>
        <p className="auth-description">Create a new password for {email || "your account"}.</p>
        <form onSubmit={handleSubmit}>
          <label>New password<input name="password" type="password" autoComplete="new-password" minLength="8" placeholder="At least 8 characters" required /></label>
          <label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" placeholder="Enter it again" required /></label>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? "Saving password…" : "Save new password"} <Icon name="arrow" size={17} /></button>
        </form>
      </section>
    </main>
  );
}
