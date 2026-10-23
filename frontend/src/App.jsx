import { useEffect, useState } from "react";
import Icon from "./components/Icon.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ForgotPasswordPage from "./components/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./components/ResetPasswordPage.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import listingsApi from "./api/listings.js";
import authApi from "./api/auth.js";
import ListingCard from "./components/ListingCard.jsx";
import ReportModal from "./components/ReportModal.jsx";
import ItemDetailModal from "./components/ItemDetailModal.jsx";
import initialItems, { categories } from "./data/listings.js";
import "./App.css";
import "./components/auth.css";

function App() {
  const [items, setItems] = useState(initialItems);
  const [kind, setKind] = useState("All");
  const [category, setCategory] = useState("All items");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const resetParams = new URLSearchParams(window.location.search);
  const resetToken = resetParams.get("resetToken") || "";
  const resetEmail = resetParams.get("email") || "";
  const [page, setPage] = useState(() => (resetToken ? "reset" : "login"));
  const [currentUser, setCurrentUser] = useState(null);
  const [emailForLogin, setEmailForLogin] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (resetToken) return;
    authApi.currentUser().then((user) => {
      setCurrentUser(user);
      authApi.savedIds().then((ids) => setSaved(ids)).catch(() => {});
      setPage("home");
    }).catch(() => {});
  }, [resetToken]);

  useEffect(() => {
    listingsApi.all().then((savedListings) => {
      setItems([...savedListings, ...initialItems]);
    }).catch(() => {});
  }, []);
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();
  const filteredItems = [];

  // Check each listing against the selected filters and search words.
  for (const item of items) {
    const matchesType = kind === "All" || item.type === kind;
    const matchesCategory =
      category === "All items" || item.category === category;
    const searchText =
      `${item.title} ${item.place} ${item.category} ${item.details}`.toLowerCase();
    const matchesQuery = searchText.includes(normalizedQuery);
    const matchesLocation = item.place
      .toLowerCase()
      .includes(normalizedLocation);

    if (matchesType && matchesCategory && matchesQuery && matchesLocation) {
      filteredItems.push(item);
    }
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  async function completeSignIn(email, password) {
    const result = await authApi.login(email, password);
    setCurrentUser(result.user);
    authApi.savedIds().then((ids) => setSaved(ids)).catch(() => {});
    setPage("home");
    showToast("Signed in successfully.");
  }

  async function createAccount(account) {
    await authApi.register(account);
    setEmailForLogin(account.email);
    setPage("login");
    showToast("Account created. Sign in with your new password.");
  }

  async function signOut() {
    await authApi.logout().catch(() => {});
    setCurrentUser(null);
    setShowProfile(false);
    setPage("login");
  }

  function scrollToListings() {
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleSaved(itemId) {
    const itemKey = String(itemId);
    const nextSaved = saved.includes(itemKey)
      ? saved.filter((savedId) => savedId !== itemKey)
      : [...saved, itemKey];
    setSaved(nextSaved);
    authApi.updateSavedIds(nextSaved).catch((error) => {
      setSaved(saved);
      showToast(error.message);
    });
  }

  async function addListing(newItem) {
    try {
      const savedListing = await listingsApi.create(newItem);
      setItems((currentItems) => [savedListing, ...currentItems]);
      setKind("All");
      setCategory("All items");
      setModal(null);
      scrollToListings();
      showToast("Your listing has been saved to the campus board.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (page === "login") {
    return (
      <div className="app-shell">
        <LoginPage
          initialEmail={emailForLogin}
          onBack={() => showToast("Please sign in to continue.")}
          onRegister={() => setPage("register")}
          onForgot={(email) => {
            setEmailForLogin(email || "");
            setPage("forgot");
          }}
          onSubmit={completeSignIn}
        />
        {toast && <Toast message={toast} />}
      </div>
    );
  }

  if (page === "register") {
    return (
      <div className="app-shell">
        <RegisterPage
          onBack={() => setPage("login")}
          onLogin={() => setPage("login")}
          onSubmit={createAccount}
        />
        {toast && <Toast message={toast} />}
      </div>
    );
  }

  if (page === "forgot") {
    return (
      <div className="app-shell">
        <ForgotPasswordPage onBack={() => setPage("login")} initialEmail={emailForLogin} />
      </div>
    );
  }

  if (page === "reset") {
    return (
      <div className="app-shell">
        <ResetPasswordPage
          token={resetToken}
          email={resetEmail}
          onBack={() => setPage("login")}
          onComplete={() => {
            window.history.replaceState({}, "", window.location.pathname);
            setEmailForLogin(resetEmail);
            setPage("login");
            showToast("Password updated. Sign in with your new password.");
          }}
        />
      </div>
    );
  }

  if (page === "admin" && currentUser?.role === "admin") {
    return <AdminDashboard user={currentUser} onBack={() => { listingsApi.all().then((savedListings) => setItems([...savedListings, ...initialItems])).catch(() => {}); setPage("home"); }} />;
  }

  if (page === "admin") {
    return <main className="auth-page"><section className="auth-card"><h1>Admin access required</h1><p className="auth-description">Sign in with an administrator account to open this section.</p><button className="button button-primary auth-submit" onClick={() => setPage("login")}>Return to sign in</button></section></main>;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="FindIt home">
          <span className="brand-mark">
            <Icon name="search" size={21} />
          </span>
          <span>
            find<span className="brand-accent">it</span>
            <small>STUDENT LOST & FOUND</small>
          </span>
        </a>
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenu((open) => !open)}
          aria-label="Toggle menu"
        >
          <Icon name={mobileMenu ? "close" : "menu"} />
        </button>
        <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
          <a href="#listings" onClick={() => setMobileMenu(false)}>
            Browse items
          </a>
          <a href="#how-it-works" onClick={() => setMobileMenu(false)}>
            How it works
          </a>
          <a href="#safety" onClick={() => setMobileMenu(false)}>
            Safety
          </a>
          {currentUser?.role === "admin" && (
            <button className="button button-quiet nav-login" onClick={() => setPage("admin")}>
              Admin desk
            </button>
          )}
          <button className="button button-quiet nav-login" onClick={signOut}>
            Sign out
          </button>
          <button
            className="button button-primary nav-report"
            onClick={() => setShowProfile(true)}
          >
            My account
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-spark">✳</span> A little help goes a long
              way
            </div>
            <h1>
              Lost something?
              <br />
              <span>Let’s find it.</span>
            </h1>
            <p className="hero-lede">
              Your campus community is full of good people. Search recent
              reports or post what you’re looking for — getting it back starts
              here.
            </p>
            <div className="hero-actions">
              <button
                className="button button-primary button-large"
                onClick={scrollToListings}
              >
                Browse recent items <Icon name="arrow" size={18} />
              </button>
              <button
                className="button button-quiet button-large"
                onClick={() => setModal({ type: "report" })}
              >
                <Icon name="plus" /> Report an item
              </button>
            </div>
            <div className="trust-row">
              <div className="avatar-stack">
                <span>R</span>
                <span>M</span>
                <span>A</span>
                <span>+</span>
              </div>
              <span>Small acts. Big reunions.</span>
              <span className="trust-divider" />
              <span className="trust-icon">
                <Icon name="shield" size={15} />
              </span>
              <span>Student community</span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Illustration of a lost item being found"
          >
            <div className="art-glow" />
            <div className="art-note note-one">
              <span className="note-icon">🔍</span>
              <span>
                <b>Found nearby</b>
                <small>Someone just posted</small>
              </span>
              <i>✓</i>
            </div>
            <div className="art-note note-two">
              <span className="note-icon">💛</span>
              <span>
                <b>Back where it belongs</b>
                <small>That’s the good stuff</small>
              </span>
            </div>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-object">
              <div className="object-shadow" />
              <div className="object-card">
                <span className="object-chip" />
                <span className="object-stripe" />
                <span className="object-stripe short" />
                <span className="object-emoji">🪪</span>
              </div>
              <span className="art-star star-a">✳</span>
              <span className="art-star star-b">✦</span>
              <span className="art-spark spark-a">✧</span>
              <span className="art-spark spark-b">✳</span>
            </div>
            <div className="art-caption">
              <span className="caption-icon">⌖</span>
              <span>Good things find their way home.</span>
            </div>
          </div>
          <div className="hero-search">
            <div className="search-input-wrap">
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && scrollToListings()
                }
                placeholder="What did you lose or find?"
                aria-label="Search items"
              />
            </div>
            <div className="search-separator" />
            <div className="search-input-wrap location-input">
              <Icon name="pin" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && scrollToListings()
                }
                placeholder="Where? (optional)"
                aria-label="Search by location"
              />
            </div>
            <button
              className="button button-primary search-button"
              onClick={scrollToListings}
            >
              Search <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>

        <section className="stats-strip">
          <div>
            <b>01</b>
            <span>Search recent reports</span>
          </div>
          <i />
          <div>
            <b>02</b>
            <span>Connect with your community</span>
          </div>
          <i />
          <div>
            <b>03</b>
            <span>Get your item back</span>
          </div>
          <span className="stats-aside">
            Made for the moments that matter <span>♡</span>
          </span>
        </section>

        <section className="listing-section section-wrap" id="listings">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-spark">✳</span> The community board
              </div>
              <h2>
                Recently <span>reported</span>
              </h2>
              <p>Browse items reported by your campus community.</p>
            </div>
            <button
              className="button button-outline"
              onClick={() => setModal({ type: "report" })}
            >
              <Icon name="plus" size={17} /> Report an item
            </button>
          </div>
          <div className="filter-row">
            <div className="kind-tabs" role="tablist" aria-label="Filter items">
              {["All", "Lost", "Found"].map((option) => (
                <button
                  key={option}
                  className={kind === option ? "kind-tab active" : "kind-tab"}
                  onClick={() => setKind(option)}
                >
                  {option}
                  {option === "All" && <span>{items.length}</span>}
                </button>
              ))}
            </div>
            <div className="category-filters">
              {categories.map((option) => (
                <button
                  key={option}
                  className={
                    category === option
                      ? "category-chip active"
                      : "category-chip"
                  }
                  onClick={() => setCategory(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {(query || location) && (
            <div className="results-summary">
              Showing {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "match" : "matches"}
              {query && (
                <>
                  {" "}
                  for <b>“{query}”</b>
                </>
              )}
              {location && (
                <>
                  {" "}
                  near <b>{location}</b>
                </>
              )}{" "}
              <button
                onClick={() => {
                  setQuery("");
                  setLocation("");
                }}
              >
                Clear search
              </button>
            </div>
          )}
          <div className="listing-grid">
            {filteredItems.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                isSaved={saved.some((savedId) => String(savedId) === String(item.id))}
                onSave={toggleSaved}
                onOpen={(selectedItem) =>
                  setModal({ type: "detail", item: selectedItem })
                }
              />
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="empty-state">
              <span>🔎</span>
              <h3>No matches just yet</h3>
              <p>
                Try another search or clear a filter to see more community
                posts.
              </p>
              <button
                className="button button-outline"
                onClick={() => {
                  setQuery("");
                  setLocation("");
                  setCategory("All items");
                  setKind("All");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="listing-bottom">
            <span>
              {saved.length
                ? `♡ ${saved.length} item${saved.length === 1 ? "" : "s"} saved`
                : "Have a useful lead? Share it with your campus."}
            </span>
            <button onClick={() => setModal({ type: "report" })}>
              Post a listing <Icon name="arrow" size={15} />
            </button>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-wrap">
            <div className="center-heading">
              <div className="eyebrow">
                <span className="eyebrow-spark">✳</span> Simple by design
              </div>
              <h2>
                Three steps. <span>One happy ending.</span>
              </h2>
              <p>
                FindIt makes it easy to turn a little community kindness into a
                big relief.
              </p>
            </div>
            <div className="steps-grid">
              <Step
                number="01"
                icon={
                  <>
                    <Icon name="search" size={32} />
                    <span>?</span>
                  </>
                }
                title="Search or post"
              >
                Look through recent listings, or share details about what went
                missing.
              </Step>
              <div className="step-connector">
                ································→
              </div>
              <Step number="02" icon="💬" title="Make a connection">
                Spot a match? Confirm a few details directly with the person.
              </Step>
              <div className="step-connector">
                ································→
              </div>
              <Step number="03" icon="🏠" title="Bring it home">
                Arrange a safe handoff nearby and let that lost-and-found
                feeling go.
              </Step>
            </div>
          </div>
        </section>

        <section className="safety-section section-wrap" id="safety">
          <div className="safety-icon">
            <Icon name="shield" size={30} />
          </div>
          <div className="safety-copy">
            <div className="eyebrow">A little reminder</div>
            <h2>
              Keep it kind. <span>Keep it safe.</span>
            </h2>
            <p>
              Meet in a public place, keep a detail private so you can verify
              ownership, and never share sensitive personal information in a
              listing.
            </p>
          </div>
          <button
            className="safety-link"
            onClick={() =>
              showToast("Choose a public, well-lit place for every handoff.")
            }
          >
            Read our safety tips <Icon name="arrow" size={17} />
          </button>
        </section>

        <section className="cta-section">
          <div className="cta-decoration">✳</div>
          <div className="cta-content">
            <div className="eyebrow light">
              <span>♡</span> The best finds are the ones that come back
            </div>
            <h2>
              Someone nearby
              <br />
              might have seen it.
            </h2>
            <p>Put the word out. Your community is ready to help.</p>
            <button
              className="button button-white"
              onClick={() => setModal({ type: "report" })}
            >
              Post a lost or found item <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="cta-stamp">
            GOOD
            <br />
            FINDS
            <br />
            <span>HAPPEN</span>
            <b>✳</b>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark">
              <Icon name="search" size={20} />
            </span>
            <span>
              find<span className="brand-accent">it</span>
              <small>STUDENT LOST & FOUND</small>
            </span>
          </a>
          <p>A little help goes a long way.</p>
          <nav>
            <a href="#listings">Browse</a>
            <a href="#how-it-works">How it works</a>
            <a href="#safety">Safety</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 FindIt Community</span>
          <span>
            Made with a little hope <b>♡</b>
          </span>
        </div>
      </footer>

      {modal?.type === "report" && (
        <ReportModal onClose={() => setModal(null)} onSubmit={addListing} />
      )}
      {modal?.type === "detail" && (
        <ItemDetailModal
          item={modal.item}
          onClose={() => setModal(null)}
          onContact={() => listingsApi.contact(modal.item.id)}
        />
      )}
      {showProfile && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onSignOut={signOut}
          onSaveProfile={async (profile) => {
            const result = await authApi.updateProfile(profile);
            setCurrentUser(result.user);
            return result.user;
          }}
          onChangePassword={(currentPassword, newPassword) =>
            authApi.changePassword({ currentPassword, newPassword })
          }
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

function Step({ number, icon, title, children }) {
  return (
    <div className="step-card">
      <span className="step-number">{number}</span>
      <div className="step-illustration">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="toast">
      <Icon name="check" size={17} />
      {message}
    </div>
  );
}

export default App;





