import { useState } from "react";
import Icon from "./Icon.jsx";

export default function RegisterPage({ onBack, onLogin, onSubmit }) {
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
      await onSubmit({
        name: fields.name.value,
        college: fields.college.value,
        email: fields.email.value,
        collegeId: fields.collegeId.value,
        password: fields.password.value,
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onBack}>← Back to FindIt</button>
      <section className="auth-card auth-card-register">
        <div className="auth-brand">
          <span className="brand-mark"><Icon name="search" /></span>
          <span>find<span className="brand-accent">it</span><small>STUDENT COMMUNITY</small></span>
        </div>
        <div className="auth-kicker">Join your campus</div>
        <h1>Create your account</h1>
        <p className="auth-description">Register with your college details to join the FindIt community.</p>
        <form onSubmit={handleSubmit}>
          <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" required /></label>
          <label>College or university<input name="college" placeholder="Your college or university" required /></label>
          <label>College email<input name="email" type="email" autoComplete="email" placeholder="name@yourcollege.edu" required /></label>
          <label>College ID<input name="collegeId" autoComplete="off" placeholder="Your student or college ID" minLength="4" required /></label>
          <div className="auth-form-row">
            <label>Password<input name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength="8" required /></label>
            <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter password" minLength="8" required /></label>
          </div>
          <p className="auth-verification-note"><Icon name="shield" size={16} /> Email and college ID are saved with your account. Student status is not verified automatically.</p>
          {error && <p className="auth-message error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"} <Icon name="arrow" size={17} />
          </button>
        </form>
        <p className="auth-switch">Already registered? <button onClick={onLogin}>Sign in</button></p>
      </section>
    </main>
  );
}
