import { useState } from "react";
import Icon from "./Icon.jsx";

export default function ItemDetailModal({ item, onClose, onContact, onSubmitClaim }) {
  const [contact, setContact] = useState(null);
  const [contactError, setContactError] = useState("");
  const [loadingContact, setLoadingContact] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimSent, setClaimSent] = useState(false);
  const [claimDetails, setClaimDetails] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const canSubmitClaim = item.type === "Found" && /^[a-f\d]{24}$/i.test(String(item.id));

  async function requestContact() {
    setContactError("");
    setLoadingContact(true);
    try {
      setContact(await onContact());
    } catch (error) {
      setContactError(error.message);
    } finally {
      setLoadingContact(false);
    }
  }

  async function submitClaim(event) {
    event.preventDefault();
    setClaimError("");
    setClaimLoading(true);
    try {
      await onSubmitClaim(claimDetails.trim());
      setClaimSent(true);
      setClaimOpen(false);
    } catch (error) {
      setClaimError(error.message);
    } finally {
      setClaimLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-heading">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className={"detail-art " + item.color}>
          {item.photo ? <img className="detail-photo" src={item.photo} alt={item.title} /> : <span>{item.emoji}</span>}
          <span className={"type-pill " + item.type.toLowerCase()}>{item.type === "Lost" ? "Looking for" : "Found"}</span>
        </div>
        <div className="detail-content">
          <div className="card-meta"><span>{item.category}</span><span className="meta-dot" /><span>{item.date}</span></div>
          <h2 id="detail-heading">{item.title}</h2>
          <p>{item.details}</p>
          <div className="detail-place"><Icon name="pin" size={17} />{item.place}</div>
          <button className="button button-primary submit-button" onClick={requestContact} disabled={loadingContact}>
            {loadingContact ? "Finding poster…" : "Contact poster"} <Icon name="arrow" size={17} />
          </button>
          {contactError && <p className="contact-error" role="alert">{contactError}</p>}
          {contact && <div className="contact-card"><span>Poster · {contact.name}</span><a href={"mailto:" + contact.email + "?subject=" + encodeURIComponent("FindIt: " + contact.title)}>{contact.email}</a></div>}
          {canSubmitClaim && (
            <section className="private-claim-box" aria-label="Private ownership claim">
              <div className="private-claim-heading"><span>🔒</span><div><b>Think this item is yours?</b><small>Send the reporter a private ownership detail.</small></div></div>
              {claimSent ? (
                <p className="claim-inline-success" role="status">Your private claim has been sent. You can follow its status under Matches &amp; claims.</p>
              ) : claimOpen ? (
                <form onSubmit={submitClaim} className="private-claim-form">
                  <label htmlFor="claim-details">What detail can help verify it belongs to you?</label>
                  <textarea
                    id="claim-details"
                    value={claimDetails}
                    onChange={(event) => setClaimDetails(event.target.value)}
                    minLength={12}
                    maxLength={1000}
                    rows={3}
                    required
                    placeholder="Share a detail not shown in the public listing, such as a mark, contents, or identifying feature."
                  />
                  <small>Only the person who posted this found item can see your response.</small>
                  {claimError && <p className="contact-error" role="alert">{claimError}</p>}
                  <div className="claim-form-actions">
                    <button type="button" className="button button-quiet" onClick={() => setClaimOpen(false)}>Cancel</button>
                    <button className="button button-primary" disabled={claimLoading}>{claimLoading ? "Sending…" : "Send private claim"}</button>
                  </div>
                </form>
              ) : (
                <>
                  <p>Keep one identifying detail private here. It is not shown on the public campus board.</p>
                  <button className="button button-outline claim-start-button" onClick={() => setClaimOpen(true)}>Make a private claim</button>
                </>
              )}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}