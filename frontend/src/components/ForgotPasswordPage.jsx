import { useState } from "react";
import Icon from "./Icon.jsx";
import authApi from "../api/auth.js";

export default function ForgotPasswordPage({ onBack, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      const link = new URL(window.location.href);
      link.search = "";
      link.searchParams.set("resetToken", result.resetToken);
      link.searchParams.set("email", result.email);
      setResetLink(link.toString());
      setMessage(result.message);
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
        <h1>Reset your password</h1>
        <p className="auth-description">Enter the email address on your account to create a password reset link.</p>
        <form onSubmit={handleSubmit}>
          <label>College email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@yourcollege.edu" required /></label>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          {message && <p className="auth-message success" role="status">{message}</p>}
          {resetLink && <a className="button button-primary auth-submit auth-reset-link" href={resetLink}>Continue to reset password <Icon name="arrow" size={17} /></a>}
          {!resetLink && <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? "Preparing link…" : "Continue"} <Icon name="arrow" size={17} /></button>}
        </form>
      </section>
    </main>
  );
}
