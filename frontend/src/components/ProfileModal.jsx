import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import authApi from "../api/auth.js";

const tabs = ["Profile", "My reports", "Security"];

export default function ProfileModal({ user, onClose, onSignOut, onSaveProfile, onChangePassword }) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profile, setProfile] = useState({ name: user.name, college: user.college, collegeId: user.collegeId });
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    if (activeTab !== "My reports") return;
    authApi.myListings().then(setReports).catch((loadError) => setError(loadError.message));
  }, [activeTab]);

  function updateProfileField(event) {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const savedUser = await onSaveProfile(profile);
      setProfile({ name: savedUser.name, college: savedUser.college, collegeId: savedUser.collegeId });
      setMessage("Your profile has been saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const fields = event.currentTarget.elements;
    if (fields.newPassword.value !== fields.confirmPassword.value) {
      setError("The new passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await onChangePassword(fields.currentPassword.value, fields.newPassword.value);
      event.currentTarget.reset();
      setMessage("Your password has been changed.");
    } catch (changeError) {
      setError(changeError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop account-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal account-modal" role="dialog" aria-modal="true" aria-labelledby="profile-heading">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className="account-heading">
          <span className="account-avatar">{initials}</span>
          <div><div className="modal-kicker">Your FindIt account</div><h2 id="profile-heading">Account space</h2><p>Campus profile and settings in one place.</p></div>
        </div>
        <div className="account-tabs" role="tablist" aria-label="Account sections">
          {tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => { setActiveTab(tab); setMessage(""); setError(""); }}>{tab}</button>)}
        </div>

        {activeTab === "Profile" && (
          <form className="account-form" onSubmit={saveProfile}>
            <label>Full name<input name="name" value={profile.name} onChange={updateProfileField} required /></label>
            <label>College email<input value={user.email} readOnly /></label>
            <label>College or university<input name="college" value={profile.college} onChange={updateProfileField} required /></label>
            <label>College ID<input name="collegeId" value={profile.collegeId} onChange={updateProfileField} required /></label>
            {message && <p className="account-message success" role="status">{message}</p>}
            {error && <p className="account-message error" role="alert">{error}</p>}
            <button className="button button-primary account-action" disabled={loading}>{loading ? "Saving…" : "Save profile"}</button>
            <p className="account-note"><Icon name="shield" size={14} /> Your college email is the sign-in name for this account.</p>
          </form>
        )}

        {activeTab === "My reports" && (
          <div className="account-reports">
            {error && <p className="account-message error" role="alert">{error}</p>}
            {reports.length === 0 && !error && <div className="account-empty"><span>✳</span><b>Your campus board starts here</b><p>Items you report will appear in this section.</p></div>}
            {reports.map((report) => <article className="account-report" key={report.id}><span>{report.emoji}</span><div><b>{report.title}</b><small>{report.type} · {report.place}</small></div><i className={report.status}>{report.status}</i></article>)}
          </div>
        )}

        {activeTab === "Security" && (
          <form className="account-form" onSubmit={savePassword}>
            <div className="account-security-note"><b>Keep your account yours.</b><span>Use your current password to set a new one. Passwords are stored as secure hashes.</span></div>
            <label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required /></label>
            <label>New password<input name="newPassword" type="password" minLength="8" autoComplete="new-password" required /></label>
            <label>Confirm new password<input name="confirmPassword" type="password" minLength="8" autoComplete="new-password" required /></label>
            {message && <p className="account-message success" role="status">{message}</p>}
            {error && <p className="account-message error" role="alert">{error}</p>}
            <button className="button button-primary account-action" disabled={loading}>{loading ? "Updating…" : "Change password"}</button>
          </form>
        )}

        <div className="account-footer"><span>{user.role === "admin" ? "FindIt administrator" : "FindIt student account"}</span><button onClick={onSignOut}>Sign out</button></div>
      </section>
    </div>
  );
}
