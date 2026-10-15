import Icon from "./Icon.jsx";

export default function RegisterPage({ onBack, onLogin, onSubmit }) {
  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onBack}>
        ← Back to FindIt
      </button>
      <section className="auth-card auth-card-register">
        <div className="auth-brand">
          <span className="brand-mark">
            <Icon name="search" />
          </span>
          <span>
            find<span className="brand-accent">it</span>
            <small>STUDENT COMMUNITY</small>
          </span>
        </div>
        <div className="auth-kicker">Join your campus</div>
        <h1>Create your account</h1>
        <p className="auth-description">
          Register with your college details to join the FindIt community.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const fields = event.currentTarget.elements;
            if (fields.password.value !== fields.confirmPassword.value) {
              onSubmit("The passwords do not match.");
              return;
            }
            onSubmit(
              "Student email and ID verification need the FindIt authentication service to be connected.",
            );
          }}
        >
          <label>
            Full name
            <input
              name="name"
              autoComplete="name"
              placeholder="Your full name"
              required
            />
          </label>
          <label>
            College email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              pattern=".+@college\.edu"
              title="Use your @college.edu address"
              required
            />
          </label>
          <label>
            College ID
            <input
              name="collegeId"
              autoComplete="off"
              placeholder="Your student or college ID"
              minLength="4"
              required
            />
          </label>
          <div className="auth-form-row">
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength="8"
                required
              />
            </label>
            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                minLength="8"
                required
              />
            </label>
          </div>
          <p className="auth-verification-note">
            <Icon name="shield" size={16} /> Student status must be verified
            using the college email and ID before account access is enabled.
          </p>
          <button className="button button-primary auth-submit" type="submit">
            Create account <Icon name="arrow" size={17} />
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <button onClick={onLogin}>Sign in</button>
        </p>
      </section>
    </main>
  );
}
