import Icon from "./Icon.jsx";

export default function LoginPage({ onBack, onRegister, onSubmit }) {
  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onBack}>
        ← Back to FindIt
      </button>
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <Icon name="search" />
          </span>
          <span>
            find<span className="brand-accent">it</span>
            <small>STUDENT COMMUNITY</small>
          </span>
        </div>
        <div className="auth-kicker">Welcome back</div>
        <h1>Sign in to FindIt</h1>
        <p className="auth-description">
          Sign in with your college email to browse and post campus listings.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(
              "Sign-in needs the FindIt authentication service to be connected.",
            );
          }}
        >
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
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              minLength="8"
              required
            />
          </label>
          <button className="button button-primary auth-submit" type="submit">
            Sign in <Icon name="arrow" size={17} />
          </button>
        </form>
        <p className="auth-switch">
          First time here?{" "}
          <button onClick={onRegister}>Create a student account</button>
        </p>
        <p className="auth-footnote">
          <Icon name="shield" size={15} /> Student accounts use college email
          and ID.
        </p>
      </section>
    </main>
  );
}
