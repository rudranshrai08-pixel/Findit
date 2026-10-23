import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { send } from "../api/auth.js";
import "./admin.css";

const sections = ["Overview", "Listings", "Accounts", "Admin notes"];

export default function AdminDashboard({ user, onBack }) {
  const [activeSection, setActiveSection] = useState("Overview");
  const [data, setData] = useState({ stats: {}, users: [], listings: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function loadDashboard() {
    setError("");
    setLoading(true);
    try {
      setData(await send("/api/admin/dashboard"));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

    useEffect(() => {
    let isOpen = true;
    send("/api/admin/dashboard").then((dashboard) => {
      if (isOpen) setData(dashboard);
    }).catch((loadError) => {
      if (isOpen) setError(loadError.message);
    }).finally(() => {
      if (isOpen) setLoading(false);
    });
    return () => { isOpen = false; };
  }, []);

  async function updateListing(listing) {
    setBusyId(listing.id);
    setError("");
    try {
      await send(`/api/admin/listings/${listing.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: listing.status === "active" ? "hidden" : "active" }),
      });
      await loadDashboard();
    } catch (actionError) {
      setError(actionError.message);
      setBusyId("");
    }
  }

  async function updateRole(account) {
    setBusyId(account.id);
    setError("");
    try {
      await send(`/api/admin/users/${account.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: account.role === "admin" ? "student" : "admin" }),
      });
      await loadDashboard();
    } catch (actionError) {
      setError(actionError.message);
      setBusyId("");
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="admin-brand" href="#admin-top" onClick={(event) => event.preventDefault()}><span className="admin-brand-mark"><Icon name="search" size={19} /></span><span>find<span>it</span><small>CAMPUS CONTROL ROOM</small></span></a>
        <div className="admin-top-actions"><span className="admin-identity">{user.name} · Admin</span><button className="admin-back" onClick={onBack}>Back to FindIt <Icon name="arrow" size={15} /></button></div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-side-label">Workspace</div>
          {sections.map((section) => <button key={section} className={activeSection === section ? "admin-nav active" : "admin-nav"} onClick={() => setActiveSection(section)}><span>{sectionIcon(section)}</span>{section}</button>)}
          <div className="admin-sidebar-note"><span>✳</span><b>Campus pulse</b><small>Keep useful finds visible and student details protected.</small></div>
        </aside>
        <section className="admin-content" id="admin-top">
          <div className="admin-page-heading"><div><div className="admin-eyebrow">FindIt · Administration</div><h1>{sectionHeading(activeSection)}</h1><p>{sectionDescription(activeSection)}</p></div><button className="admin-refresh" onClick={() => { setLoading(true); loadDashboard(); }} disabled={loading}>Refresh <span>↻</span></button></div>
          {error && <div className="admin-error" role="alert">{error}</div>}
          {loading ? <div className="admin-loading">Gathering the campus signal…</div> : (
            <>
              {activeSection === "Overview" && <Overview data={data} setSection={setActiveSection} />}
              {activeSection === "Listings" && <Listings listings={data.listings} onUpdate={updateListing} busyId={busyId} />}
              {activeSection === "Accounts" && <Accounts users={data.users} currentUser={user} onUpdate={updateRole} busyId={busyId} />}
              {activeSection === "Admin notes" && <AdminNotes email={user.email} />}
            </>
          )}
        </section>
      </div>
      <footer className="admin-footer"><span>FindIt campus desk</span><span>Account and listing controls are protected by server-side role checks.</span></footer>
    </main>
  );
}

function sectionIcon(section) {
  return { Overview: "◫", Listings: "⌕", Accounts: "◎", "Admin notes": "✳" }[section];
}

function sectionHeading(section) {
  return { Overview: "A clearer campus picture", Listings: "Community listings", Accounts: "Student accounts", "Admin notes": "Admin settings" }[section];
}

function sectionDescription(section) {
  return {
    Overview: "A small, useful view of the FindIt community today.",
    Listings: "Review the posts students have shared with the campus.",
    Accounts: "See registered accounts and manage administrator access.",
    "Admin notes": "The important controls behind this workspace.",
  }[section];
}

function Overview({ data, setSection }) {
  const stats = [
    ["Student accounts", data.stats.totalUsers || 0, "People with a FindIt login", "◎"],
    ["Campus listings", data.stats.totalListings || 0, "Posts submitted by students", "⌕"],
    ["Visible to campus", data.stats.activeListings || 0, "Listings students can browse", "↗"],
    ["Hidden for review", data.stats.hiddenListings || 0, "Posts paused by an admin", "◌"],
  ];
  return (
    <>
      <div className="admin-welcome"><div><span className="admin-eyebrow">A little help goes a long way</span><h2>Good finds need a good <em>campus desk.</em></h2><p>Use this space to keep listings useful, manage access, and help the community feel cared for.</p></div><div className="admin-orbit"><span>✳</span><b>F</b><i>+</i></div></div>
      <div className="admin-stat-grid">{stats.map(([label, value, note, icon]) => <article className="admin-stat" key={label}><div><span>{label}</span><i>{icon}</i></div><b>{value}</b><small>{note}</small></article>)}</div>
      <div className="admin-overview-grid"><section className="admin-panel"><div className="admin-panel-head"><div><span className="admin-eyebrow">Latest activity</span><h3>Recent listings</h3></div><button onClick={() => setSection("Listings")}>Manage all →</button></div>{data.listings.length === 0 ? <EmptyCopy>New student posts will appear here.</EmptyCopy> : data.listings.slice(0, 4).map((listing) => <div className="admin-mini-row" key={listing.id}><span className="admin-mini-emoji">{listing.emoji}</span><div><b>{listing.title}</b><small>{listing.type} · {listing.place}</small></div><span className={`admin-status ${listing.status}`}>{listing.status}</span></div>)}</section><section className="admin-panel admin-quick-panel"><span className="admin-eyebrow">Useful next steps</span><h3>Keep the board in shape</h3><p>Hide a post if details need review. Add another trusted campus administrator when the team grows.</p><button className="admin-quick-link" onClick={() => setSection("Listings")}>Review listings <span>→</span></button><button className="admin-quick-link" onClick={() => setSection("Accounts")}>Manage admin access <span>→</span></button></section></div>
    </>
  );
}

function Listings({ listings, onUpdate, busyId }) {
  if (!listings.length) return <section className="admin-panel admin-empty-panel"><span>✳</span><h3>No student listings yet</h3><p>When students report a lost or found item, it will appear here for review.</p></section>;
  return <div className="admin-list-grid">{listings.map((listing) => <article className="admin-listing" key={listing.id}><div className={`admin-listing-art ${listing.color}`}>{listing.photo ? <img src={listing.photo} alt="" /> : <span>{listing.emoji}</span>}<i className={`admin-status ${listing.status}`}>{listing.status}</i></div><div className="admin-listing-body"><div className="admin-eyebrow">{listing.type} · {listing.category}</div><h3>{listing.title}</h3><p>{listing.place}</p><small>{listing.reporterName || "Community member"} · {listing.date}</small><button className="admin-outline-action" disabled={busyId === listing.id} onClick={() => onUpdate(listing)}>{busyId === listing.id ? "Saving…" : listing.status === "active" ? "Hide listing" : "Restore listing"}</button></div></article>)}</div>;
}

function Accounts({ users, currentUser, onUpdate, busyId }) {
  return <section className="admin-panel admin-accounts-panel"><div className="admin-panel-head"><div><span className="admin-eyebrow">Access register</span><h3>Student accounts</h3></div><span className="admin-count">{users.length} accounts</span></div>{users.length === 0 ? <EmptyCopy>No accounts have registered yet.</EmptyCopy> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Student</th><th>College</th><th>College ID</th><th>Access</th><th>Role control</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td><b>{account.name}</b><small>{account.email}</small></td><td>{account.college}</td><td>{account.collegeId}</td><td><span className={`admin-role ${account.role}`}>{account.role}</span></td><td>{account.id === currentUser.id ? <small className="admin-self">You · primary access</small> : <button className="admin-role-button" disabled={busyId === account.id} onClick={() => onUpdate(account)}>{busyId === account.id ? "Saving…" : account.role === "admin" ? "Remove admin" : "Make admin"}</button>}</td></tr>)}</tbody></table></div>}<p className="admin-privacy-note">College ID is visible only to administrators in this protected dashboard.</p></section>;
}

function AdminNotes({ email }) {
  return <div className="admin-notes-grid"><section className="admin-panel"><span className="admin-eyebrow">Administrator access</span><h3>Primary account</h3><p className="admin-note-email">{email}</p><p>This account receives administrator access from the local backend setting. Keep the primary account secure and avoid sharing its password.</p></section><section className="admin-panel"><span className="admin-eyebrow">Account data</span><h3>Where your details live</h3><p>Names, college, college IDs, email addresses, and listings are saved in the local MongoDB database named in the backend connection setting.</p><p>Passwords are stored as salted hashes. The original password is never shown in this dashboard or database.</p></section><section className="admin-panel"><span className="admin-eyebrow">Before launch</span><h3>Deployment checklist</h3><ul><li>Set a private production database connection.</li><li>Configure email delivery for password resets.</li><li>Use HTTPS and protect database backups.</li><li>Set the first administrator in the server environment.</li></ul></section></div>;
}

function EmptyCopy({ children }) { return <p className="admin-empty-copy">{children}</p>; }


