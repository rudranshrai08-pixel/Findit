import { useState } from "react";
import Icon from "./Icon.jsx";

export default function ItemDetailModal({ item, onClose, onContact }) {
  const [contact, setContact] = useState(null);
  const [contactError, setContactError] = useState("");
  const [loadingContact, setLoadingContact] = useState(false);

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

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-heading">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className={`detail-art ${item.color}`}>
          {item.photo ? <img className="detail-photo" src={item.photo} alt={item.title} /> : <span>{item.emoji}</span>}
          <span className={`type-pill ${item.type.toLowerCase()}`}>{item.type === "Lost" ? "Looking for" : "Found"}</span>
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
          {contact && <div className="contact-card"><span>Poster · {contact.name}</span><a href={`mailto:${contact.email}?subject=${encodeURIComponent(`FindIt: ${contact.title}`)}`}>{contact.email}</a></div>}
        </div>
      </section>
    </div>
  );
}
